"""
VERIFAI — FastAPI HTTP wrapper
================================
Wraps the existing CLI pipeline into a REST API.
Does NOT modify any existing backend module.

Endpoints:
  GET  /api/health       — liveness check
  POST /api/verify       — full verification pipeline
"""

import os
import sys
import json
import io
import shutil
import traceback
import uuid
from pathlib import Path
from typing import Any

# ─── Windows UTF-8 stdout fix ────────────────────────────────────────────────
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
elif hasattr(sys.stdout, 'buffer'):
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

# ─── path setup ──────────────────────────────────────────────────────────────

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

for p in [str(BACKEND_DIR), str(PROJECT_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# ─── dotenv ──────────────────────────────────────────────────────────────────

try:
    from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    pass

# ─── FastAPI ──────────────────────────────────────────────────────────────────

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="VERIFAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tightened to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── uploads directory ───────────────────────────────────────────────────────
import tempfile

try:
    UPLOADS_DIR = BACKEND_DIR / "uploads"
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
except (PermissionError, OSError):
    UPLOADS_DIR = Path(tempfile.gettempdir()) / "verifai_uploads"
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# ─── startup warmup ──────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_warmup():
    """Pre-warm face detection models on server startup."""
    try:
        from face.encoder import FaceEncoder
        FaceEncoder()
    except Exception as exc:
        print(f"[STARTUP] Model warmup notice: {exc}")


# ─── health ──────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    contract = os.getenv("CONTRACT_ADDRESS", "not configured")
    chain_id = int(os.getenv("BASE_SEPOLIA_CHAIN_ID", "84532"))
    return {
        "status": "online",
        "chain_id": chain_id,
        "contract_address": contract,
        "network": "Base Sepolia",
    }


# ─── verify ──────────────────────────────────────────────────────────────────

@app.post("/api/verify")
async def verify(image: UploadFile = File(...)):
    """
    Full VERIFAI pipeline:
      upload → face encode → lens search → face match
      → evidence build → blockchain submit → verify
    """

    # ── 1. Save uploaded image ───────────────────────────────────────────────

    suffix = Path(image.filename or "upload.jpg").suffix or ".jpg"
    filename = f"upload_{uuid.uuid4().hex}{suffix}"
    image_path = UPLOADS_DIR / filename

    try:
        with open(image_path, "wb") as f:
            shutil.copyfileobj(image.file, f)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {exc}")

_PIPELINE = None

def _get_pipeline():
    global _PIPELINE
    if _PIPELINE is None:
        from orchestrator.pipeline import VerifaiPipeline
        _PIPELINE = VerifaiPipeline()
    return _PIPELINE

    # ── 2. Run pipeline ──────────────────────────────────────────────────────

    try:
        pipeline = _get_pipeline()
    except Exception as exc:
        _cleanup(image_path)
        raise HTTPException(status_code=500, detail=f"Pipeline initialization failed: {exc}")

    try:
        result = pipeline.run(str(image_path), candidate_limit=10)
    except ValueError as exc:
        _cleanup(image_path)
        # Face not detected
        return _error_response("NO_FACE_DETECTED", str(exc))
    except Exception as exc:
        _cleanup(image_path)
        return _error_response("PIPELINE_ERROR", str(exc))

    if result["status"] == "NO_CANDIDATES":
        _cleanup(image_path)
        return _error_response("NO_CANDIDATES", result.get("message", "No visual candidates found."))

    if result["status"] == "NO_FACE_MATCHES":
        _cleanup(image_path)
        return _error_response("NO_FACE_MATCHES", result.get("message", "No usable faces detected in candidates."))

    if result["status"] != "SUCCESS":
        _cleanup(image_path)
        return _error_response("PIPELINE_FAILED", result.get("message", "Unknown error."))

    best = result["best_match"]
    all_matches = result.get("ranked_matches", result.get("all_matches", []))

    # ── 3. Build evidence ────────────────────────────────────────────────────

    try:
        from evidence.evidence import EvidenceBuilder  # pyright: ignore
        builder = EvidenceBuilder()
        evidence = builder.build(
            candidate=best["title"],
            similarity=best["similarity"],
            decision=best["decision"],
            source_url=best.get("source_url"),
            image_url=best.get("image_url"),
            source=best.get("source"),
        )
    except Exception as exc:
        _cleanup(image_path)
        return _error_response("EVIDENCE_ERROR", f"Evidence generation failed: {exc}")

    # Save latest evidence
    try:
        evidence_path = BACKEND_DIR / "evidence" / "latest_evidence.json"
        evidence_path.parent.mkdir(parents=True, exist_ok=True)
        with open(evidence_path, "w", encoding="utf-8") as f:
            json.dump(evidence["record"], f, indent=2)
    except Exception:
        pass  # non-fatal

    # ── 4. Blockchain submission ─────────────────────────────────────────────

    blockchain_data: dict[str, Any] = {
        "network": "Base Sepolia",
        "chain_id": int(os.getenv("BASE_SEPOLIA_CHAIN_ID", "84532")),
        "contract_address": os.getenv("CONTRACT_ADDRESS", ""),
        "transaction_hash": None,
        "block_number": None,
        "submitted_by": None,
        "error": None,
    }

    tx_hash = None

    try:
        # Lazy import — blockchain writer connects at module level, so we
        # import fresh each time inside try/except to handle connection issues.
        import importlib
        writer_mod = importlib.import_module("blockchain.writer")
        importlib.reload(writer_mod)  # re-evaluate module-level init

        # Grab wallet address from the already-initialised account object
        try:
            blockchain_data["submitted_by"] = writer_mod.account.address
        except Exception:
            pass

        tx_hash = writer_mod.register_evidence(
            evidence["sha256"],
            best["title"],
            best["decision"],
        )

        blockchain_data["transaction_hash"] = tx_hash

        # Fetch block number from receipt
        try:
            w3 = writer_mod.w3
            receipt = w3.eth.get_transaction_receipt(tx_hash)
            if receipt:
                blockchain_data["block_number"] = receipt["blockNumber"]
        except Exception:
            pass

    except Exception as exc:
        blockchain_data["error"] = str(exc)
        blockchain_data["transaction_hash"] = None

    # ── 5. Verification ──────────────────────────────────────────────────────

    verification: dict[str, Any] = {
        "verified": False,
        "local_hash": evidence["sha256"],
        "blockchain_hash": None,
        "error": None,
    }

    if tx_hash:
        try:
            from web3 import Web3  # pyright: ignore
            import importlib as _il
            _writer = _il.import_module("blockchain.writer")
            contract = _writer.contract
            w3 = _writer.w3

            evidence_count = contract.functions.evidenceCount().call()
            if evidence_count > 0:
                record = contract.functions.getEvidence(evidence_count).call()
                bc_hash = record[0]
                if isinstance(bc_hash, bytes):
                    bc_hash = bc_hash.hex()
                bc_hash = bc_hash.lower().replace("0x", "")
                verification["blockchain_hash"] = bc_hash
                verification["verified"] = bc_hash == evidence["sha256"].lower()
        except Exception as exc:
            verification["error"] = str(exc)

    # ── 6. Build unified response ─────────────────────────────────────────────

    # Normalise all_matches for frontend
    candidates_out = []
    for m in all_matches:
        candidates_out.append({
            "rank": m.get("rank", 0),
            "candidate_id": m.get("candidate_id", 0),
            "title": m.get("title", ""),
            "source": m.get("source", ""),
            "source_url": m.get("source_url") or None,
            "image_url": m.get("image_url") or None,
            "similarity": m.get("similarity", 0),
            "percentage": m.get("percentage", 0),
            "decision": m.get("decision", "NO_MATCH"),
            "confidence": m.get("confidence", "LOW"),
        })

    _cleanup(image_path)

    return JSONResponse({
        "success": True,
        "error_code": None,
        "message": None,
        "decision": best["decision"],
        "similarity": best["similarity"],
        "similarity_percentage": best["percentage"],
        "face_detected": True,
        "face_count": 1,
        "det_score": None,  # not propagated through pipeline currently
        "candidate_count": len(all_matches),
        "all_candidates": candidates_out,
        "best_candidate": {
            "candidate": best["title"],
            "source": best.get("source", ""),
            "source_url": best.get("source_url") or None,
            "image_url": best.get("image_url") or None,
            "similarity": best["similarity"],
            "percentage": best["percentage"],
            "decision": best["decision"],
        },
        "evidence": evidence["record"],
        "canonical_json": evidence["canonical_json"],
        "sha256": evidence["sha256"],
        "blockchain": blockchain_data,
        "verification": verification,
    })


# ─── helpers ──────────────────────────────────────────────────────────────────

def _cleanup(path: Path):
    try:
        if path.exists():
            os.remove(path)
    except Exception:
        pass


def _error_response(error_code: str, message: str):
    return JSONResponse({
        "success": False,
        "error_code": error_code,
        "message": message,
        "decision": None,
        "similarity": None,
        "similarity_percentage": None,
        "face_detected": error_code not in ("NO_FACE_DETECTED",),
        "face_count": 0,
        "det_score": None,
        "candidate_count": 0,
        "all_candidates": [],
        "best_candidate": None,
        "evidence": None,
        "canonical_json": None,
        "sha256": None,
        "blockchain": None,
        "verification": None,
    })
