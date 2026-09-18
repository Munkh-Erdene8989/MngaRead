interface StarRatingProps {
  value: number
  max?: number
}

export default function StarRating({ value, max = 5 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(value)
        const partial = !filled && i < value
        return (
          <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <defs>
              {partial && (
                <linearGradient id={`star-partial-${i}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${(value % 1) * 100}%`} stopColor="#8B5CF6" />
                  <stop offset={`${(value % 1) * 100}%`} stopColor="#374151" />
                </linearGradient>
              )}
            </defs>
            <path
              d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
              fill={filled ? '#8B5CF6' : partial ? `url(#star-partial-${i})` : '#374151'}
            />
          </svg>
        )
      })}
    </div>
  )
}
