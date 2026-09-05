import { motion } from 'framer-motion'
import { HeroVisualizer } from '../HeroVisualizer'
import type { UploadedFile, HealthResponse } from '../../types/verification'

interface Props {
  uploadedFile: UploadedFile | null
  isRunning: boolean
  health: HealthResponse | null
  onStartInvestigation: () => void
  onViewPipeline: () => void
  onOpenDemoSamples: () => void
}

export function Hero({
  uploadedFile,
  isRunning,
  health,
  onStartInvestigation,
  onViewPipeline,
  onOpenDemoSamples,
}: Props) {
  return (
    <section className="vf-hero-section">
      <div className="vf-container">
        <div className="vf-hero-grid">
          {/* Left Column: Mission, Headlines & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="vf-hero-eyebrow">
              <span className="vf-dot pulse" />
              CYBER FORENSICS & VERIFIABLE INTELLIGENCE
            </div>

            <h1 className="vf-hero-title">
              TRACE THE FACE.<br />
              <span className="highlight">PROVE THE EVIDENCE.</span>
            </h1>

            <p className="vf-hero-desc">
              AI-powered visual verification engineered for high-assurance forensic investigation.
              Analyzes biometric representations against public web sources, generating canonical
              evidence digests cryptographically anchored to Base Sepolia.
            </p>

            <div className="vf-hero-actions">
              <button className="vf-btn vf-btn-primary" onClick={onStartInvestigation}>
                <span>START INVESTIGATION</span>
                <span>→</span>
              </button>
              <button className="vf-btn vf-btn-secondary" onClick={onViewPipeline}>
                <span>VIEW PIPELINE</span>
              </button>
              <button className="vf-btn vf-btn-outline" onClick={onOpenDemoSamples}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>HACKATHON DEMO MODE</span>
              </button>
            </div>

            {/* Live Core Engine Telemetry Row */}
            <div className="vf-hero-status-row">
              <div className="vf-telemetry-item">
                <span className="vf-telemetry-label">TRACEON CORE</span>
                <span className="vf-telemetry-val text-cyan">
                  <span className="vf-dot" style={{ background: 'var(--cyan)' }} />
                  {health?.status === 'online' ? 'V1.0 ONLINE' : 'READY'}
                </span>
              </div>

              <div className="vf-telemetry-item">
                <span className="vf-telemetry-label">AI BIOMETRIC ENGINE</span>
                <span className="vf-telemetry-val text-green">
                  <span className="vf-dot" style={{ background: 'var(--green)' }} />
                  InsightFace buffalo_l
                </span>
              </div>

              <div className="vf-telemetry-item">
                <span className="vf-telemetry-label">PROOF LAYER</span>
                <span className="vf-telemetry-val text-blue">
                  <span className="vf-dot" style={{ background: 'var(--blue)' }} />
                  Base Sepolia (84532)
                </span>
              </div>

              <div className="vf-telemetry-item">
                <span className="vf-telemetry-label">VERIFICATION STANDARD</span>
                <span className="vf-telemetry-val">
                  RFC-8785 Canonical JSON
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Holographic Biometric Centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            <HeroVisualizer uploadedFile={uploadedFile} isRunning={isRunning} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
