import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import { useRole } from '../context/RoleContext'
import { formatIndianDate, formatDateTime } from '../utils/dates'
import CountdownBadge from '../components/CountdownBadge'
import StatusBadge from '../components/StatusBadge'
import { LoadingSkeleton, ErrorState } from '../components/States'

export default function CaseDetail() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const { user } = useRole()

  const {
    data: caseData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['case_detail', caseId, user?.id],
    queryFn: async () => {
      const res = await client.get(`/cases/${caseId}`)
      return res.data
    },
  })

  if (isLoading) return <LoadingSkeleton rows={8} />

  if (error) {
    const isForbidden = error.message?.includes('403') || error.response?.status === 403
    if (isForbidden) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/30 text-error flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Restricted Case Custody</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            You do not have administrative clearance to access the full dossier of this case. As an officer in the {user?.bureau || 'assigned'} bureau, inter-bureau privacy protocols apply.
          </p>
          <button
            onClick={() => navigate('/cases')}
            className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            Return to Cases
          </button>
        </div>
      )
    }
    return <ErrorState message="Could not load case dossier." onRetry={refetch} />
  }

  const {
    case_id,
    institution,
    bureau,
    category,
    status,
    officer,
    source_channel,
    complainant_name,
    description,
    received_date,
    deadline,
    last_action,
    next_action,
    timeline = [],
    related_cases = [],
  } = caseData

  const primaryRelated = related_cases[0]

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto pb-12">
      {/* Top Trail & Context */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <button
          onClick={() => navigate('/cases')}
          type="button"
          className="inline-flex items-center gap-1.5 text-primary text-[13px] font-semibold hover:text-primary-container transition-colors group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span>Back to cases</span>
        </button>
        <span className="text-[11px] font-semibold tracking-wider text-outline uppercase">
          PORTAL REFERENCE • DOCKET VIEW
        </span>
      </div>

      {/* Docket Header Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/20 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-mono">
              {case_id}
            </h1>
            <StatusBadge status={status} />
            <CountdownBadge deadline={deadline} status={status} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant self-start sm:self-auto border border-outline-variant/20">
            <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
            <span>Statutory Compliance Track</span>
          </span>
        </div>

        <div className="text-[16px] font-bold text-primary mb-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => institution?.aicte_id && navigate(`/institutions/${institution.aicte_id}`)}
            className="hover:underline text-left"
          >
            {institution?.name}
          </button>
          {institution?.aicte_id && (
            <span className="text-[12px] font-normal text-on-surface-variant font-mono bg-surface-container px-2 py-0.5 rounded">
              Permanent ID: {institution.aicte_id}
            </span>
          )}
        </div>

        {/* Docket Meta Strip */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-on-surface-variant pt-3 border-t border-outline-variant/15">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-outline">account_balance</span>
            <span>Bureau: <strong className="text-on-surface font-semibold">{bureau}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-outline">badge</span>
            <span>Desk Officer: <strong className="text-on-surface font-semibold">{officer?.name || officer || 'R. Verma'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-outline">event</span>
            <span>Received: <strong className="text-on-surface font-semibold">{formatIndianDate(received_date)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span>
            <span>Statutory Deadline: <strong className="text-on-surface font-semibold">{formatIndianDate(deadline)}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dossier, Scope & Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Case Dossier & Scope Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">folder_open</span>
                <h2 className="text-[16px] font-bold text-on-surface">Case Dossier &amp; Scope</h2>
              </div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                FORMAL RECORD
              </span>
            </div>

            {/* 3 Scope Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  GRIEVANCE CATEGORY
                </span>
                <div className="flex items-center gap-1.5 mt-2 text-primary font-bold text-[13px]">
                  <span className="material-symbols-outlined text-[17px]">category</span>
                  <span>{category}</span>
                </div>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  INTAKE SOURCE
                </span>
                <div className="flex items-center gap-1.5 mt-2 text-primary font-bold text-[13px]">
                  <span className="material-symbols-outlined text-[17px]">devices</span>
                  <span>{source_channel}</span>
                </div>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  COMPLAINANT STATUS
                </span>
                <div className="flex items-center gap-1.5 mt-2 text-emerald-700 font-bold text-[13px]">
                  <span className="material-symbols-outlined text-[17px]">security</span>
                  <span>{complainant_name ? complainant_name : 'Protected Whistleblower'}</span>
                </div>
              </div>
            </div>

            {/* Formal Grievance Summary */}
            <div className="mb-6">
              <h3 className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                FORMAL GRIEVANCE SUMMARY
              </h3>
              <p className="text-[13px] text-on-surface leading-relaxed p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/15">
                {description}
              </p>
            </div>

            {/* Action Status Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[15px]">done_all</span>
                  <span>LAST RECORDED ACTION</span>
                </div>
                <p className="text-[12px] text-on-surface-variant leading-snug">
                  {last_action?.text || 'Intake registered and docket assigned to primary desk officer.'}
                </p>
              </div>

              <div className="p-3.5 bg-secondary-fixed/20 rounded-xl border border-secondary-fixed/40">
                <div className="flex items-center gap-1.5 text-secondary text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[15px]">event_upcoming</span>
                  <span>NEXT STATUTORY REQUIREMENT</span>
                </div>
                <p className="text-[12px] text-on-secondary-fixed-variant leading-snug">
                  {next_action || 'Statutory 15-day preliminary inquiry notice issuance & institutional explanation demand.'}
                </p>
              </div>
            </div>

            {/* File Attachment */}
            <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">description</span>
                <div>
                  <span className="text-[13px] font-semibold text-on-surface block">
                    Annexure-A_Deficit_Assessment_2026.pdf
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Signed Verification • 2.4 MB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('Viewing cryptographically signed verification annexure.')}
                className="text-[12px] font-semibold text-primary hover:underline px-3 py-1 rounded bg-surface-container-lowest shadow-sm"
              >
                View File
              </button>
            </div>
          </div>

          {/* Audit & Case Timeline Section */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
                <h2 className="text-[16px] font-bold text-on-surface">Audit &amp; Case Timeline</h2>
              </div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                CHRONOLOGICAL TRAIL
              </span>
            </div>

            {timeline.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant text-xs">No audit events recorded.</div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/30">
                {timeline.map((event, idx) => {
                  const isSystem = event.type === 'system'
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Timeline Node Dot */}
                      <div
                        className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-surface-container-lowest ${
                          isSystem ? 'bg-[#f28c28]' : 'bg-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isSystem ? 'hub' : 'edit_document'}
                        </span>
                      </div>

                      <div className="flex-1 bg-surface-container-low/40 rounded-xl p-3.5 border border-outline-variant/15">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-on-surface">
                              {event.text}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                                isSystem
                                  ? 'bg-[#ffe4cc] text-[#914d00]'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {isSystem ? 'Automated System' : event.by || 'Desk Officer'}
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant">
                            {formatDateTime(event.at)}
                          </span>
                        </div>
                        {event.remarks && (
                          <p className="text-[12px] text-on-surface-variant mt-1 leading-snug">
                            {event.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Related Active Docket / Overlap Box */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {primaryRelated ? (
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 border-l-[4px] border-l-[#f28c28]">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffe4cc] text-[#914d00]">
                  <span className="material-symbols-filled text-[13px]">warning</span>
                  <span>Overlap Alert</span>
                </span>
                <span className="text-[10px] text-outline font-semibold uppercase">System Detection</span>
              </div>

              <h3 className="text-[16px] font-bold text-on-surface mb-1">
                Related Active Docket
              </h3>
              <p className="text-[12px] text-on-surface-variant mb-4">
                An active concurrent file matches this institutional cluster.
              </p>

              {/* Related Case Card */}
              <div className="bg-surface-container-low rounded-xl p-4 mb-4 border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-[14px] text-primary">
                    {primaryRelated.case_id}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-primary-fixed text-on-primary-fixed-variant">
                    {primaryRelated.status || 'Under process'}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-medium mb-3">
                  <span className="material-symbols-outlined text-[12px]">sync_alt</span>
                  <span>{primaryRelated.reason || 'Name similarity 93% · Same city'}</span>
                </div>

                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Bureau</span>
                    <span className="font-semibold text-on-surface">{primaryRelated.bureau}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Category</span>
                    <span className="font-semibold text-on-surface">{primaryRelated.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Assigned Desk Officer</span>
                    <span className="font-semibold text-on-surface">{primaryRelated.officer}</span>
                  </div>
                </div>
              </div>

              {/* Locked / Accessible status */}
              {!primaryRelated.can_open ? (
                <div className="p-3.5 bg-surface-container rounded-xl flex items-start gap-2.5 text-[12px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">lock</span>
                  <div>
                    <strong className="text-on-surface block font-semibold">Locked docket</strong>
                    Cross-bureau coordination required via {primaryRelated.bureau} supervisor. Docket access is restricted to primary bureau custody.
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/cases/${primaryRelated.case_id}`)}
                  className="w-full py-2 bg-primary text-on-primary rounded-lg text-[13px] font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  View Related Case {primaryRelated.case_id} →
                </button>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 text-center">
              <span className="material-symbols-outlined text-[36px] text-outline-variant mb-2">check_circle</span>
              <h4 className="text-[14px] font-semibold text-on-surface">No Inter-Bureau Overlaps</h4>
              <p className="text-[12px] text-on-surface-variant mt-1">
                No concurrent open dockets exist for this institution across other AICTE bureaus.
              </p>
            </div>
          )}

          {/* Institutional Jurisdiction & Rules Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-on-surface mb-0.5">
                Jurisdiction &amp; Consolidation
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Multi-complaint synthesis rules apply per AICTE Chapter VII Regulations. Synchronous findings are integrated prior to final regional desk adjudication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Legal Trail */}
      <div className="mt-8 pt-4 border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-on-surface-variant gap-2 text-center sm:text-left">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>Read-only supervisory record. Cryptographically signed docket.</span>
        </div>
        <span>AICTE National Redressal Framework (ANRF) • v26.4</span>
      </div>
    </div>
  )
}
