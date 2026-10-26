import { useNavigate } from 'react-router-dom'

export default function KPICard({ label, value, borderColor, to, valueClass }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => to && navigate(to)}
      className={`relative bg-white rounded-xl p-6 shadow-sm border-l-[3px] ${borderColor} flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow`}
    >
      <span className={`text-[28px] font-bold leading-none ${valueClass || 'text-[#191c1e]'}`}>{value ?? '—'}</span>
      <span className="text-[12px] font-medium text-[#43474e] mt-1 tracking-wide">{label}</span>
    </div>
  )
}
