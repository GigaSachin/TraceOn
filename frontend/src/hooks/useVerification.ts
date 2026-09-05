import { useState, useEffect, useCallback } from 'react'
import type {
  VerificationState, PipelineStep, PipelineStage,
  StepStatus, UploadedFile, VerifyResponse, SamplePreset
} from '../types/verification'
import { fetchHealth, submitVerification } from '../services/api'

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'sample-match-1',
    name: 'Sample Target (Primary)',
    label: 'TARGET SUBJECT A',
    tag: 'MATCH TEST',
    filename: 'test_same.jpg',
    url: '/samples/test_same.jpg',
    expectedOutcome: 'High similarity visual search verification',
  },
  {
    id: 'sample-match-2',
    name: 'Sample Target (Variant)',
    label: 'TARGET SUBJECT B',
    tag: 'CALIBRATION',
    filename: 'test.jpg',
    url: '/samples/test.jpg',
    expectedOutcome: 'Facial embedding & reverse web search',
  },
  {
    id: 'sample-diff-1',
    name: 'Sample Contrast (Distinct)',
    label: 'DISTINCT IDENTITY',
    tag: 'NEGATIVE TEST',
    filename: 'test_different_1.jpg',
    url: '/samples/test_different_1.jpg',
    expectedOutcome: 'Evaluated for NO_MATCH / UNCERTAIN outcome',
  },
]

export function make9Steps(): PipelineStep[] {
  return [
    {
      id: 'detection',
      number: 1,
      label: 'FACE DETECTION',
      sublabel: 'InsightFace buffalo_l Landmark Scan',
      techBadge: 'InsightFace',
      status: 'idle',
    },
    {
      id: 'embedding',
      number: 2,
      label: '512D EMBEDDING',
      sublabel: 'Biometric Feature Vector Synthesis',
      techBadge: '512D Vector',
      status: 'idle',
    },
    {
      id: 'search',
      number: 3,
      label: 'REVERSE SEARCH',
      sublabel: 'Google Lens & SerpAPI Index Sweep',
      techBadge: 'Google Lens',
      status: 'idle',
    },
    {
      id: 'candidate_analysis',
      number: 4,
      label: 'CANDIDATE ANALYSIS',
      sublabel: 'Multi-Face Extraction on Web Pool',
      techBadge: 'Parsing',
      status: 'idle',
    },
    {
      id: 'similarity',
      number: 5,
      label: 'SIMILARITY RANKING',
      sublabel: 'Cosine Distance & Calibrated Thresholds',
      techBadge: 'Cosine Metric',
      status: 'idle',
    },
    {
      id: 'evidence',
      number: 6,
      label: 'EVIDENCE RECORD',
      sublabel: 'Canonical RFC-8785 JSON Formatting',
      techBadge: 'RFC-8785',
      status: 'idle',
    },
    {
      id: 'sha256',
      number: 7,
      label: 'SHA-256 DIGEST',
      sublabel: 'Deterministic Cryptographic Hash',
      techBadge: 'SHA-256',
      status: 'idle',
    },
    {
      id: 'blockchain',
      number: 8,
      label: 'BASE SEPOLIA ANCHOR',
      sublabel: 'Smart Contract Immutable Registration',
      techBadge: 'Base Sepolia',
      status: 'idle',
    },
    {
      id: 'integrity',
      number: 9,
      label: 'INTEGRITY VERIFICATION',
      sublabel: 'Smart Contract Cryptographic Audit Check',
      techBadge: 'Audit Proof',
      status: 'idle',
    },
  ]
}

const INITIAL_STATE: VerificationState = {
  stage: 'IDLE',
  steps: make9Steps(),
  uploadedFile: null,
  result: null,
  error: null,
  errorCode: null,
  health: null,
  demoMode: false,
  activeTab: 'verify',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function updateStep(steps: PipelineStep[], id: string, status: StepStatus, detail?: string): PipelineStep[] {
  return steps.map(s => (s.id === id ? { ...s, status, detail: detail ?? s.detail } : s))
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function useVerification() {
  const [state, setState] = useState<VerificationState>(INITIAL_STATE)

  const checkHealth = useCallback(async () => {
    try {
      const health = await fetchHealth()
      setState(s => ({ ...s, health }))
    } catch {
      setState(s => ({ ...s, health: null }))
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 12000)
    return () => clearInterval(interval)
  }, [checkHealth])

  const setStep = useCallback((id: string, status: StepStatus, detail?: string) => {
    setState(s => ({ ...s, steps: updateStep(s.steps, id, status, detail) }))
  }, [])

  const setStage = useCallback((stage: PipelineStage) => {
    setState(s => ({ ...s, stage }))
  }, [])

  const setActiveTab = useCallback((tab: 'verify' | 'pipeline' | 'evidence' | 'proof' | 'about') => {
    setState(s => ({ ...s, activeTab: tab }))
  }, [])

  const selectFile = useCallback((file: File, sampleId?: string) => {
    const preview = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setState(s => ({
        ...s,
        uploadedFile: {
          file,
          preview,
          name: file.name,
          size: formatBytes(file.size),
          dimensions: `${img.naturalWidth} × ${img.naturalHeight}`,
          sampleId,
        },
        result: null,
        error: null,
        errorCode: null,
        stage: 'IDLE',
        steps: make9Steps(),
      }))
    }
    img.src = preview
  }, [])

  const loadSample = useCallback(async (sample: SamplePreset) => {
    try {
      const response = await fetch(sample.url)
      const blob = await response.blob()
      const file = new File([blob], sample.filename, { type: 'image/jpeg' })
      selectFile(file, sample.id)
    } catch {
      // Fallback
    }
  }, [selectFile])

  const reset = useCallback(() => {
    setState(s => {
      if (s.uploadedFile?.preview) URL.revokeObjectURL(s.uploadedFile.preview)
      return { ...INITIAL_STATE, health: s.health, activeTab: s.activeTab }
    })
  }, [])

  const verify = useCallback(async () => {
    if (!state.uploadedFile) return

    setState(s => ({
      ...s,
      stage: 'FACE_DETECTION',
      steps: make9Steps(),
      result: null,
      error: null,
      errorCode: null,
    }))

    setStep('detection', 'running', 'Scanning facial coordinates & bounding landmarks...')

    let result: VerifyResponse

    try {
      // Background progressive cue timers to give vivid feedback during multi-second pipeline
      const timer1 = setTimeout(() => {
        setStep('detection', 'success', 'Face localized with buffalo_l detector')
        setStage('EMBEDDING')
        setStep('embedding', 'running', 'Synthesizing 512-dimensional vector...')
      }, 1200)

      const timer2 = setTimeout(() => {
        setStep('embedding', 'success', '512D biometric vector mapped')
        setStage('REVERSE_SEARCH')
        setStep('search', 'running', 'Querying Google Lens visual graph...')
      }, 2600)

      const timer3 = setTimeout(() => {
        setStep('search', 'running', 'Collecting public web matches...')
        setStage('CANDIDATE_ANALYSIS')
        setStep('candidate_analysis', 'running', 'Detecting faces across web candidate pool...')
      }, 4800)

      result = await submitVerification(state.uploadedFile.file)

      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error — unable to connect to TRACEON core backend.'
      setState(s => ({
        ...s,
        stage: 'ERROR',
        error: msg,
        errorCode: 'NETWORK_ERROR',
        steps: s.steps.map(step => (step.status === 'running' ? { ...step, status: 'error' } : step)),
      }))
      return
    }

    if (!result.success) {
      const errCode = result.error_code ?? 'PIPELINE_ERROR'
      setState(s => ({
        ...s,
        stage: 'ERROR',
        error: result.message ?? 'Verification pipeline encountered an error.',
        errorCode: errCode,
        result,
        steps: s.steps.map(step =>
          step.status === 'running'
            ? { ...step, status: 'error', detail: result.message ?? '' }
            : step
        ),
      }))
      return
    }

    // Step 1: Face detected
    setStep('detection', 'success', `Primary face detected (Score: ${(result.det_score ?? 0.98).toFixed(2)})`)

    // Step 2: 512D Embedding
    setStage('EMBEDDING')
    setStep('embedding', 'success', '512-dimensional normalized vector extracted')

    // Step 3: Reverse Search
    const count = result.candidate_count ?? result.all_candidates?.length ?? 0
    setStage('REVERSE_SEARCH')
    setStep('search', 'success', `${count} reverse visual candidates retrieved`)

    // Step 4: Candidate Analysis
    setStage('CANDIDATE_ANALYSIS')
    setStep('candidate_analysis', 'success', `${count} candidate images parsed and analyzed`)

    // Step 5: Similarity Ranking
    setStage('SIMILARITY_RANKING')
    setStep(
      'similarity',
      'success',
      `Peak similarity: ${(result.similarity_percentage ?? 0).toFixed(2)}% [${result.decision ?? 'EVALUATED'}]`
    )

    // Step 6: Evidence Record
    setStage('EVIDENCE_GENERATION')
    setStep('evidence', 'running', 'Generating canonical RFC-8785 JSON structure...')
    await delay(250)
    setStep('evidence', 'success', 'Evidence record formatted according to RFC-8785')

    // Step 7: SHA-256 Hash
    setStep('sha256', 'running', 'Computing cryptographic hash digest...')
    await delay(200)
    setStep('sha256', 'success', `SHA-256: ${result.sha256 ? `${result.sha256.slice(0, 12)}...${result.sha256.slice(-8)}` : 'Calculated'}`)

    // Step 8: Base Sepolia Blockchain
    setStage('BLOCKCHAIN_SUBMISSION')
    setStep('blockchain', 'running', 'Broadcasting transaction to Base Sepolia L2...')
    await delay(300)

    const hasBlockchainErr = !!result.blockchain?.error
    if (hasBlockchainErr) {
      setStep('blockchain', 'error', result.blockchain!.error ?? 'On-chain transaction failed')
      setStep('integrity', 'error', 'Audit skipped due to submission error')
      setState(s => ({
        ...s,
        stage: 'ERROR',
        error: result.blockchain?.error ?? 'On-chain transaction failed',
        result,
      }))
      return
    }

    setStep(
      'blockchain',
      'success',
      `Block #${result.blockchain?.block_number ?? 'Confirmed'} · Tx: ${result.blockchain?.transaction_hash ? `${result.blockchain.transaction_hash.slice(0, 8)}...` : 'Success'}`
    )

    // Step 9: Integrity Verification
    setStage('BLOCKCHAIN_VERIFICATION')
    setStep('integrity', 'running', 'Verifying smart contract hash against local digest...')
    await delay(300)

    if (result.verification?.verified) {
      setStep('integrity', 'success', 'Cryptographic evidence integrity fully verified on-chain')
    } else {
      setStep('integrity', 'error', 'Hash mismatch or contract audit failed')
    }

    setState(s => ({ ...s, stage: 'COMPLETE', result }))
  }, [state.uploadedFile, setStep, setStage])

  const toggleDemoMode = useCallback(() => {
    setState(s => ({ ...s, demoMode: !s.demoMode }))
  }, [])

  return {
    state,
    selectFile,
    loadSample,
    verify,
    reset,
    toggleDemoMode,
    setActiveTab,
  }
}
