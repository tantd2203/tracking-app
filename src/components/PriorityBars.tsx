/** 3 vạch tăng dần, số vạch sáng theo mức ưu tiên (0–3). */
const BAR_HEIGHTS = ['h-[6px]', 'h-[10px]', 'h-[14px]']

export function PriorityBars({ level, color }: { level: number; color: string }) {
  return (
    <span aria-hidden="true" className="flex items-end gap-[2px]">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={h}
          className={`w-[3px] rounded-sm ${h}`}
          style={{ background: i < level ? color : 'var(--color-line)' }}
        />
      ))}
    </span>
  )
}
