# TRACEON — Autonomous Multimodal OSINT & Blockchain Verification Platform

TRACEON is an enterprise-grade OSINT intelligence system and tamper-proof verification pipeline that searches the public web for target individuals, performs 512-D facial feature extraction and cosine-similarity matching, and anchors cryptographic evidence onto an Ethereum-compatible blockchain registry.

---

## 🚀 Key Features

- **512-D Facial Vector Extraction:** Deep representation encoding via InsightFace / ONNX models with facial landmark alignment.
- **Multimodal Candidate Discovery:** Automated web scraping and visual search powered by Google Lens / SerpApi.
- **Calibrated Matching Engine:** Precision cosine-similarity matching with adaptive thresholding and confidence scoring.
- **Cryptographic Evidence Hashing:** SHA-256 pipeline hashing for input images, candidate metadata, and match logs.
- **Blockchain Evidence Registry:** Solidity smart contracts deployed on Ethereum Sepolia / local testnet to guarantee tamper-proof audit trails.
- **Cyberpunk UI / Cyber-OS Dashboard:** Glassmorphic interface with camera snapshot capture, live verification pipeline visualizer, match breakdown cards, and blockchain explorer links.

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Lucide React icons
- Custom CSS design system (Dark mode, responsive grid, glassmorphism)

### Backend
- FastAPI & Uvicorn (Asynchronous REST API)
- InsightFace & ONNX Runtime (Facial recognition)
- Web3.py & Ethereum Sepolia (Blockchain evidence anchoring)
- Requests & SerpApi (OSINT candidate search)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/GigaSachin/TraceOn.git
cd TraceOn
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements_api.txt

# Configure environment variables
cp .env.example .env
# Fill in SERPAPI_KEY, RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS in .env

# Run FastAPI server
python -m uvicorn backend.api:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Smart Contract

The `EvidenceRegistry.sol` smart contract is located in the [`contracts/`](./contracts) directory. It stores the SHA-256 evidence hash, similarity score, and timestamp permanently on-chain.

---

## 📄 License
MIT License
