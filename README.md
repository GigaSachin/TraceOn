# TRACEON / VERIFAI — Face ID + Blockchain Verification Pipeline

An end-to-end multimodal intelligence and cryptographic verification pipeline that detects and encodes human faces, executes genuine reverse-image OSINT discovery across social media platforms, performs facial feature similarity matching, and anchors tamper-evident evidence onto the Base Sepolia blockchain.

---

## 🎯 Task & Functionality

1. **Face Detection & Deep Feature Encoding**:
   - Uses `InsightFace` (`buffalo_l` model) and `ONNX Runtime` to detect faces, extract 512-dimensional normalized biometric embeddings, and perform facial landmark alignment.
2. **Genuine Reverse-Image Search (OSINT)**:
   - Uses Google Lens / SerpApi to perform genuine, dynamic visual reverse-image searches across indexed web platforms (Twitter/X, LinkedIn, Instagram, VK, Facebook, Reddit, etc.) with zero hardcoded results.
3. **Calibrated Facial Verification**:
   - Calculates cosine similarity against candidate face crops with calibrated confidence thresholds to make MATCH / NO_MATCH decisions.
4. **Cryptographic Evidence Packaging**:
   - Builds canonical JSON evidence (with input hash, match score, source URL, candidate hash, timestamps) and generates a verifiable SHA-256 digest.
5. **On-Chain Blockchain Anchoring**:
   - Submits the cryptographic evidence hash to an Ethereum-compatible Solidity smart contract deployed on **Base Sepolia**, creating a permanent, tamper-evident audit record.
6. **Interactive Cyber-OS Web Interface & CLI**:
   - Provides both a standalone CLI pipeline (`backend/main.py`) and a full-featured real-time Web UI (`frontend/`) with live pipeline step visualizer, similarity gauges, and Basescan transaction links.

---

## ⛓️ Which Blockchain?

- **Blockchain Network**: **Base Sepolia Testnet** (Ethereum Layer-2)
- **Chain ID**: `84532`
- **RPC URL**: `https://sepolia.base.org`
- **Smart Contract**: `EvidenceRegistry.sol`
- **Block Explorer**: [Base Sepolia Basescan](https://sepolia.basescan.org/)
- **Data Stored On-Chain**:
  - `evidenceHash` (bytes32): Cryptographic SHA-256 fingerprint of the complete verification manifest.
  - `similarity` (uint256): Calibrated match confidence percentage.
  - `timestamp` (uint256): Immutable block timestamp.
  - `submitter` (address): Wallet address authorizing the record.

---

## 🚀 How to Run It

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ (for Web UI)
- Git

### 2. Clone & Setup Environment
```bash
git clone https://github.com/GigaSachin/TraceOn.git
cd TraceOn

# Create and activate Python virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env` and configure your credentials:
```ini
SERPAPI_KEY=your_serpapi_key
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_SEPOLIA_CHAIN_ID=84532
PRIVATE_KEY=your_evm_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
```

*(If you need to deploy a new contract instance, run: `python backend/blockchain/deploy.py`)*

---

### Option A: Run via Terminal (CLI Pipeline)
Run the full automated end-to-end verification pipeline:
```bash
python backend/main.py
```
When prompted, enter the path to the test image (e.g. `backend/test_same.jpg` or your own photo).

---

### Option B: Run via Web Dashboard (Frontend + Backend)

**Terminal 1 (Backend API):**
```bash
python -m uvicorn backend.api:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser, drag and drop an image or use camera capture, and watch the full real-time pipeline execution and blockchain transaction receipt.

---

## ⚠️ Known Limitations

1. **Reverse-Image Search Indexing & Rate Limits**:
   - Google Lens and OSINT engines index publicly crawled web images. Freshly uploaded private photos or unindexed profile pictures might yield fewer candidate matches.
   - API rate limits apply based on SerpApi quotas.
2. **Extreme Facial Angles & Extreme Lighting**:
   - Significant occlusion (masks, severe sunglasses), heavy motion blur, or low-resolution face crops (< 60x60 px) may reduce detection scores.
3. **Testnet Gas & Network Latency**:
   - On-chain submission speed depends on Base Sepolia block confirmation times (~2-4 seconds). Wallet must hold testnet ETH for gas.
4. **Biometric Drift**:
   - Significant aging, plastic surgery, or heavy cosmetic alterations can reduce cosine similarity scores below the standard match threshold.

---

## 📜 Smart Contract Architecture

The `EvidenceRegistry.sol` contract ([`contracts/EvidenceRegistry.sol`](./contracts/EvidenceRegistry.sol)) ensures:
- Tamper-proofing: Once logged, evidence hashes cannot be modified or erased.
- Queryability: Verification results can be queried at any time using `verifyEvidence(evidenceHash)` or by querying on Basescan.

---

## 📄 License
MIT License
