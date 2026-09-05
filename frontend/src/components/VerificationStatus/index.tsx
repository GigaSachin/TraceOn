import { motion } from 'framer-motion'
import type { VerificationResult } from '../../types/verification'

interface Props {
  verification: VerificationResult
  isVisible: boolean
}

export function VerificationStatus({ verification, isVisible }: Props) {
  if (!isVisible) return null

  const isVerified = verification.verified
  const hasMismatch = verification.blockchain_hash && !isVerified

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ marginTop: '28px' }}
      id="integrity-view"
    >
      <div className="vf-section-header">
        <span className={`vf-pill ${isVerified ? 'green' : 'red'}`}>06 AUDIT</span>
        <span className="vf-section-title">CRYPTOGRAPHIC INTEGRITY CHECKPOINT</span>
      </div>

      <div
        className="glass-card-accent"
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          borderColor: isVerified ? 'rgba(163, 255, 18, 0.3)' : 'rgba(255, 59, 92, 0.3)',
          boxShadow: isVerified ? '0 0 35px rgba(163, 255, 18, 0.1)' : '0 0 35px rgba(255, 59, 92, 0.1)',
        }}
      >
        {/* Animated Shield Checkpoint Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isVerified ? 'rgba(163, 255, 18, 0.12)' : 'rgba(255, 59, 92, 0.12)',
            border: `1.5px solid ${isVerified ? 'var(--green)' : 'var(--red)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: isVerified ? '0 0 24px rgba(163, 255, 18, 0.35)' : '0 0 24px rgba(255, 59, 92, 0.35)',
          }}
        >
          {isVerified ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: isVerified ? 'var(--green)' : 'var(--red)',
            marginBottom: '6px',
          }}
        >
          {isVerified
            ? '✓ EVIDENCE INTEGRITY VERIFIED'
            : hasMismatch
            ? 'INTEGRITY MISMATCH DETECTED'
            : 'UNVERIFIED ON-CHAIN AUDIT'}
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 20px' }}>
          {isVerified
            ? 'Deterministic SHA-256 local evidence digest matches the immutable smart contract record on Base Sepolia with 100% cryptographic parity.'
            : hasMismatch
            ? 'The computed evidence digest differs from the historical on-chain record. Potential state tampering detected.'
            : 'Could not complete on-chain verification handshake.'}
        </div>

        {/* Dual Hash Hash Comparison Box */}
        {(verification.local_hash || verification.blockchain_hash) && (
          <div
            className="glass-inset"
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              padding: '18px 20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <div className="vf-telemetry-label">COMPUTED LOCAL EVIDENCE HASH</div>
              <div className="mono text-cyan" style={{ fontSize: '11px', marginTop: '3px', wordBreak: 'break-all' }}>
                {verification.local_hash}
              </div>
            </div>

            {verification.blockchain_hash && (
              <div>
                <div className="vf-telemetry-label">ON-CHAIN RETRIEVED CONTRACT HASH</div>
                <div
                  className="mono"
                  style={{
                    fontSize: '11px',
                    marginTop: '3px',
                    wordBreak: 'break-all',
                    color: isVerified ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {verification.blockchain_hash}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  )
}
