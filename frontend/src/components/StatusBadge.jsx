const styles = {
  pending:       'bg-[#e1e2e4] text-[#43474e]',
  under_process: 'bg-blue-50 text-blue-700 border border-blue-200',
  disposed:      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  transferred:   'bg-purple-50 text-purple-700 border border-purple-200',
  escalated:     'bg-rose-50 text-rose-700 border border-rose-200',
}

const labels = {
  pending: 'Pending',
  under_process: 'Under process',
  disposed: 'Disposed',
  transferred: 'Transferred',
  escalated: 'Escalated',
}

export default function StatusBadge({ status }) {
  const cls = styles[status] || 'bg-[#e1e2e4] text-[#43474e]'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${cls}`}>
      {labels[status] || status}
    </span>
  )
}
