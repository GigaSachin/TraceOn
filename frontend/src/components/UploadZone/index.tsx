import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UploadedFile, SamplePreset } from '../../types/verification'
import { SAMPLE_PRESETS } from '../../hooks/useVerification'
import { CameraModal } from '../CameraModal'

interface Props {
  uploadedFile: UploadedFile | null
  onFileSelect: (file: File) => void
  onLoadSample: (sample: SamplePreset) => void
  onVerify: () => void
  onReset: () => void
  isRunning: boolean
}

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function UploadZone({
  uploadedFile,
  onFileSelect,
  onLoadSample,
  onVerify,
  onReset,
  isRunning,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      setDragError('')
      if (!ACCEPTED.includes(file.type)) {
        setDragError('Unsupported format. Please upload JPG, PNG or WEBP')
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        setDragError('File size exceeds maximum threshold (20MB)')
        return
      }
      onFileSelect(file)
    },
    [onFileSelect]
  )

  return (
    <div className="vf-intake-panel" id="intake-terminal">
      {/* Header section marker */}
      <div className="vf-section-header">
        <span className="vf-pill cyan">01 INTAKE</span>
        <span className="vf-section-title">SUBJECT EVIDENCE INTAKE</span>
      </div>

      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          // ── Empty Dropzone State ──
          <motion.div
            key="empty-dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`vf-dropzone ${isDragging ? 'dragging' : ''}`}
              onDrop={e => {
                e.preventDefault()
                setIsDragging(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              onDragOver={e => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload target subject image"
              onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            >
              {/* Tactical Corners */}
              <div className="tactical-corners" style={{ position: 'absolute', inset: 12 }} />

              {/* Animated Laser Scanline */}
              <div className="vf-laser-scan" />

              {/* Intake Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '12px',
                  background: 'rgba(0, 229, 255, 0.08)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                  {isDragging ? 'RELEASE TO ANALYZE' : 'DROP TARGET SUBJECT IMAGE'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  or <span style={{ color: 'var(--cyan)', textDecoration: 'underline' }}>browse file system</span>
                </p>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <span className="vf-pill" style={{ fontSize: '8.5px', padding: '2px 8px' }}>JPG</span>
                  <span className="vf-pill" style={{ fontSize: '8.5px', padding: '2px 8px' }}>PNG</span>
                  <span className="vf-pill" style={{ fontSize: '8.5px', padding: '2px 8px' }}>WEBP</span>
                  <span className="vf-pill" style={{ fontSize: '8.5px', padding: '2px 8px' }}>MAX 20MB</span>
                </div>
              </div>

              {dragError && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', marginTop: 10 }}>
                  ⚠ {dragError}
                </p>
              )}
            </div>

            {/* Input Action Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              <button
                className="vf-btn vf-btn-secondary"
                onClick={() => inputRef.current?.click()}
                style={{ fontSize: '11px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                SELECT FILE
              </button>
              <button
                className="vf-btn vf-btn-secondary"
                onClick={() => setCameraOpen(true)}
                style={{ fontSize: '11px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                CAMERA SCAN
              </button>
            </div>

            {/* Quick Demo Test Presets */}
            <div className="vf-sample-tray">
              <div className="vf-sample-label">
                <span>⚡ 1-CLICK DEMO TEST PRESETS</span>
                <span style={{ color: 'var(--cyan)' }}>HACKER HOUSE READY</span>
              </div>
              <div className="vf-sample-grid">
                {SAMPLE_PRESETS.map(sample => (
                  <button
                    key={sample.id}
                    className="vf-sample-btn"
                    onClick={() => onLoadSample(sample)}
                    title={sample.expectedOutcome}
                  >
                    <img src={sample.url} alt={sample.name} className="vf-sample-thumb" />
                    <span className="vf-sample-title">{sample.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '7.5px',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        background: sample.tag.includes('MATCH') ? 'rgba(163, 255, 18, 0.15)' : 'rgba(0, 229, 255, 0.15)',
                        color: sample.tag.includes('MATCH') ? 'var(--green)' : 'var(--cyan)',
                      }}
                    >
                      {sample.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
                e.target.value = ''
              }}
            />
          </motion.div>
        ) : (
          // ── Loaded Subject Preview & Verification Trigger ──
          <motion.div
            key="preview-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Target Preview with HUD Overlay */}
            <div className="vf-target-preview">
              <img src={uploadedFile.preview} alt="Target Subject" />
              <div className="vf-scan-hud">
                <div className="vf-scan-hud-corner tl" />
                <div className="vf-scan-hud-corner tr" />
                <div className="vf-scan-hud-corner bl" />
                <div className="vf-scan-hud-corner br" />
                <div className="vf-scan-hud-badge">TARGET EVIDENCE SUBJECT</div>
              </div>

              {/* Running Scanline */}
              {isRunning && <div className="vf-laser-scan" />}
            </div>

            {/* Subject Telemetry & Metadata */}
            <div className="glass-inset" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div className="vf-telemetry-label">SUBJECT IDENTIFIER / FILENAME</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', wordBreak: 'break-all' }}>
                  {uploadedFile.name}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div className="vf-telemetry-label">FILE SIZE</div>
                  <div className="mono text-cyan" style={{ fontSize: '11px' }}>{uploadedFile.size}</div>
                </div>
                <div>
                  <div className="vf-telemetry-label">DIMENSIONS</div>
                  <div className="mono text-cyan" style={{ fontSize: '11px' }}>{uploadedFile.dimensions ?? '1080×1080'}</div>
                </div>
                <div>
                  <div className="vf-telemetry-label">FORMAT</div>
                  <div className="mono text-green" style={{ fontSize: '11px' }}>
                    {uploadedFile.name.split('.').pop()?.toUpperCase() ?? 'JPG'}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Verification Action */}
            <motion.button
              className="vf-btn vf-btn-primary"
              onClick={onVerify}
              disabled={isRunning}
              whileHover={{ scale: isRunning ? 1 : 1.01 }}
              whileTap={{ scale: isRunning ? 1 : 0.99 }}
              style={{ width: '100%', padding: '14px 20px', fontSize: '12px' }}
            >
              {isRunning ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid #05070a',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'rotate-clockwise 0.8s linear infinite',
                    }}
                  />
                  <span>ANALYZING & COMMITTING EVIDENCE...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>INITIATE FORENSIC TRACE</span>
                </>
              )}
            </motion.button>

            {/* Reset / Change Actions */}
            {!isRunning && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  className="vf-btn vf-btn-secondary vf-btn-sm"
                  onClick={() => inputRef.current?.click()}
                >
                  CHANGE IMAGE
                </button>
                <button
                  className="vf-btn vf-btn-secondary vf-btn-sm"
                  onClick={onReset}
                  style={{ color: 'var(--red)' }}
                >
                  CLEAR INTAKE
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
                e.target.value = ''
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webcam Modal */}
      <AnimatePresence>
        {cameraOpen && (
          <CameraModal
            onCapture={file => {
              handleFile(file)
              setCameraOpen(false)
            }}
            onClose={() => setCameraOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
