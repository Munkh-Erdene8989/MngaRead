'use client'

/** Durations stay under the Doherty threshold (~400ms) so UI still feels instant. */
export const MOTION = {
  duration: {
    press: 110,
    fast: 200,
    base: 320,
    enter: 380,
    hero: 500,
  },
  ease: {
    out: 'out(3)',
    enter: 'out(4)',
    inOut: 'inOut(2)',
  },
  staggerMs: {
    tight: 14,
    base: 26,
  },
  rise: {
    sm: 8,
    md: 14,
    lg: 20,
  },
} as const

export const REDUCE_MQ = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(REDUCE_MQ).matches
}
