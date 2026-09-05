import { motion } from 'framer-motion'

interface TimelineItem {
  label: string
  done: boolean
  error?: boolean
  detail?: string
}

interface Props {
  items: TimelineItem[]
  isVisible: boolean
}

export function Timeline({ items, isVisible }: Props) {
  if (!isVisible) return null

  const doneCount = items.filter(i => i.done).length

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ marginTop: '28px' }}
      id="timeline-view"
    >
      <div className="vf-section-header">
        <span className="vf-pill cyan">07 AUDIT LOG</span>
        <span className="vf-section-title">FORENSIC EXECUTION AUDIT TRAIL</span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {doneCount}/{items.length} STAGES CONFIRMED
        </span>
      </div>

      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item, index) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: item.done ? 'var(--cyan-dim)' : 'transparent',
                border: item.done ? '1px solid var(--border-subtle)' : '1px solid transparent',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: item.done ? 'rgba(163, 255, 18, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  color: item.done ? 'var(--green)' : 'var(--text-muted)',
                  border: `1px solid ${item.done ? 'rgba(163, 255, 18, 0.3)' : 'var(--border-subtle)'}`,
                  flexShrink: 0,
                }}
              >
                {item.done ? '✓' : index + 1}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontFamily: item.done ? 'var(--font-sans)' : 'var(--font-mono)',
                    color: item.done ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: item.done ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
