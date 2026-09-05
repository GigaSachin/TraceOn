import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onCapture: (file: File) => void
  onClose: () => void
}

export function CameraModal({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [captured, setCaptured] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)

  useEffect(() => {
    let s: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } })
      .then(stream => {
        s = stream
        setStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      })
      .catch(err => {
        setError('Camera access denied. Please allow camera permissions.')
        console.error(err)
      })
    return () => { s?.getTracks().forEach(t => t.stop()) }
  }, [])

  const capture = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    // Mirror horizontally for selfie feel
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    setCaptured(dataUrl)
    canvas.toBlob(blob => { if (blob) setCapturedBlob(blob) }, 'image/jpeg', 0.95)
    // Stop camera preview
    stream?.getTracks().forEach(t => t.stop())
  }

  const retake = () => {
    setCaptured(null)
    setCapturedBlob(null)
    navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } })
      .then(s => {
        setStream(s)
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play() }
      })
  }

  const useCapture = () => {
    if (!capturedBlob) return
    const file = new File([capturedBlob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
    onCapture(file)
  }

  return (
    <motion.div
      className="vf-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="vf-camera-modal"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vf-camera-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--cyan)' }}>
              LIVE CAPTURE
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 4, borderRadius: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Video / Preview */}
        <div className="vf-camera-modal__video">
          {!captured ? (
            <>
              {error ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📵</div>
                  <p style={{ color: 'var(--red)', fontSize: 13, lineHeight: 1.5 }}>{error}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              )}
              {!error && <div className="vf-camera-modal__scanline" />}
            </>
          ) : (
            <img src={captured} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}

          {/* Face guide overlay */}
          {!captured && !error && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <div style={{
                width: 160, height: 200, border: '1.5px solid rgba(0,229,255,0.4)', borderRadius: '50%',
                boxShadow: '0 0 30px rgba(0,229,255,0.1)',
              }} />
            </div>
          )}

          {/* Status label */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: captured ? 'var(--green)' : 'var(--cyan)',
            background: 'rgba(5,7,9,0.8)', padding: '3px 12px', borderRadius: 4,
            border: `1px solid ${captured ? 'rgba(0,255,157,0.2)' : 'rgba(0,229,255,0.2)'}`,
          }}>
            {captured ? '✓ CAPTURED' : 'POSITION FACE IN FRAME'}
          </div>
        </div>

        {/* Actions */}
        <div className="vf-camera-modal__actions">
          {!captured ? (
            <>
              <button className="vf-btn vf-btn-secondary" style={{ flex: 1 }} onClick={onClose}>CANCEL</button>
              <button
                className="vf-btn vf-btn-primary"
                style={{ flex: 2 }}
                onClick={capture}
                disabled={!!error}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="8"/>
                </svg>
                CAPTURE PHOTO
              </button>
            </>
          ) : (
            <>
              <button className="vf-btn vf-btn-secondary" style={{ flex: 1 }} onClick={retake}>RETAKE</button>
              <button className="vf-btn vf-btn-primary" style={{ flex: 2 }} onClick={useCapture}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                USE THIS PHOTO
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
