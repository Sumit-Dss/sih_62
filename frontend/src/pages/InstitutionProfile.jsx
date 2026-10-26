import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import { useRole } from '../context/RoleContext'
import { formatIndianDate } from '../utils/dates'
import OverlapBanner from '../components/OverlapBanner'
import StatusBadge from '../components/StatusBadge'
import CountdownBadge from '../components/CountdownBadge'
import { LoadingSkeleton, ErrorState } from '../components/States'

export default function InstitutionProfile() {
  const { aicteId } = useParams()
  const navigate = useNavigate()
  const { user } = useRole()

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['institution_profile', aicteId, user?.id],
    queryFn: async () => {
      const res = await client.get(`/institutions/${aicteId}`)
      return res.data
    },
  })

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error || !profile) {
    return (
      <ErrorState
        message={`Institution with AICTE ID "${aicteId}" was not found.`}
        onRetry={refetch}
      />
    )
  }

  const { institution, summary, overlap, bureaus = [] } = profile

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto pb-12">
      {/* Top Trail */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="inline-flex items-center gap-1.5 text-primary text-[13px] font-semibold hover:text-primary-container transition-colors group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span>Back</span>
        </button>
        <span className="text-[11px] font-semibold tracking-wider text-outline uppercase">
          INSTITUTION DOSSIER • SINGLE SOURCE OF TRUTH
        </span>
      </div>

      {/* Identity Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/20 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-outline-variant/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                {institution.type || 'Technical Institution'}
              </span>
              <span className="text-[12px] font-mono font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                AICTE ID: {institution.aicte_id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {institution.name}
            </h1>
            <p className="text-[13px] text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
              <span>{institution.city}, {institution.state} • {institution.region} Region</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-[13px]">
          <div>
            <span className="text-[11px] font-semibold text-outline uppercase block">Campus Address</span>
            <span className="text-on-surface">{institution.address || `${institution.city}, ${institution.state}`}</span>
          </div>

          {institution.aliases && institution.aliases.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-outline uppercase block">
                Known Name Variations (Aliases)
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {institution.aliases.map((alias, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono border border-outline-variant/20"
                  >
                    &ldquo;{alias}&rdquo;
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlap / Duplicate Banner */}
      <OverlapBanner overlap={overlap} />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/15 text-center">
          <span className="text-2xl font-bold text-primary block">{summary?.total ?? 0}</span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Total Cases</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/15 text-center">
          <span className="text-2xl font-bold text-blue-700 block">{summary?.open ?? 0}</span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Open Active</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/15 text-center">
          <span className="text-2xl font-bold text-emerald-700 block">{summary?.disposed ?? 0}</span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Disposed</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/15 text-center">
          <span className="text-2xl font-bold text-error block">{summary?.overdue ?? 0}</span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Overdue</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/15 text-center col-span-2 sm:col-span-1">
          <span className="text-2xl font-bold text-[#f28c28] block">{summary?.bureaus_involved ?? 1}</span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Bureaus Involved</span>
        </div>
      </div>

      {/* Bureau Case Groups */}
      <div className="flex flex-col gap-6">
        {bureaus.map((group) => {
          const hasFullAccess = group.full_access

          return (
            <div
              key={group.bureau}
              className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden"
            >
              {/* Bureau Section Header */}
              <div className="px-6 py-4 bg-surface-container-low/60 border-b border-outline-variant/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                  <h3 className="text-[15px] font-bold text-on-surface">
                    {group.bureau}{' '}
                    <span className="text-on-surface-variant font-normal text-[13px]">
                      ({group.total} case{group.total === 1 ? '' : 's'} • {group.open} open)
                    </span>
                  </h3>
                </div>

                {!hasFullAccess ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Key fields only (Inter-bureau privacy)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>Full Administrative Access</span>
                  </span>
                )}
              </div>

              {/* Table of Cases in this Bureau */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-outline-variant/15 text-[11px] font-semibold text-outline uppercase tracking-wider bg-surface-container-low/20">
                      <th className="py-3 px-6">Case ID</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Officer</th>
                      <th className="py-3 px-4">Received</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-6 text-right">Countdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {group.cases.map((c) => {
                      const canOpenThis = c.can_open
                      return (
                        <tr
                          key={c.case_id}
                          onClick={() => {
                            if (canOpenThis) {
                              navigate(`/cases/${c.case_id}`)
                            }
                          }}
                          className={`transition-colors ${
                            canOpenThis
                              ? 'hover:bg-surface-container-low/70 cursor-pointer'
                              : 'bg-surface-container-low/30 cursor-not-allowed select-none opacity-80'
                          }`}
                        >
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono font-bold ${canOpenThis ? 'text-primary hover:underline' : 'text-outline'}`}>
                                {c.case_id}
                              </span>
                              {!canOpenThis && (
                                <span className="material-symbols-outlined text-[14px] text-outline" title="Access restricted to primary bureau custody">
                                  lock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-on-surface">
                            {c.category}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3.5 px-4 text-on-surface whitespace-nowrap">
                            {c.officer}
                          </td>
                          <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                            {formatIndianDate(c.received_date)}
                          </td>
                          <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                            {formatIndianDate(c.deadline)}
                          </td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            <CountdownBadge deadline={c.deadline} status={c.status} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
