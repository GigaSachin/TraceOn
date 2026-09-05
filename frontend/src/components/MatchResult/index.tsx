import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Decision, BestCandidate } from '../../types/verification'

interface Props {
  decision: Decision
  similarityPercentage: number
  bestCandidate: BestCandidate | null
  candidateCount: number
  isVisible: boolean
}

const DECISION_CONFIG: Record<
  Decision,
  {
    title: string
    subtitle: string
    color: string
    pillClass: string
    description: string
    icon: string
  }
> = {
  POTENTIAL_MATCH: {
    title: 'POTENTIAL MATCH',
    subtitle: 'HIGH FACIAL CORRESPONDENCE DETECTED',
    color: 'var(--green)',
    pillClass: 'green',
    description:
      'Target subject biometric embedding aligns closely with public web candidate within high-confidence threshold. Biometric similarity is indicative intelligence and verifiable evidence.',
    icon: '◈',
  },
  UNCERTAIN: {
    title: 'UNCERTAIN',
    subtitle: 'INCONCLUSIVE SIMILARITY THRESHOLD',
    color: 'var(--amber)',
    pillClass: 'amber',
    description:
      'Partial facial alignment detected across candidate pool. Score falls within intermediate range and requires human examiner inspection.',
    icon: '◇',
  },
  NO_MATCH: {
    title: 'NO MATCH',
    subtitle: 'NO BIOMETRIC CORRESPONDENCE DETECTED',
    color: 'var(--red)',
    pillClass: 'red',
    description:
      'Target subject does not exhibit matching biometric characteristics with searched public visual identities across web indices.',
    icon: '○',
  },
}

export function MatchResult({
  decision,
  similarityPercentage,
  bestCandidate,
  candidateCount,
  isVisible,
}: Props) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    const target = similarityPercentage || 0
    const duration = 1200
    const startTime = performance.now()

    const updateNumber = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Number((target * easeOut).toFixed(2)))

      if (progress < 1) {
        requestAnimationFrame(updateNumber)
      }
    }

    requestAnimationFrame(updateNumber)
  }, [isVisible, similarityPercentage])

  if (!isVisible) return null

  const cfg = DECISION_CONFIG[decision] ?? DECISION_CONFIG.NO_MATCH

  return (
    <motion.section
      className={`vf-result-card ${decision}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Corner crosshairs */}
      <div className="tactical-corners" style={{ position: 'absolute', inset: 16 }} />

      <div className="vf-section-header">
        <span className={`vf-pill ${cfg.pillClass}`}>03 DECISION</span>
        <span className="vf-section-title">INTELLIGENCE ANALYSIS VERDICT</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
          {candidateCount} CANDIDATE{candidateCount !== 1 ? 'S' : ''} EVALUATED
        </span>
      </div>

      <div className="vf-result-grid" style={{ marginTop: '16px' }}>
        {/* Left Column: Big Score & Status */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '18px', color: cfg.color }}>{cfg.icon}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                fontWeight: 700,
                color: cfg.color,
              }}
            >
              {cfg.subtitle}
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: cfg.color,
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            {cfg.title}
          </div>

          {/* Animated Counter */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="vf-score-hero" style={{ color: cfg.color }}>
              {animatedScore.toFixed(2)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', color: 'var(--text-muted)' }}>
              %
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
              PEAK COSINE SIMILARITY
            </span>
          </div>

          {/* Similarity Fill Gauge */}
          <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                boxShadow: `0 0 12px ${cfg.color}`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(similarityPercentage, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Right Column: Context & Candidate Summary */}
        <div className="vf-result-context">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {cfg.description}
          </p>

          {bestCandidate && (
            <div className="glass-inset" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="vf-telemetry-label">TOP WEB MATCH CANDIDATE</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>
                {bestCandidate.candidate}
              </div>
              {bestCandidate.source && (
                <div className="mono text-cyan" style={{ fontSize: '10px' }}>
                  Discovered via {bestCandidate.source}
                </div>
              )}
            </div>
          )}

          {/* Threshold Benchmarks */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
              <span className="mono text-muted" style={{ fontSize: '9px' }}>MATCH ≥38%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
              <span className="mono text-muted" style={{ fontSize: '9px' }}>UNCERTAIN ≥25%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
              <span className="mono text-muted" style={{ fontSize: '9px' }}>NO MATCH &lt;25%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
