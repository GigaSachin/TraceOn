import json
import os

try:
    from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
except ImportError:  # pragma: no cover - optional dependency in some environments
    def load_dotenv(*args, **kwargs):
        return False

from web3 import Web3  # pyright: ignore[reportMissingImports]


# ============================================================
# Load environment variables
# ============================================================

load_dotenv()

RPC_URL = os.getenv("BASE_SEPOLIA_RPC")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
CHAIN_ID = int(os.getenv("BASE_SEPOLIA_CHAIN_ID", "84532"))


if not RPC_URL:
    raise ValueError("BASE_SEPOLIA_RPC is missing in .env")

if not PRIVATE_KEY:
    raise ValueError("PRIVATE_KEY is missing in .env")

if not CONTRACT_ADDRESS:
    raise ValueError("CONTRACT_ADDRESS is missing in .env")


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
# Load wallet
# ============================================================

account = w3.eth.account.from_key(
    PRIVATE_KEY
)

print("Wallet:", account.address)

balance = w3.eth.get_balance(
    account.address
)

print(
    "Balance:",
    w3.from_wei(balance, "ether"),
    "ETH"
)


# ============================================================
# Load contract ABI
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
# Register Evidence
# ============================================================

def register_evidence(
    evidence_hash,
    candidate,
    decision
):
    """
    Register an evidence hash on Base Sepolia.

    Parameters:
        evidence_hash : SHA-256 hash as 64-character hex string
        candidate     : candidate/source identifier
        decision      : NO_MATCH / UNCERTAIN / POTENTIAL_MATCH

    Returns:
        Transaction hash
    """

    print("\n================================")
    print("REGISTERING EVIDENCE")
    print("================================")

    print("Evidence hash:", evidence_hash)
    print("Candidate:", candidate)
    print("Decision:", decision)


    # --------------------------------------------------------
    # Validate hash
    # --------------------------------------------------------

    evidence_hash = evidence_hash.lower().replace(
        "0x",
        ""
    )


    if len(evidence_hash) != 64:
        raise ValueError(
            "Evidence hash must contain exactly "
            "64 hexadecimal characters."
        )


    try:

        hash_bytes = bytes.fromhex(
            evidence_hash
        )

    except ValueError:

        raise ValueError(
            "Evidence hash contains invalid "
            "hexadecimal characters."
        )


    if len(hash_bytes) != 32:

        raise ValueError(
            "Evidence hash must be exactly 32 bytes."
        )


    # --------------------------------------------------------
    # Get nonce
    # --------------------------------------------------------

    nonce = w3.eth.get_transaction_count(
        account.address,
        "pending"
    )


    # --------------------------------------------------------
    # Get gas price
    # --------------------------------------------------------

    gas_price = w3.eth.gas_price

    print("\nNonce:", nonce)

    print(
        "Gas price:",
        gas_price
    )


    # --------------------------------------------------------
    # Build transaction
    # --------------------------------------------------------

    transaction = contract.functions.registerEvidence(
        hash_bytes,
        candidate,
        decision
    ).build_transaction(
        {
            "from": account.address,
            "chainId": CHAIN_ID,
            "nonce": nonce,
            "gasPrice": gas_price
        }
    )


    # --------------------------------------------------------
    # Estimate gas
    # --------------------------------------------------------

    estimated_gas = w3.eth.estimate_gas(
        transaction
    )

    transaction["gas"] = estimated_gas

    print(
        "\nEstimated gas:",
        estimated_gas
    )


    # --------------------------------------------------------
    # Estimate transaction cost
    # --------------------------------------------------------

    estimated_cost = (
        estimated_gas * gas_price
    )

    print(
        "Estimated cost:",
        w3.from_wei(
            estimated_cost,
            "ether"
        ),
        "ETH"
    )


    # --------------------------------------------------------
    # Check wallet balance
    # --------------------------------------------------------

    current_balance = w3.eth.get_balance(
        account.address
    )


    if estimated_cost > current_balance:

        raise ValueError(
            "Insufficient Base Sepolia ETH "
            "for this transaction."
        )


    # --------------------------------------------------------
    # Sign transaction
    # --------------------------------------------------------

    signed_transaction = (
        w3.eth.account.sign_transaction(
            transaction,
            private_key=PRIVATE_KEY
        )
    )


    # --------------------------------------------------------
    # Send transaction
    # --------------------------------------------------------

    print(
        "\nSending transaction..."
    )


    tx_hash = w3.eth.send_raw_transaction(
        signed_transaction.raw_transaction
    )


    tx_hash_hex = tx_hash.hex()


    print(
        "\nTransaction hash:"
    )

    print(
        tx_hash_hex
    )


    # --------------------------------------------------------
    # Wait for confirmation
    # --------------------------------------------------------

    print(
        "\nWaiting for blockchain confirmation..."
    )


    receipt = w3.eth.wait_for_transaction_receipt(
        tx_hash
    )


    # --------------------------------------------------------
    # Check transaction status
    # --------------------------------------------------------

    if receipt["status"] != 1:

        raise RuntimeError(
            "Evidence registration transaction failed."
        )


    print(
        "\n================================"
    )

    print(
        "EVIDENCE REGISTERED SUCCESSFULLY"
    )

    print(
        "================================"
    )


    print(
        "\nTransaction hash:"
    )

    print(
        tx_hash_hex
    )


    print(
        "\nBlock number:"
    )

    print(
        receipt["blockNumber"]
    )


    return tx_hash_hex


# ============================================================
# No automatic transaction here
# ============================================================
#
# IMPORTANT:
# This file is now a reusable blockchain module.
#
# Evidence will be submitted by:
#
# EvidenceBuilder
#       ↓
# SHA-256
#       ↓
# register_evidence()
#
# Therefore we intentionally do NOT put
# test transaction code here.
# ============================================================