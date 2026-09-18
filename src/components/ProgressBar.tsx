interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  className?: string
}

export default function ProgressBar({ value, max = 100, color = '#8B5CF6', className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`h-1 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}
