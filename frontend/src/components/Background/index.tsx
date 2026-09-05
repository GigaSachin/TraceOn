import { useEffect, useRef } from 'react'

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle nodes for cyber forensics feel
    const particleCount = Math.min(36, Math.floor(width / 35))
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Subtle trace vectors between close nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.12
            ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="vf-bg">
      <div className="vf-bg__grid" />
      <div className="vf-bg__glow-1" />
      <div className="vf-bg__glow-2" />
      <div className="vf-bg__glow-3" />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, opacity: 0.65 }} />
      <div className="vf-bg__noise" />
    </div>
  )
}
