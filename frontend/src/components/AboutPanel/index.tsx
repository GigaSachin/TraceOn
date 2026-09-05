import { motion } from 'framer-motion'

interface Props {
  isVisible: boolean
  onClose: () => void
}

export function AboutPanel({ isVisible, onClose }: Props) {
  if (!isVisible) return null

  return (
    <motion.section
      className="glass-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ marginTop: '28px', padding: '32px' }}
      id="about-view"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div className="vf-section-header" style={{ marginBottom: 0 }}>
          <span className="vf-pill cyan">TRACEON ARCHITECTURE</span>
          <span className="vf-section-title">SYSTEM SPECIFICATION & ETHICAL FORENSICS</span>
        </div>
        <button className="vf-btn vf-btn-secondary vf-btn-sm" onClick={onClose}>
          CLOSE
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Biometrics */}
        <div className="glass-inset" style={{ padding: '20px' }}>
          <div className="mono text-cyan" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
            01. BIOMETRIC PIPELINE
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            TRACEON utilizes InsightFace with the <code className="text-cyan">buffalo_l</code> model to detect facial landmarks and extract a normalized 512-dimensional embedding vector. Biometric representations are processed ephemeral in-memory.
          </p>
        </div>

        {/* Visual Graph Trace */}
        <div className="glass-inset" style={{ padding: '20px' }}>
          <div className="mono text-blue" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
            02. REVERSE WEB TRACE
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Queries real public image indices via Google Lens and SerpAPI. Candidate faces are extracted, embedded, and compared using strict cosine distance metrics with calibrated thresholds.
          </p>
        </div>

        {/* Cryptographic Proof */}
        <div className="glass-inset" style={{ padding: '20px' }}>
          <div className="mono text-green" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
            03. ON-CHAIN IMMUTABILITY
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Evidence documents are serialized to deterministic canonical JSON (RFC-8785) and hashed with SHA-256. The digest is permanently registered on Base Sepolia smart contracts, ensuring tamper-evident proof.
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.04)', border: '1px solid var(--border-subtle)' }}>
        <div className="mono text-cyan" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
          🔒 ETHICAL DATA & BIOMETRIC PRIVACY DIRECTIVE
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          TRACEON never stores raw biometrics, face embeddings, or private keys on-chain. Similarity scores reflect mathematical cosine alignment and constitute forensic intelligence, not definitive legal identity claims.
        </div>
      </div>
    </motion.section>
  )
}
