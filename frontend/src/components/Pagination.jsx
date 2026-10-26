export default function Pagination({ page, total, pageSize = 20, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)
  const visible = pages.slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))

  return (
    <div className="p-4 border-t border-[#c4c6cf]/20 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span className="text-[12px] text-[#43474e]">
        Showing <span className="font-semibold text-[#191c1e]">{start}–{end}</span> of <span className="font-semibold text-[#191c1e]">{total}</span> cases
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="px-2.5 py-1 text-[#74777f] disabled:opacity-40 text-[11px] rounded border border-[#c4c6cf]/30 bg-[#f2f4f6] flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          Previous
        </button>
        {visible.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-7 flex items-center justify-center text-[11px] rounded font-semibold transition-colors ${
              p === page ? 'bg-[#022448] text-white shadow-sm' : 'text-[#191c1e] hover:bg-[#f2f4f6]'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="px-2.5 py-1 text-[#191c1e] disabled:opacity-40 text-[11px] rounded border border-[#c4c6cf]/40 bg-white hover:bg-[#f2f4f6] flex items-center gap-1"
        >
          Next
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
