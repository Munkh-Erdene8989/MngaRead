interface GenreChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export default function GenreChip({ label, active, onClick, onRemove, size = 'md' }: GenreChipProps) {
  const base =
    size === 'sm'
      ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95'
      : 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95'

  const color = active
    ? 'bg-[#8B5CF6] text-white'
    : onClick
    ? 'bg-[rgba(139,92,246,0.12)] text-[#9CA3AF] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(139,92,246,0.2)] hover:text-[#F5F7FA] cursor-pointer'
    : 'bg-[rgba(255,255,255,0.06)] text-[#9CA3AF] border border-[rgba(255,255,255,0.08)]'

  return (
    <span className={`${base} ${color}`} onClick={onClick}>
      {label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="ml-0.5 hover:text-white transition-colors"
          aria-label="Устгах"
        >
          ×
        </button>
      )}
    </span>
  )
}
