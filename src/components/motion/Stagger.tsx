'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { animate, cleanInlineStyles, createScope, stagger } from 'animejs'
import { MOTION, REDUCE_MQ } from '@/lib/motion'

interface StaggerProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
}

export default function Stagger({
  children,
  className,
  delay = MOTION.staggerMs.base,
  duration = MOTION.duration.enter,
  y = MOTION.rise.md,
}: StaggerProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!root.current) return
    const scope = createScope({
      root,
      mediaQueries: { reduceMotion: REDUCE_MQ },
    }).add((self) => {
      if (!self || self.matches.reduceMotion || !root.current) return
      const items = root.current.children
      if (!items.length) return
      animate(items, {
        opacity: [0, 1],
        y: [y, 0],
        delay: stagger(delay, { start: 40 }),
        duration,
        ease: MOTION.ease.enter,
        onComplete: (ins) => cleanInlineStyles(ins),
      })
    })
    return () => scope.revert()
  }, [delay, duration, y])

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  )
}
