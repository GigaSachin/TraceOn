import os
import sys
from importlib import import_module

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

VerifaiPipeline = import_module("orchestrator.pipeline").VerifaiPipeline
EvidenceBuilder = import_module("evidence.evidence").EvidenceBuilder
register_evidence = import_module("blockchain.writer").register_evidence


def main():

    print("\n========================================")
    print("             VERIFAI")
    print("   Face ID + Blockchain Verification")
    print("========================================")


    # ============================================
    # Ask for image
    # ============================================

    input_image = input(
        "\nEnter input image path: "
    ).strip().strip('"')


    if not os.path.exists(input_image):

        print(
            "\n❌ Image not found."
        )

        return


    # ============================================
    # Run pipeline
    # ============================================

    pipeline = VerifaiPipeline()

    result = pipeline.run(
        input_image,
        candidate_limit=10
    )


    if result["status"] != "SUCCESS":

        print(
            "\n❌ Pipeline could not complete."
        )

        print(
            result.get(
                "message",
                "Unknown error"
            )
        )

        return


    best = result["best_match"]


    # ============================================
    # Display final matching result
    # ============================================

    print("\n\n========================================")
    print("          VERIFAI FINAL RESULT")
    print("========================================")

    print(
        "\nCandidate:",
        best["title"]
    )

    print(
        "Source:",
        best["source"]
    )

    print(
        "Source URL:",
        best["source_url"]
    )

    print(
        "Similarity:",
        best["percentage"],
        "%"
    )

    print(
        "Decision:",
        best["decision"]
    )


    # ============================================
    # Build evidence
    # ============================================

    print(
        "\n[BLOCKCHAIN] Building evidence..."
    )

    builder = EvidenceBuilder()

    evidence = builder.build(
        candidate=best["title"],
        similarity=best["similarity"],
        decision=best["decision"],
        source_url=best["source_url"],
        image_url=best["image_url"],
        source=best["source"]
    )


    # ============================================
    # Save evidence
    # ============================================

    evidence_dir = os.path.join(
        os.path.dirname(__file__),
        "evidence"
    )

    os.makedirs(
        evidence_dir,
        exist_ok=True
    )


    evidence_path = os.path.join(
        evidence_dir,
        "latest_evidence.json"
    )


    with open(
        evidence_path,
        "w",
        encoding="utf-8"
    ) as file:

        import json

        json.dump(
            evidence["record"],
            file,
            indent=2
        )


    print(
        "[BLOCKCHAIN] SHA-256:",
        evidence["sha256"]
    )


    # ============================================
    # Submit to blockchain
    # ============================================

    tx_hash = register_evidence(
        evidence["sha256"],
        best["title"],
        best["decision"]
    )


    # ============================================
    # FINAL
    # ============================================

    print("\n\n========================================")
    print("       VERIFAI COMPLETE ✅")
    print("========================================")

    print(
        "\nDecision:",
        best["decision"]
    )

    print(
        "Similarity:",
        best["percentage"],
        "%"
    )

    print(
        "Evidence Hash:",
        evidence["sha256"]
    )

    print(
        "Transaction:",
        tx_hash
    )

    print(
        "\nEvidence saved:",
        evidence_path
    )

    print(
        "\nBlockchain verification:"
    )

    print(
        "Run: py blockchain\\verifier.py"
    )


if __name__ == "__main__":
    main()