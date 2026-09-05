import { motion, AnimatePresence } from 'framer-motion'
import type { ErrorCode } from '../../types/verification'

interface Props {
  errorCode: ErrorCode | null
  message: string | null
  onReset: () => void
  isVisible: boolean
}

const ERROR_TITLES: Record<string, string> = {
  NO_FACE_DETECTED: 'NO FACE DETECTED IN TARGET FRAME',
  NO_CANDIDATES: 'NO REVERSE SEARCH CANDIDATES FOUND',
  NO_FACE_MATCHES: 'NO USABLE FACES IN CANDIDATE POOL',
  PIPELINE_ERROR: 'FORENSIC PIPELINE EXECUTION FAULT',
  EVIDENCE_ERROR: 'EVIDENCE CANONICAL SERIALIZATION ERROR',
  NETWORK_ERROR: 'TRACEON CORE BACKEND UNREACHABLE',
  PIPELINE_FAILED: 'VERIFICATION OPERATION INTERRUPTED',
}

export function ErrorState({ errorCode, message, onReset, isVisible }: Props) {
  if (!isVisible) return null

  const title = ERROR_TITLES[errorCode ?? ''] ?? 'TRACE INTERRUPTED'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="glass-card-accent"
        style={{
          marginTop: '20px',
          padding: '28px 24px',
          borderColor: 'rgba(255, 59, 92, 0.4)',
          boxShadow: '0 0 30px rgba(255, 59, 92, 0.15)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 59, 92, 0.12)',
            border: '1px solid rgba(255, 59, 92, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: '20px',
          }}
        >
          ⚠️
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--red)',
            marginBottom: '8px',
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            maxWidth: '480px',
            margin: '0 auto 20px',
            lineHeight: 1.6,
          }}
        >
          {message ?? 'An unexpected error occurred during pipeline execution. Please try another subject image.'}
        </div>

        <button className="vf-btn vf-btn-secondary" onClick={onReset}>
          <span>RETRY INTAKE</span>
          <span>↺</span>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
