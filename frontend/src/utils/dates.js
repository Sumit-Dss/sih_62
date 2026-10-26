const TODAY = '2026-10-26'

export function daysDiff(fromStr, toStr) {
  const a = new Date(fromStr)
  const b = new Date(toStr)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function countdown(deadline, status) {
  if (!deadline || status === 'disposed') return { text: '—', colorClass: 'text-[#43474e]', isOverdue: false, badge: false }
  const diff = daysDiff(TODAY, deadline)
  if (diff < 0)  return { text: `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} late`,  colorClass: 'bg-[#ffdad6] text-[#93000a]',   isOverdue: true,  badge: true }
  if (diff === 0) return { text: 'Due today',                                                      colorClass: 'bg-[#ffdcc3] text-[#6e3900]',   isOverdue: false, badge: true }
  if (diff <= 3)  return { text: `${diff} day${diff === 1 ? '' : 's'} left`,                      colorClass: 'bg-[#ffdcc3] text-[#6e3900]',   isOverdue: false, badge: true }
  if (diff <= 7)  return { text: `${diff} days left`,                                              colorClass: 'bg-[#ffdcc3]/70 text-[#6e3900]',isOverdue: false, badge: true }
  return { text: `${diff} days left`, colorClass: 'bg-[#edeef0] text-[#43474e]', isOverdue: false, badge: true }
}

export function formatIndianDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
