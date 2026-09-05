import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EvidenceRecord } from '../../types/verification'

interface Props {
  evidence: EvidenceRecord
  sha256: string
  canonicalJson: string
  isVisible: boolean
}

export function EvidencePanel({ evidence, sha256, canonicalJson, isVisible }: Props) {
  const [copied, setCopied] = useState(false)
  const [jsonExpanded, setJsonExpanded] = useState(false)

  if (!isVisible) return null

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(sha256)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const hashSplitA = sha256.slice(0, 32)
  const hashSplitB = sha256.slice(32)

  return (
    <motion.section
      className="vf-evidence-card"
      id="evidence-view"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ marginTop: '28px' }}
    >
      <div className="vf-section-header">
        <span className="vf-pill cyan">05 CRYPTOGRAPHY</span>
        <span className="vf-section-title">CANONICAL RFC-8785 EVIDENCE SPECIFICATION</span>
      </div>

      <div className="vf-evidence-grid">
        {/* Metadata Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="vf-telemetry-label" style={{ color: 'var(--cyan)' }}>
            DIGITAL EVIDENCE MANIFEST (SPEC V{evidence.version})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div className="vf-telemetry-label">TIMESTAMP (UTC)</div>
              <div className="mono" style={{ fontSize: '11px', color: '#FFFFFF' }}>
                {new Date(evidence.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
              </div>
            </div>

            <div>
              <div className="vf-telemetry-label">VERDICT DECISION</div>
              <div className="mono text-cyan" style={{ fontSize: '12px', fontWeight: 700 }}>
                {evidence.decision}
              </div>
            </div>
          </div>

          <div>
            <div className="vf-telemetry-label">PRIMARY EVALUATION TARGET</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', wordBreak: 'break-all' }}>
              {evidence.candidate}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div className="vf-telemetry-label">RAW COSINE SIMILARITY</div>
              <div className="mono text-cyan" style={{ fontSize: '12px' }}>
                {evidence.face_similarity.toFixed(6)}
              </div>
            </div>

            <div>
              <div className="vf-telemetry-label">NORMALIZED PERCENTAGE</div>
              <div className="mono text-green" style={{ fontSize: '12px', fontWeight: 700 }}>
                {evidence.similarity_percentage.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* SHA-256 Digest Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="vf-telemetry-label" style={{ color: 'var(--cyan)' }}>
              DETERMINISTIC SHA-256 EVIDENCE DIGEST
            </div>
            <button
              onClick={copyHash}
              className="vf-btn vf-btn-secondary vf-btn-sm"
              style={{ fontSize: '9px', padding: '4px 10px', height: '24px' }}
            >
              {copied ? '✓ COPIED' : 'COPY HASH'}
            </button>
          </div>

          {/* Cryptographic Hash Block */}
          <div className="vf-hash-block">
            <span style={{ color: 'var(--cyan)' }}>{hashSplitA}</span>
            <br />
            <span style={{ color: 'var(--blue)' }}>{hashSplitB}</span>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Canonical JSON digest computed using deterministic RFC-8785 normalization.
            Biometric embeddings remain strictly private in memory and are never written to the blockchain.
          </p>
        </div>
      </div>

      {/* Expand Canonical JSON Code Inspector */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setJsonExpanded(v => !v)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            letterSpacing: '0.1em',
            color: jsonExpanded ? 'var(--cyan)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{jsonExpanded ? '▾' : '▸'}</span>
          <span>{jsonExpanded ? 'COLLAPSE CANONICAL JSON PAYLOAD' : 'INSPECT CANONICAL JSON PAYLOAD'}</span>
        </button>

        <AnimatePresence>
          {jsonExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', marginTop: '12px' }}
            >
              <pre
                className="glass-inset"
                style={{
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  color: 'var(--cyan)',
                  overflowX: 'auto',
                  maxHeight: '240px',
                  lineHeight: 1.5,
                }}
              >
                {(() => { try { return JSON.stringify(JSON.parse(canonicalJson), null, 2) } catch { return canonicalJson } })()}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
