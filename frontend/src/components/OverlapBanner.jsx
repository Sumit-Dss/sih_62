export default function OverlapBanner({ overlap }) {
  if (!overlap) return null

  const isDuplicate = overlap.type === 'duplicate'

  return (
    <div
      className={`rounded-xl p-4 mb-6 shadow-sm flex items-start gap-3.5 border-l-[4px] ${
        isDuplicate
          ? 'bg-[#fff4e5] border-[#fc9430] text-[#6e3900]'
          : 'bg-[#fff7ec] border-[#f28c28] text-[#8a4b00]'
      }`}
    >
      <div
        className={`p-2 rounded-lg shrink-0 ${
          isDuplicate ? 'bg-[#ffdcc3] text-[#914d00]' : 'bg-[#ffe4cc] text-[#d97706]'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">
          {isDuplicate ? 'content_copy' : 'warning'}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-[16px] font-bold tracking-tight text-on-surface">
          {overlap.title || (isDuplicate ? 'Possible Duplicate Complaints' : 'Potential Overlapping Cases – Coordination Required')}
        </h3>
        <p className="text-[13px] text-on-surface-variant mt-0.5">
          {overlap.bureaus?.length > 1
            ? `Open cases in ${overlap.bureaus.length} bureaus: `
            : 'Multiple active dockets identified: '}
          {overlap.bureaus?.map((b, i) => (
            <span key={b.bureau} className="font-semibold text-primary">
              {b.bureau} ({b.open}){i < overlap.bureaus.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
