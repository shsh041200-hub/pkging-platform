'use client'
import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  className?: string
  duration?: number
}

export function AnimatedCounter({ target, className, duration = 1400 }: AnimatedCounterProps) {
  const [count, setCount] = useState(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startVal = Math.max(0, target - 70)
    const startTime = Date.now()

    function tick() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startVal + (target - startVal) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    setCount(startVal)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return <span className={className}>{count.toLocaleString()}</span>
}
