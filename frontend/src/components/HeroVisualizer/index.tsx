import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { UploadedFile } from '../../types/verification'

interface Props {
  uploadedFile: UploadedFile | null
  isRunning: boolean
}

export function HeroVisualizer({ uploadedFile, isRunning }: Props) {
  const [coords, setCoords] = useState({ x: 52.41, y: 19.82, z: 88.04 })

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setCoords({
        x: Number((50 + (Math.random() * 10 - 5)).toFixed(2)),
        y: Number((20 + (Math.random() * 10 - 5)).toFixed(2)),
        z: Number((85 + (Math.random() * 10 - 5)).toFixed(2)),
      })
    }, 400)
    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className="vf-hologram-card">
      {/* Orbital animated rings */}
      <div className="vf-orbital-ring outer" />
      <div className="vf-orbital-ring mid" />
      <div className="vf-orbital-ring inner" />

      {/* Radar sweep beam */}
      <div className="vf-radar-sweep" />

      {/* Crosshair grids */}
      <div className="vf-reticle-crosshair" />

      {/* Corner crosshair markers */}
      <div className="tactical-corners" style={{ position: 'absolute', inset: 16 }} />

      {/* Centerpiece Image or Abstract Face Wireframe */}
      <div
        style={{
          position: 'relative',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(3, 6, 10, 0.9)',
          border: '1.5px solid rgba(0, 229, 255, 0.4)',
          boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
          zIndex: 5,
        }}
      >
        {uploadedFile ? (
          <img
            src={uploadedFile.preview}
            alt="Target Subject"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            {/* Abstract Biometric Silhouette */}
            <circle cx="50" cy="40" r="22" stroke="var(--cyan)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <path
              d="M26 84C26 68 36 60 50 60C64 60 74 68 74 84"
              stroke="var(--blue)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.6"
            />
            {/* Facial Landmark Tracking Points */}
            <circle cx="42" cy="36" r="2" fill="var(--cyan)" />
            <circle cx="58" cy="36" r="2" fill="var(--cyan)" />
            <circle cx="50" cy="44" r="1.5" fill="var(--green)" />
            <circle cx="45" cy="50" r="1.5" fill="var(--cyan)" />
            <circle cx="55" cy="50" r="1.5" fill="var(--cyan)" />
            <circle cx="50" cy="52" r="2" fill="var(--green)" />
            {/* Geometric Lines connecting landmarks */}
            <line x1="42" y1="36" x2="58" y2="36" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="0.8" />
            <line x1="42" y1="36" x2="50" y2="44" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="0.8" />
            <line x1="58" y1="36" x2="50" y2="44" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="0.8" />
            <line x1="50" y1="44" x2="50" y2="52" stroke="rgba(163, 255, 18, 0.4)" strokeWidth="0.8" />
          </svg>
        )}

        {/* Live Scan Bar on top */}
        {isRunning && (
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
              boxShadow: '0 0 12px 2px rgba(0, 229, 255, 0.9)',
              zIndex: 10,
            }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Floating Technical Telemetry Badges */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.14em',
          color: 'var(--cyan)',
          background: 'rgba(5, 8, 13, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          zIndex: 10,
        }}
      >
        <span>512D EMBEDDING MATRIX</span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.14em',
          color: isRunning ? 'var(--green)' : 'var(--text-muted)',
          background: 'rgba(5, 8, 13, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border-subtle)',
          zIndex: 10,
        }}
      >
        <span>{isRunning ? '● ACTIVE SCAN' : '○ STANDBY'}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: '8.5px',
          color: 'var(--text-secondary)',
          background: 'rgba(5, 8, 13, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border-subtle)',
          zIndex: 10,
        }}
      >
        <span>X:{coords.x} Y:{coords.y} Z:{coords.z}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 18,
          right: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: '8.5px',
          color: 'var(--cyan)',
          background: 'rgba(5, 8, 13, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border-subtle)',
          zIndex: 10,
        }}
      >
        <span>ENGINE: buffalo_l</span>
      </div>
    </div>
  )
}
