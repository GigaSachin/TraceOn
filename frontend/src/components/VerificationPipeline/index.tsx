import { motion } from 'framer-motion'
import type { PipelineStep, StepStatus } from '../../types/verification'

interface Props {
  steps: PipelineStep[]
  isVisible: boolean
}

function StepStatusIndicator({ status }: { status: StepStatus }) {
  if (status === 'running') {
    return (
      <div
        style={{
          width: 12,
          height: 12,
          border: '2px solid var(--cyan)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'rotate-clockwise 0.75s linear infinite',
        }}
      />
    )
  }
  if (status === 'success') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (status === 'error') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="3" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  }
  return <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-disabled)' }} />
}

export function VerificationPipeline({ steps, isVisible }: Props) {
  if (!isVisible) return null

  const doneCount = steps.filter(s => s.status === 'success').length
  const progressPercent = Math.round((doneCount / steps.length) * 100)

  return (
    <motion.div
      className="vf-pipeline-card"
      id="pipeline-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Section Header */}
      <div className="vf-section-header">
        <span className="vf-pill cyan">02 PIPELINE</span>
        <span className="vf-section-title">INTELLIGENT FORENSIC STAGES</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          {doneCount}/{steps.length} COMPLETE
        </span>
      </div>

      {/* Real-time Progress Gauge */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
            EXECUTION PIPELINE PROGRESS
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: progressPercent === 100 ? 'var(--green)' : 'var(--cyan)',
            }}
          >
            {progressPercent}%
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <motion.div
            style={{
              height: '100%',
              background: progressPercent === 100 ? 'var(--green)' : 'linear-gradient(90deg, #00e5ff, #3b82f6)',
              boxShadow: progressPercent === 100 ? '0 0 10px rgba(163, 255, 18, 0.6)' : '0 0 10px rgba(0, 229, 255, 0.6)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 9 Stages List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, index) => (
          <div key={step.id}>
            <motion.div
              className={`vf-stage-item ${step.status}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.25 }}
            >
              <span className="vf-stage-num">{String(step.number).padStart(2, '0')}</span>

              <div className="vf-stage-icon-wrap">
                <StepStatusIndicator status={step.status} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                    {step.label}
                  </span>
                  {step.techBadge && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '8px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {step.techBadge}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                  {step.sublabel}
                </div>

                {step.detail && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9.5px',
                      color: step.status === 'error' ? 'var(--red)' : 'var(--cyan)',
                      marginTop: '3px',
                    }}
                  >
                    ▸ {step.detail}
                  </div>
                )}
              </div>
            </motion.div>

            {index < steps.length - 1 && (
              <div className={`vf-stage-connector ${step.status === 'success' ? 'done' : ''}`} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
