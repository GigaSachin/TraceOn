export function Footer() {
  return (
    <footer className="vf-footer">
      <div className="vf-container">
        <div className="vf-footer-responsive">
          {/* Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em' }}>
                TRACE<span style={{ color: 'var(--cyan)' }}>ON</span>
              </span>
              <span className="vf-pill" style={{ fontSize: '8.5px', padding: '2px 8px' }}>
                HACKER HOUSE GOA 2026
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Trace the Face. Prove the Evidence.
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-muted"
              style={{ fontSize: '11px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              BASE SEPOLIA EXPLORER ↗
            </a>
            <span className="mono text-muted" style={{ fontSize: '11px' }}>
              BASE L2 · 84532
            </span>
          </div>
        </div>

        {/* Forensic Disclaimer */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          Biometric vectors are processed ephemeral in-memory and never written to chain. Only cryptographic SHA-256 evidence digests conforming to RFC-8785 are permanently anchored on the Base Sepolia blockchain.
        </div>
      </div>
    </footer>
  )
}
