import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useRole } from '../context/RoleContext'
import { useDateRange } from '../context/DateRangeContext'
import { formatIndianDate } from '../utils/dates'
import CountdownBadge from '../components/CountdownBadge'
import { LoadingSkeleton, ErrorState } from '../components/States'

export default function Dashboard() {
  const { user } = useRole()
  const { range } = useDateRange()
  const navigate = useNavigate()

  const {
    data: kpis,
    isLoading: loadingKpis,
    error: errorKpis,
    refetch: refetchKpis,
  } = useQuery({
    queryKey: ['dashboard_kpis', user?.id, range?.from, range?.to],
    queryFn: async () => {
      const res = await client.get('/dashboard/kpis', { params: { from: range?.from, to: range?.to } })
      return res.data
    },
  })

  const {
    data: attentionCases = [],
    isLoading: loadingAttention,
    error: errorAttention,
    refetch: refetchAttention,
  } = useQuery({
    queryKey: ['dashboard_attention', user?.id, range?.from, range?.to],
    queryFn: async () => {
      const res = await client.get('/dashboard/attention', { params: { limit: 10 } })
      return res.data
    },
  })

  const kpiCards = [
    { label: 'Total', value: kpis?.total, border: 'border-l-[#022448]', link: '/cases', valueClass: 'text-[#022448]' },
    { label: 'Pending', value: kpis?.pending, border: 'border-l-[#00838f]', link: '/cases?status=pending', valueClass: 'text-on-surface' },
    { label: 'Under process', value: kpis?.under_process, border: 'border-l-[#1976d2]', link: '/cases?status=under_process', valueClass: 'text-on-surface' },
    { label: 'Disposed', value: kpis?.disposed, border: 'border-l-[#2e7d32]', link: '/cases?status=disposed', valueClass: 'text-on-surface' },
    { label: 'Transferred', value: kpis?.transferred, border: 'border-l-[#8d6e63]', link: '/cases?status=transferred', valueClass: 'text-on-surface' },
    { label: 'Overdue', value: kpis?.overdue, border: 'border-l-[#ba1a1a]', link: '/cases?overdue=true', valueClass: 'text-[#ba1a1a]' },
  ]

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Dashboard</h1>
        <span className="text-sm text-on-surface-variant font-medium">1 Jan – 26 Oct 2026</span>
      </div>

      {/* KPI Cards Strip */}
      {loadingKpis ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-low rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : errorKpis ? (
        <ErrorState message="Could not load KPI indicators." onRetry={refetchKpis} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              onClick={() => navigate(kpi.link)}
              className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm border-l-[3.5px] ${kpi.border} flex flex-col justify-center cursor-pointer hover:shadow-md transition-all duration-150 transform hover:-translate-y-0.5`}
            >
              <span className={`text-[32px] font-bold leading-none tracking-tight ${kpi.valueClass}`}>
                {kpi.value ?? 0}
              </span>
              <span className="text-[12px] font-medium text-on-surface-variant mt-2">
                {kpi.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cases Needing Attention Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-on-surface tracking-tight">Cases Needing Attention</h2>
          <button
            onClick={() => navigate('/cases?attention=true')}
            className="text-[13px] font-semibold text-primary hover:text-primary-container hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {loadingAttention ? (
          <LoadingSkeleton rows={6} />
        ) : errorAttention ? (
          <ErrorState message="Failed to load attention cases." onRetry={refetchAttention} />
        ) : attentionCases.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-[36px] text-emerald-600 mb-2">task_alt</span>
            <div className="font-semibold text-on-surface">No cases need urgent attention!</div>
            <p className="text-xs text-on-surface-variant mt-1">All active complaints are progressing within their statutory 30-day window.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 text-[11px] font-semibold text-outline uppercase tracking-wider select-none bg-surface-container-low/40">
                  <th className="py-3 px-6">CASE ID</th>
                  <th className="py-3 px-4 min-w-[240px]">INSTITUTION</th>
                  <th className="py-3 px-4">BUREAU</th>
                  <th className="py-3 px-4">OFFICER</th>
                  <th className="py-3 px-4">DEADLINE</th>
                  <th className="py-3 px-6 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-[13px]">
                {attentionCases.map((c) => (
                  <tr
                    key={c.case_id}
                    onClick={() => navigate(`/cases/${c.case_id}`)}
                    className="hover:bg-surface-container-low/60 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono font-bold text-primary tracking-tight">
                        {c.case_id}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-on-surface leading-snug">
                        {c.institution?.name?.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {c.institution?.name?.split(',').slice(1).join(',').trim()}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-on-surface">
                      {c.bureau}
                    </td>
                    <td className="py-4 px-4 text-on-surface">
                      {c.officer}
                    </td>
                    <td className="py-4 px-4 text-on-surface font-medium whitespace-nowrap">
                      {formatIndianDate(c.deadline)}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <CountdownBadge deadline={c.deadline} status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
