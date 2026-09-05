import { useEffect, useState } from 'react'
import type { HealthResponse } from '../../types/verification'

interface Props {
  health: HealthResponse | null
  activeTab: 'verify' | 'pipeline' | 'evidence' | 'proof' | 'about'
  onTabChange: (tab: 'verify' | 'pipeline' | 'evidence' | 'proof' | 'about') => void
  onOpenDemoSamples: () => void
}

export function Header({ health, activeTab, onTabChange, onOpenDemoSamples }: Props) {
  const [time, setTime] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toISOString().substring(11, 19) + ' UTC')
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNav = (tab: 'verify' | 'pipeline' | 'evidence' | 'proof' | 'about') => {
    onTabChange(tab)
    setMenuOpen(false)
  }

  return (
    <header className="vf-header">
      <div className="vf-container">
        <div className="vf-header__inner">
          {/* TRACEON Logo */}
          <div className="vf-logo-wrap" onClick={() => handleNav('verify')}>
            <div className="vf-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="var(--cyan)" strokeWidth="1.2" strokeDasharray="3 2" />
                <circle cx="12" cy="12" r="3" fill="var(--cyan)" />
                <path d="M8 8H16M12 8V17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 7V4H7M17 4H20V7M20 17V20H17M7 20H4V17" stroke="var(--cyan)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="vf-logo-text">
                TRACE<span className="accent">ON</span>
              </div>
              <div className="vf-logo-tagline">Visual Forensics · Base Sepolia</div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="vf-nav-links" aria-label="Main Navigation">
            <button
              className={`vf-nav-link ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => handleNav('verify')}
            >
              INVESTIGATE
            </button>
            <button
              className={`vf-nav-link ${activeTab === 'pipeline' ? 'active' : ''}`}
              onClick={() => handleNav('pipeline')}
            >
              PIPELINE
            </button>
            <button
              className={`vf-nav-link ${activeTab === 'evidence' ? 'active' : ''}`}
              onClick={() => handleNav('evidence')}
            >
              EVIDENCE
            </button>
            <button
              className={`vf-nav-link ${activeTab === 'proof' ? 'active' : ''}`}
              onClick={() => handleNav('proof')}
            >
              PROOF LAYER
            </button>
            <button
              className={`vf-nav-link ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => handleNav('about')}
            >
              ABOUT
            </button>
          </nav>

          {/* Desktop System Telemetry Cluster */}
          <div className="vf-header-telemetry">
            <button
              className="vf-btn vf-btn-secondary vf-btn-sm"
              onClick={onOpenDemoSamples}
              title="Load instant test cases for 2-minute demo"
              style={{ fontSize: '9.5px', padding: '6px 10px', height: '28px' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              DEMO PRESETS
            </button>

            {health ? (
              <div className="vf-pill green" title="Backend Core Service is Online">
                <span className="vf-dot pulse" />
                SYSTEM ONLINE
              </div>
            ) : (
              <div className="vf-pill red" title="Connecting to Backend...">
                <span className="vf-dot" />
                CONNECTING
              </div>
            )}

            <div className="vf-pill blue" title="Connected to Base Sepolia Network">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              BASE SEPOLIA · 84532
            </div>

            <div className="mono text-muted" style={{ fontSize: '10.5px', letterSpacing: '0.08em' }}>
              {time || '00:00:00 UTC'}
            </div>
          </div>

          {/* Mobile: Health Indicator (always visible) + Hamburger */}
          <div className="show-mobile" style={{ alignItems: 'center', gap: '10px' }}>
            {health ? (
              <div className="vf-pill green" style={{ fontSize: '8px', padding: '3px 8px' }}>
                <span className="vf-dot pulse" />
                ONLINE
              </div>
            ) : (
              <div className="vf-pill red" style={{ fontSize: '8px', padding: '3px 8px' }}>
                <span className="vf-dot" />
                OFFLINE
              </div>
            )}

            <button
              className={`vf-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="vf-hamburger__line" />
              <span className="vf-hamburger__line" />
              <span className="vf-hamburger__line" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      <div
        className={`vf-mobile-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      <div className={`vf-mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <button
          className={`vf-nav-link ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => handleNav('verify')}
        >
          INVESTIGATE
        </button>
        <button
          className={`vf-nav-link ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => handleNav('pipeline')}
        >
          PIPELINE
        </button>
        <button
          className={`vf-nav-link ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => handleNav('evidence')}
        >
          EVIDENCE
        </button>
        <button
          className={`vf-nav-link ${activeTab === 'proof' ? 'active' : ''}`}
          onClick={() => handleNav('proof')}
        >
          PROOF LAYER
        </button>
        <button
          className={`vf-nav-link ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => handleNav('about')}
        >
          ABOUT
        </button>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 0' }} />

        <button
          className="vf-btn vf-btn-primary vf-btn-sm"
          onClick={() => { onOpenDemoSamples(); setMenuOpen(false) }}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          DEMO PRESETS
        </button>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 0' }} />

        {/* Mobile status pills */}
        {health ? (
          <div className="vf-pill green">
            <span className="vf-dot pulse" />
            SYSTEM ONLINE
          </div>
        ) : (
          <div className="vf-pill red">
            <span className="vf-dot" />
            BACKEND CONNECTING
          </div>
        )}

        <div className="vf-pill blue">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          BASE SEPOLIA · 84532
        </div>

        <div className="mono text-muted" style={{ fontSize: '10.5px', letterSpacing: '0.08em', textAlign: 'center', padding: '4px 0' }}>
          {time || '00:00:00 UTC'}
        </div>
      </div>
    </header>
  )
}
