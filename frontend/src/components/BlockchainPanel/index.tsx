import { motion } from 'framer-motion'
import type { BlockchainData } from '../../types/verification'

interface Props {
  blockchain: BlockchainData
  sha256: string
  isVisible: boolean
}

export function BlockchainPanel({ blockchain, isVisible }: Props) {
  if (!isVisible) return null

  const hasTx = !!blockchain.transaction_hash
  const basescanUrl = hasTx
    ? `https://sepolia.basescan.org/tx/${blockchain.transaction_hash}`
    : null

  const hasError = !!blockchain.error

  return (
    <motion.section
      className="vf-blockchain-panel"
      id="proof-layer-view"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ marginTop: '28px' }}
    >
      {/* Header bar */}
      <div className="vf-blockchain-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#FFFFFF',
            }}
          >
            BASE SEPOLIA IMMUTABLE PROOF LAYER
          </span>
          <span className="vf-pill blue">CHAIN ID {blockchain.chain_id}</span>
        </div>

        <div>
          {hasTx && !hasError ? (
            <span className="vf-pill green">
              <span className="vf-dot pulse" />
              CONFIRMED ON-CHAIN
            </span>
          ) : hasError ? (
            <span className="vf-pill red">SUBMISSION ERROR</span>
          ) : (
            <span className="vf-pill">OFF-CHAIN</span>
          )}
        </div>
      </div>

      {/* Visual Blockchain Proof Flow Graph */}
      <div className="vf-proof-flow-responsive">
        <div className="vf-proof-node">
          <span className="vf-telemetry-label">01 INPUT</span>
          <span className="mono text-cyan" style={{ fontSize: '11px', fontWeight: 600 }}>EVIDENCE JSON</span>
        </div>
        <div className="vf-proof-arrow">➔</div>

        <div className="vf-proof-node">
          <span className="vf-telemetry-label">02 DIGEST</span>
          <span className="mono text-cyan" style={{ fontSize: '11px', fontWeight: 600 }}>SHA-256 HASH</span>
        </div>
        <div className="vf-proof-arrow">➔</div>

        <div className="vf-proof-node">
          <span className="vf-telemetry-label">03 SMART CONTRACT</span>
          <span className="mono text-blue" style={{ fontSize: '11px', fontWeight: 600 }}>
            {blockchain.contract_address ? `${blockchain.contract_address.slice(0, 6)}...` : 'VerifaiEvidence'}
          </span>
        </div>
        <div className="vf-proof-arrow">➔</div>

        <div className="vf-proof-node">
          <span className="vf-telemetry-label">04 SETTLEMENT</span>
          <span className="mono text-green" style={{ fontSize: '11px', fontWeight: 600 }}>
            {blockchain.block_number ? `BLOCK #${blockchain.block_number}` : 'IMMUTABLE PROOF'}
          </span>
        </div>
      </div>

      {/* Main Blockchain Parameters */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {hasError ? (
          <div style={{ color: 'var(--red)', fontSize: '13px' }}>
            <p>⚠ Blockchain Registration Error: {blockchain.error}</p>
            <p className="text-muted" style={{ fontSize: '11px', marginTop: '6px' }}>
              Evidence was computed and serialized successfully off-chain. Check RPC connection to Base Sepolia.
            </p>
          </div>
        ) : (
          <>
            <div className="vf-blockchain-params">
              <div>
                <div className="vf-telemetry-label">SMART CONTRACT ADDRESS</div>
                <div className="mono" style={{ fontSize: '11px', marginTop: '4px' }}>
                  {blockchain.contract_address ? (
                    <a
                      href={`https://sepolia.basescan.org/address/${blockchain.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>{blockchain.contract_address.slice(0, 10)}...{blockchain.contract_address.slice(-8)}</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              <div>
                <div className="vf-telemetry-label">TRANSACTION HASH</div>
                <div className="mono" style={{ fontSize: '11px', marginTop: '4px' }}>
                  {blockchain.transaction_hash ? (
                    <a
                      href={basescanUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>{blockchain.transaction_hash.slice(0, 10)}...{blockchain.transaction_hash.slice(-8)}</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              <div>
                <div className="vf-telemetry-label">BLOCK NUMBER</div>
                <div className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                  {blockchain.block_number ? `#${blockchain.block_number}` : 'CONFIRMED'}
                </div>
              </div>

              <div>
                <div className="vf-telemetry-label">RELAY SUBMITTER WALLET</div>
                <div className="mono text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                  {blockchain.submitted_by
                    ? `${blockchain.submitted_by.slice(0, 8)}...${blockchain.submitted_by.slice(-6)}`
                    : 'System Relay'}
                </div>
              </div>
            </div>

            {basescanUrl && (
              <div style={{ paddingTop: '8px', display: 'flex', gap: '12px' }}>
                <a
                  href={basescanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vf-btn vf-btn-outline vf-btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <span>VIEW ON BASESCAN EXPLORER</span>
                  <span>↗</span>
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  )
}
