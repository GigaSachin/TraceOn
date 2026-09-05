import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Candidate } from '../../types/verification'

interface Props {
  candidate: Candidate
  index: number
}

const DECISION_STYLES: Record<string, { badge: string; color: string; pillClass: string }> = {
  POTENTIAL_MATCH: { badge: 'POTENTIAL MATCH', color: 'var(--green)', pillClass: 'green' },
  UNCERTAIN: { badge: 'UNCERTAIN', color: 'var(--amber)', pillClass: 'amber' },
  NO_MATCH: { badge: 'NO MATCH', color: 'var(--red)', pillClass: 'red' },
}

export function CandidateCard({ candidate, index }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const dStyle = DECISION_STYLES[candidate.decision] ?? DECISION_STYLES.NO_MATCH

  const scoreColor =
    candidate.percentage >= 38
      ? 'var(--green)'
      : candidate.percentage >= 25
      ? 'var(--amber)'
      : 'var(--cyan)'

  return (
    <motion.div
      className="vf-candidate-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      {/* Thumbnail Area */}
      <div className="vf-candidate-thumb-wrap">
        {!imgFailed && candidate.image_url ? (
          <img
            src={candidate.image_url}
            alt={candidate.title}
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              opacity: 0.45,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="mono text-muted" style={{ fontSize: '8.5px' }}>
              VISUAL GRAPH MATCH
            </span>
          </div>
        )}

        {/* Rank Badge */}
        <div className="vf-candidate-rank">
          #{String(candidate.rank).padStart(2, '0')}
        </div>

        {/* Confidence pill on top right */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span className={`vf-pill ${dStyle.pillClass}`} style={{ fontSize: '8px', padding: '2px 6px' }}>
            {dStyle.badge}
          </span>
        </div>
      </div>

      {/* Body & Data */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#FFFFFF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={candidate.title}
        >
          {candidate.title || 'Discovered Web Profile'}
        </div>

        {/* Similarity Score & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="vf-telemetry-label">FACIAL SIMILARITY</div>
            <div className="mono" style={{ fontSize: '15px', fontWeight: 800, color: scoreColor }}>
              {candidate.percentage.toFixed(2)}%
            </div>
          </div>

          <div className="mono text-muted" style={{ fontSize: '9px', textAlign: 'right' }}>
            RANK {candidate.rank}
          </div>
        </div>

        {/* Mini progress gauge */}
        <div style={{ height: '3px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(candidate.percentage, 100)}%`,
              background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`,
            }}
          />
        </div>

        {/* Source metadata & Link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '6px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span
            className="mono text-muted"
            style={{
              fontSize: '9px',
              maxWidth: '130px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {candidate.source || 'Web Source'}
          </span>

          {candidate.source_url && (
            <a
              href={candidate.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-cyan"
              style={{
                fontSize: '9px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              <span>SOURCE</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
