import json
import os
from importlib import import_module

try:
    load_dotenv = import_module("dotenv").load_dotenv
except ImportError:
    def load_dotenv(*args, **kwargs):
        """Load environment variables when python-dotenv is available."""
        return False
try:
    Web3 = import_module("web3").Web3
except ImportError as exc:
    raise ImportError(
        "The Web3 dependency is missing. "
        "Install it with: python -m pip install web3"
    ) from exc

try:
    solcx = import_module("solcx")
    compile_standard = solcx.compile_standard
    install_solc = solcx.install_solc
except ImportError as exc:
    raise ImportError(
        "The Solidity compiler dependency is missing. "
        "Install it with: python -m pip install py-solc-x"
    ) from exc


# ============================================================
# Load environment variables
# ============================================================

load_dotenv()

RPC_URL = os.getenv("BASE_SEPOLIA_RPC")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CHAIN_ID = int(os.getenv("BASE_SEPOLIA_CHAIN_ID", "84532"))

if not RPC_URL:
    raise ValueError("BASE_SEPOLIA_RPC is missing in .env")

if not PRIVATE_KEY:
    raise ValueError("PRIVATE_KEY is missing in .env")


# ============================================================
# Connect to Base Sepolia
# ============================================================

w3 = Web3(Web3.HTTPProvider(RPC_URL))

print("Connected:", w3.is_connected())
print("Chain ID:", w3.eth.chain_id)

if not w3.is_connected():
    raise ConnectionError("Could not connect to Base Sepolia")

if w3.eth.chain_id != CHAIN_ID:
    raise ValueError(
        f"Wrong chain. Expected {CHAIN_ID}, got {w3.eth.chain_id}"
    )


# ============================================================
# Load wallet
# ============================================================

account = w3.eth.account.from_key(PRIVATE_KEY)

print("Wallet:", account.address)

balance = w3.eth.get_balance(account.address)

print(
    "Balance:",
    w3.from_wei(balance, "ether"),
    "ETH"
)

if balance == 0:
    raise ValueError("Wallet has no Base Sepolia ETH")


# ============================================================
# Read Solidity contract
# ============================================================

# deploy.py is here:
# verifai/backend/blockchain/deploy.py
#
# Contract is here:
# verifai/contracts/EvidenceRegistry.sol
#
# Therefore:
# blockchain -> .. -> backend
# backend    -> .. -> verifai
# verifai    -> contracts

contract_path = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "contracts",
        "EvidenceRegistry.sol"
    )
)

print("\nContract path:")
print(contract_path)

if not os.path.exists(contract_path):
    raise FileNotFoundError(
        f"EvidenceRegistry.sol not found at:\n{contract_path}"
    )

with open(contract_path, "r", encoding="utf-8") as file:
    contract_source = file.read()

print("Contract source loaded successfully!")


# ============================================================
# Install Solidity compiler
# ============================================================

print("\nInstalling Solidity compiler 0.8.20...")

install_solc("0.8.20")


# ============================================================
# Compile contract
# ============================================================

print("Compiling EvidenceRegistry.sol...")

compiled = compile_standard(
    {
        "language": "Solidity",

        "sources": {
            "EvidenceRegistry.sol": {
                "content": contract_source
            }
        },

        "settings": {
            "outputSelection": {
                "*": {
                    "*": [
                        "abi",
                        "evm.bytecode"
                    ]
                }
            }
        }
    },
    solc_version="0.8.20"
)


contract_data = compiled["contracts"]["EvidenceRegistry.sol"]["EvidenceRegistry"]

abi = contract_data["abi"]
bytecode = contract_data["evm"]["bytecode"]["object"]

if not bytecode:
    raise ValueError("Contract bytecode is empty")

print("Compilation successful!")


# ============================================================
# Create contract object
# ============================================================

contract = w3.eth.contract(
    abi=abi,
    bytecode=bytecode
)


# ============================================================
# Get transaction details
# ============================================================

nonce = w3.eth.get_transaction_count(account.address)

gas_price = w3.eth.gas_price

print("\nNonce:", nonce)
print("Gas price:", gas_price)


# ============================================================
# Build deployment transaction
# ============================================================

transaction = contract.constructor().build_transaction(
    {
        "from": account.address,
        "chainId": CHAIN_ID,
        "nonce": nonce,
        "gasPrice": gas_price,
    }
)


# ============================================================
# Estimate gas
# ============================================================

estimated_gas = w3.eth.estimate_gas(transaction)

transaction["gas"] = estimated_gas

print("Estimated gas:", estimated_gas)


# ============================================================
# Check estimated deployment cost
# ============================================================

estimated_cost = estimated_gas * gas_price

print(
    "Estimated deployment cost:",
    w3.from_wei(estimated_cost, "ether"),
    "ETH"
)

if estimated_cost > balance:
    raise ValueError(
        "Insufficient Base Sepolia ETH for deployment"
    )


# ============================================================
# Sign transaction
# ============================================================

signed_transaction = w3.eth.account.sign_transaction(
    transaction,
    private_key=PRIVATE_KEY
)


# ============================================================
# Send transaction
# ============================================================

print("\nDeploying contract to Base Sepolia...")

tx_hash = w3.eth.send_raw_transaction(
    signed_transaction.raw_transaction
)

print("\nTransaction hash:")
print(tx_hash.hex())


# ============================================================
# Wait for confirmation
# ============================================================

print("\nWaiting for blockchain confirmation...")

receipt = w3.eth.wait_for_transaction_receipt(tx_hash)


# ============================================================
# Check deployment result
# ============================================================

if receipt["status"] != 1:
    raise RuntimeError(
        "Contract deployment transaction failed"
    )

contract_address = receipt["contractAddress"]


print("\n========================================")
print("CONTRACT DEPLOYED SUCCESSFULLY")
print("========================================")

print("\nContract address:")
print(contract_address)

print("\nTransaction hash:")
print(tx_hash.hex())

print("\nBlock number:")
print(receipt["blockNumber"])


# ============================================================
# Save ABI
# ============================================================

abi_path = os.path.join(
    os.path.dirname(__file__),
    "EvidenceRegistry_abi.json"
)

with open(abi_path, "w", encoding="utf-8") as file:
    json.dump(abi, file, indent=2)

print("\nABI saved to:")
print(abi_path)


# ============================================================
# Update .env with contract address
# ============================================================

# .env is here:
# verifai/backend/.env

env_path = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".env"
    )
)

if not os.path.exists(env_path):
    raise FileNotFoundError(
        f".env file not found at:\n{env_path}"
    )

with open(env_path, "r", encoding="utf-8") as file:
    env_content = file.read()

lines = env_content.splitlines()

updated = False

for i, line in enumerate(lines):

    if line.startswith("CONTRACT_ADDRESS="):

        lines[i] = f"CONTRACT_ADDRESS={contract_address}"

        updated = True

        break


if not updated:
    lines.append(
        f"CONTRACT_ADDRESS={contract_address}"
    )


with open(env_path, "w", encoding="utf-8") as file:

    file.write(
        "\n".join(lines) + "\n"
    )


print("\nCONTRACT_ADDRESS updated in .env")

print("\n========================================")
print("DEPLOYMENT COMPLETE")
print("========================================")