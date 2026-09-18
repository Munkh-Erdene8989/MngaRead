'use client'

import { useLayoutEffect, useRef } from 'react'
import { animate } from 'animejs'
import { MOTION, prefersReducedMotion } from '@/lib/motion'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  className?: string
}

export default function ProgressBar({ value, max = 100, color = '#8B5CF6', className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const barRef = useRef<HTMLDivElement>(null)
  const seen = useRef(false)

  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.style.width = `${pct}%`
      seen.current = true
      return
    }
    const from = seen.current ? undefined : 0
    seen.current = true
    const anim = animate(el, {
      width: from === undefined ? `${pct}%` : [`${from}%`, `${pct}%`],
      duration: MOTION.duration.hero,
      ease: MOTION.ease.enter,
      delay: 40,
    })
    return () => { anim.pause() }
  }, [pct])

  return (
    <div className={`h-1 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden ${className}`}>
      <div
        ref={barRef}
        className="h-full rounded-full"
        style={{ width: seen.current ? `${pct}%` : '0%', background: color }}
      />
    </div>
  )
}
