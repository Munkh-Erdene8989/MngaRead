'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { animate, cleanInlineStyles, createScope } from 'animejs'
import { MOTION, REDUCE_MQ } from '@/lib/motion'

interface AnimateInProps {
  children: ReactNode
  className?: string
  y?: number
  delay?: number
  duration?: number
}

export default function AnimateIn({
  children,
  className,
  y = MOTION.rise.md,
  delay = 0,
  duration = MOTION.duration.enter,
}: AnimateInProps) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!root.current) return
    const scope = createScope({
      root,
      mediaQueries: { reduceMotion: REDUCE_MQ },
    }).add((self) => {
      if (!self || self.matches.reduceMotion || !root.current) return
      animate(root.current, {
        opacity: [0, 1],
        y: [y, 0],
        delay,
        duration,
        ease: MOTION.ease.enter,
        onComplete: (ins) => cleanInlineStyles(ins),
      })
    })
    return () => scope.revert()
  }, [y, delay, duration])

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  )
}
