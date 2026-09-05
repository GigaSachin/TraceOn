// ─── TRACEON Verification API Types ──────────────────────────────────────────

export type Decision = 'NO_MATCH' | 'UNCERTAIN' | 'POTENTIAL_MATCH'

export type ErrorCode =
  | 'NO_FACE_DETECTED'
  | 'NO_CANDIDATES'
  | 'NO_FACE_MATCHES'
  | 'PIPELINE_ERROR'
  | 'EVIDENCE_ERROR'
  | 'NETWORK_ERROR'
  | 'PIPELINE_FAILED'

export interface Candidate {
  rank: number
  candidate_id: number
  title: string
  source: string
  source_url: string | null
  image_url: string | null
  similarity: number
  percentage: number
  decision: Decision
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface EvidenceRecord {
  version: string
  timestamp: string
  candidate: string
  source: string | null
  source_url: string | null
  image_url: string | null
  face_similarity: number
  similarity_percentage: number
  decision: Decision
}

export interface BlockchainData {
  network: string
  chain_id: number
  contract_address: string
  transaction_hash: string | null
  block_number: number | null
  submitted_by: string | null
  error: string | null
}

export interface VerificationResult {
  verified: boolean
  local_hash: string
  blockchain_hash: string | null
  error: string | null
}

export interface BestCandidate {
  candidate: string
  source: string
  source_url: string | null
  image_url: string | null
  similarity: number
  percentage: number
  decision: Decision
}

export interface VerifyResponse {
  success: boolean
  error_code: ErrorCode | null
  message: string | null
  decision: Decision | null
  similarity: number | null
  similarity_percentage: number | null
  face_detected: boolean
  face_count: number
  det_score: number | null
  candidate_count: number
  all_candidates: Candidate[]
  best_candidate: BestCandidate | null
  evidence: EvidenceRecord | null
  canonical_json: string | null
  sha256: string | null
  blockchain: BlockchainData | null
  verification: VerificationResult | null
}

export interface HealthResponse {
  status: 'online' | 'offline'
  chain_id: number
  contract_address: string
  network: string
}

// ─── Pipeline Stage & Step Types ─────────────────────────────────────────────

export type PipelineStage =
  | 'IDLE'
  | 'UPLOADING'
  | 'FACE_DETECTION'
  | 'EMBEDDING'
  | 'REVERSE_SEARCH'
  | 'CANDIDATE_ANALYSIS'
  | 'SIMILARITY_RANKING'
  | 'EVIDENCE_GENERATION'
  | 'BLOCKCHAIN_SUBMISSION'
  | 'BLOCKCHAIN_VERIFICATION'
  | 'COMPLETE'
  | 'ERROR'

export type StepStatus = 'idle' | 'running' | 'success' | 'error'

export interface PipelineStep {
  id: string
  number: number
  label: string
  sublabel: string
  status: StepStatus
  detail?: string
  techBadge?: string
}

export interface UploadedFile {
  file: File
  preview: string
  name: string
  size: string
  dimensions?: string
  sampleId?: string
}

export interface SamplePreset {
  id: string
  name: string
  label: string
  tag: string
  filename: string
  url: string
  expectedOutcome: string
}

export interface VerificationState {
  stage: PipelineStage
  steps: PipelineStep[]
  uploadedFile: UploadedFile | null
  result: VerifyResponse | null
  error: string | null
  errorCode: ErrorCode | null
  health: HealthResponse | null
  demoMode: boolean
  activeTab: 'verify' | 'pipeline' | 'evidence' | 'proof' | 'about'
}
