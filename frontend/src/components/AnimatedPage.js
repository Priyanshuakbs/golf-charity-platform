// src/components/AnimatedPage.jsx
// Drop this wrapper around any page's <main> content for instant animations
// Usage: wrap your page content in <AnimatedPage> ... </AnimatedPage>

import { useEffect, useRef, useState } from 'react'

// ── Hook: trigger animation when element enters viewport ──────────────────
export function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}

// ── FadeUp: animates children when they scroll into view ─────────────────
export function FadeUp({ children, delay = 0, className = '', style = {} }) {
  const [ref, visible] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── FadeIn: simple opacity fade ───────────────────────────────────────────
export function FadeIn({ children, delay = 0, className = '', style = {} }) {
  const [ref, visible] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 0.6s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── SlideIn: slides from left or right ────────────────────────────────────
export function SlideIn({ children, direction = 'left', delay = 0, className = '', style = {} }) {
  const [ref, visible] = useInView()
  const tx = direction === 'left' ? '-28px' : '28px'
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${tx})`,
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── ScaleIn: scales up from slightly smaller ──────────────────────────────
export function ScaleIn({ children, delay = 0, className = '', style = {} }) {
  const [ref, visible] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.93)',
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── StaggerChildren: wraps a list and staggers each child ─────────────────
export function StaggerList({ children, baseDelay = 0, stagger = 0.08, className = '' }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${baseDelay + i * stagger}s, transform 0.5s ease ${baseDelay + i * stagger}s`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

// ── CountUp: animates a number from 0 to target ───────────────────────────
export function CountUp({ to, duration = 1.5, prefix = '', suffix = '', className = '' }) {
  const [ref, visible] = useInView()
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!visible || started.current) return
    started.current = true
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * to))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [visible, to, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// ── ProgressBar: animated width bar ──────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#4ade80', delay = 0, height = 6, className = '' }) {
  const [ref, visible] = useInView()
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div ref={ref} className={className} style={{ height, background: 'rgba(255,255,255,0.06)', borderRadius: height, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        borderRadius: height,
        transform: visible ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: `transform 1.2s cubic-bezier(0.65,0,0.35,1) ${delay}s`,
      }} />
    </div>
  )
}

// ── AnimatedPage: wraps a page with entrance animation ────────────────────
export default function AnimatedPage({ children, className = '' }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t) }, [])

  return (
    <div
      className={className}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </div>
  )
}