import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useVerification } from './hooks/useVerification'
import { Background } from './components/Background'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { UploadZone } from './components/UploadZone'
import { VerificationPipeline } from './components/VerificationPipeline'
import { MatchResult } from './components/MatchResult'
import { CandidateGrid } from './components/CandidateGrid'
import { EvidencePanel } from './components/EvidencePanel'
import { BlockchainPanel } from './components/BlockchainPanel'
import { VerificationStatus } from './components/VerificationStatus'
import { Timeline } from './components/Timeline'
import { ErrorState } from './components/ErrorState'
import { AboutPanel } from './components/AboutPanel'
import { Footer } from './components/Footer'

function buildTimelineItems(steps: { id: string; status: string; label: string; sublabel: string }[]) {
  const LABELS: Record<string, string> = {
    detection: 'Target face localized using InsightFace buffalo_l detector',
    embedding: '512-dimensional biometric feature representation synthesized',
    search: 'Google Lens visual graph queried via reverse image search',
    candidate_analysis: 'Discovered candidate faces parsed and indexed',
    similarity: 'Cosine similarity calculated against calibrated thresholds',
    evidence: 'RFC-8785 canonical JSON evidence document structured',
    sha256: 'Deterministic SHA-256 cryptographic digest computed',
    blockchain: 'Evidence digest registered on Base Sepolia smart contract',
    integrity: 'Cryptographic parity verified between local digest and on-chain record',
  }

  return steps.map(step => ({
    label: LABELS[step.id] ?? step.label,
    done: step.status === 'success',
    error: step.status === 'error',
  }))
}

export default function App() {
  const {
    state,
    selectFile,
    loadSample,
    verify,
    reset,
    setActiveTab,
  } = useVerification()

  const { stage, steps, uploadedFile, result, error, errorCode, health, activeTab } = state
  const consoleRef = useRef<HTMLDivElement>(null)

  const isRunning = [
    'UPLOADING',
    'FACE_DETECTION',
    'EMBEDDING',
    'REVERSE_SEARCH',
    'CANDIDATE_ANALYSIS',
    'SIMILARITY_RANKING',
    'EVIDENCE_GENERATION',
    'BLOCKCHAIN_SUBMISSION',
    'BLOCKCHAIN_VERIFICATION',
  ].includes(stage)

  const isComplete = stage === 'COMPLETE'
  const isError = stage === 'ERROR' && !isRunning
  const showResults = isComplete && !!result
  const timelineItems = buildTimelineItems(steps)

  const scrollToConsole = () => {
    const intake = document.getElementById('intake-terminal')
    if (intake) {
      intake.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleTabChange = (tab: 'verify' | 'pipeline' | 'evidence' | 'proof' | 'about') => {
    setActiveTab(tab)
    if (tab === 'verify') {
      scrollToConsole()
    } else if (tab === 'pipeline') {
      document.getElementById('pipeline-view')?.scrollIntoView({ behavior: 'smooth' })
    } else if (tab === 'evidence') {
      document.getElementById('evidence-view')?.scrollIntoView({ behavior: 'smooth' })
    } else if (tab === 'proof') {
      document.getElementById('proof-layer-view')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="vf-root">
      {/* Background with subtle interactive canvas & atmospheric lighting */}
      <Background />

      {/* Modern Cyber-Forensics Header */}
      <Header
        health={health}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenDemoSamples={scrollToConsole}
      />

      {/* Main Command Center Application */}
      <main className="vf-main">
        {/* Cinematic Hero Section */}
        <Hero
          uploadedFile={uploadedFile}
          isRunning={isRunning}
          health={health}
          onStartInvestigation={scrollToConsole}
          onViewPipeline={() => handleTabChange('pipeline')}
          onOpenDemoSamples={scrollToConsole}
        />

        {/* Tactical Forensics Console */}
        <div className="vf-container" ref={consoleRef}>
          <div className="vf-console-grid">
            {/* Left Column: Forensic Evidence Intake Zone */}
            <div>
              <UploadZone
                uploadedFile={uploadedFile}
                onFileSelect={selectFile}
                onLoadSample={loadSample}
                onVerify={verify}
                onReset={reset}
                isRunning={isRunning}
              />
            </div>

            {/* Right Column: Dynamic Pipeline, Match Results & Blockchain Proof */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Intelligent Verification Pipeline (shown during processing or idle preview) */}
              {(!showResults || isRunning) && (
                <VerificationPipeline steps={steps} isVisible={true} />
              )}

              {/* Error State */}
              <AnimatePresence>
                {isError && (
                  <ErrorState
                    key="error"
                    errorCode={errorCode}
                    message={error}
                    onReset={reset}
                    isVisible
                  />
                )}
              </AnimatePresence>

              {/* Comprehensive Verification Results Suite */}
              <AnimatePresence>
                {showResults && result && (
                  <motion.div
                    key="results-suite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                  >
                    {/* Decision & Similarity Hero */}
                    <MatchResult
                      decision={result.decision!}
                      similarityPercentage={result.similarity_percentage!}
                      bestCandidate={result.best_candidate}
                      candidateCount={result.candidate_count ?? result.all_candidates?.length ?? 0}
                      isVisible
                    />

                    {/* Cryptographic Integrity Verification Checkpoint */}
                    {result.verification && (
                      <VerificationStatus
                        verification={result.verification}
                        isVisible
                      />
                    )}

                    {/* Canonical RFC-8785 Evidence & SHA-256 Digest Record */}
                    {result.evidence && result.sha256 && result.canonical_json && (
                      <EvidencePanel
                        evidence={result.evidence}
                        sha256={result.sha256}
                        canonicalJson={result.canonical_json}
                        isVisible
                      />
                    )}

                    {/* Base Sepolia Blockchain Proof Layer */}
                    {result.blockchain && (
                      <BlockchainPanel
                        blockchain={result.blockchain}
                        sha256={result.sha256 ?? ''}
                        isVisible
                      />
                    )}

                    {/* Reverse Visual Search Discovery Candidate Grid */}
                    <CandidateGrid
                      candidates={result.all_candidates}
                      isVisible={result.all_candidates.length > 0}
                    />

                    {/* Forensic Execution Audit Timeline */}
                    <Timeline items={timelineItems} isVisible />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* About / Architecture Specification Drawer */}
          <AnimatePresence>
            {activeTab === 'about' && (
              <AboutPanel isVisible onClose={() => setActiveTab('verify')} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Brand Footer with Base Sepolia details */}
      <Footer />
    </div>
  )
}
