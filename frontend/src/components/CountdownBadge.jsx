import { countdown } from '../utils/dates'

export default function CountdownBadge({ deadline, status }) {
  const { text, colorClass, badge } = countdown(deadline, status)
  if (!badge) return <span className="text-[#74777f] text-xs">—</span>
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold ${colorClass}`}>
      {text}
    </span>
  )
}
