export function CardSkeleton() {
  return (
    <div>
      <div className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />
      <div className="mt-2 space-y-1.5">
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-2.5 rounded w-1/2" />
      </div>
    </div>
  )
}

export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}
