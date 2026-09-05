import { motion } from 'framer-motion'
import type { Candidate } from '../../types/verification'
import { CandidateCard } from '../CandidateCard'

interface Props {
  candidates: Candidate[]
  isVisible: boolean
}

export function CandidateGrid({ candidates, isVisible }: Props) {
  if (!isVisible || candidates.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ marginTop: '28px' }}
      id="candidates-view"
    >
      <div className="vf-section-header">
        <span className="vf-pill cyan">04 DISCOVERY</span>
        <span className="vf-section-title">REVERSE SEARCH CANDIDATE EVIDENCE POOL</span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {candidates.length} MATCH CANDIDATES DISCOVERED
        </span>
      </div>

      <div className="vf-candidate-grid">
        {candidates.map((c, i) => (
          <CandidateCard key={`${c.rank}-${c.title}-${i}`} candidate={c} index={i} />
        ))}
      </div>
    </motion.section>
  )
}
