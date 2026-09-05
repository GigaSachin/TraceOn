import json
import os
import sys

try:
    from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
except ImportError:  # pragma: no cover - optional dependency for local runs
    def load_dotenv(*args, **kwargs):
        return False

try:
    from web3 import Web3  # pyright: ignore[reportMissingImports]
except ImportError as exc:  # pragma: no cover - dependency is required at runtime
    raise ImportError(
        "The 'web3' package is required to run the blockchain verifier. "
        "Install it with: pip install web3"
    ) from exc


# ============================================================
# Add backend/ to Python path
# ============================================================

BACKEND_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


from evidence.evidence import EvidenceBuilder


# ============================================================
# Load environment
# ============================================================

load_dotenv()

RPC_URL = os.getenv("BASE_SEPOLIA_RPC")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
CHAIN_ID = int(
    os.getenv("BASE_SEPOLIA_CHAIN_ID", "84532")
)


if not RPC_URL:
    raise ValueError(
        "BASE_SEPOLIA_RPC is missing in .env"
    )

if not CONTRACT_ADDRESS:
    raise ValueError(
        "CONTRACT_ADDRESS is missing in .env"
    )


# ============================================================
# Connect to Base Sepolia
# ============================================================

w3 = Web3(
    Web3.HTTPProvider(RPC_URL)
)

if not w3.is_connected():
    raise ConnectionError(
        "Could not connect to Base Sepolia"
    )

print("Connected:", w3.is_connected())
print("Chain ID:", w3.eth.chain_id)


if w3.eth.chain_id != CHAIN_ID:
    raise ValueError(
        f"Wrong chain. Expected {CHAIN_ID}, "
        f"got {w3.eth.chain_id}"
    )


# ============================================================
# Load ABI
# ============================================================

abi_path = os.path.join(
    os.path.dirname(__file__),
    "EvidenceRegistry_abi.json"
)

if not os.path.exists(abi_path):
    raise FileNotFoundError(
        f"ABI not found:\n{abi_path}"
    )


with open(
    abi_path,
    "r",
    encoding="utf-8"
) as file:
    abi = json.load(file)

print("ABI loaded successfully!")


# ============================================================
# Create contract object
# ============================================================

contract = w3.eth.contract(
    address=Web3.to_checksum_address(
        CONTRACT_ADDRESS
    ),
    abi=abi
)

print("Contract:", CONTRACT_ADDRESS)


# ============================================================
# Load local evidence
# ============================================================

evidence_path = os.path.join(
    BACKEND_DIR,
    "evidence",
    "latest_evidence.json"
)

if not os.path.exists(evidence_path):
    raise FileNotFoundError(
        f"Evidence file not found:\n{evidence_path}"
    )


with open(
    evidence_path,
    "r",
    encoding="utf-8"
) as file:
    local_record = json.load(file)


print("\nLocal evidence loaded successfully!")


# ============================================================
# Recalculate SHA-256
# ============================================================

builder = EvidenceBuilder()

recalculated_hash = builder.calculate_hash(
    local_record
)


print("\n================================")
print("VERIFAI HASH VERIFICATION")
print("================================")

print("\nRecalculated SHA-256:")
print(recalculated_hash)


# ============================================================
# Read blockchain evidence
# ============================================================

evidence_count = contract.functions.evidenceCount().call()

print("\nBlockchain evidence count:")
print(evidence_count)


if evidence_count == 0:
    raise ValueError(
        "No evidence exists on blockchain"
    )


latest_id = evidence_count


blockchain_record = contract.functions.getEvidence(
    latest_id
).call()


blockchain_hash = blockchain_record[0]


# bytes32 returned by Web3
if isinstance(blockchain_hash, bytes):
    blockchain_hash = blockchain_hash.hex()


blockchain_hash = blockchain_hash.lower().replace(
    "0x",
    ""
)


# ============================================================
# Compare hashes
# ============================================================

print("\nBlockchain SHA-256:")
print(blockchain_hash)

print("\nLocal SHA-256:")
print(recalculated_hash)


if blockchain_hash == recalculated_hash:
    verification_status = "VERIFIED"
else:
    verification_status = "TAMPERED"


# ============================================================
# Final result
# ============================================================

print("\n================================")
print("VERIFICATION RESULT")
print("================================")

print("\nStatus:")
print(verification_status)

print("\nEvidence ID:")
print(latest_id)

print("\nCandidate:")
print(blockchain_record[1])

print("\nDecision:")
print(blockchain_record[2])

print("\nSubmitted By:")
print(blockchain_record[4])


if verification_status == "VERIFIED":

    print(
        "\n✅ Evidence integrity verified."
    )

else:

    print(
        "\n❌ Evidence has been modified."
    )