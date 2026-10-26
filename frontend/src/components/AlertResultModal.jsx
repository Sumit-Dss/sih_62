import { useNavigate } from 'react-router-dom'

export default function AlertResultModal({ alertData, newCase, institutionMatch, onClose }) {
  const navigate = useNavigate()
  if (!alertData) return null

  const isDuplicate = alertData.type === 'duplicate'
  const related = alertData.related_cases?.[0] || {}

  const handleOpenNew = () => {
    if (newCase?.case_id) {
      navigate(`/cases/${newCase.case_id}`)
    }
    onClose()
  }

  const handleViewExisting = () => {
    if (related.can_open && related.case_id) {
      navigate(`/cases/${related.case_id}`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 top-16 left-0 lg:left-64 z-50 flex items-center justify-center p-4 bg-on-background/55 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative bg-surface-container-lowest rounded-xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden transition-all duration-300 transform scale-100">
        {/* Top Accent Stripe */}
        <div className={`h-1.5 w-full ${isDuplicate ? 'bg-secondary-container' : 'bg-[#f28c28]'}`}></div>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between bg-surface-container-lowest">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-lg flex items-center justify-center shadow-sm ${
                isDuplicate
                  ? 'bg-secondary-fixed/40 text-secondary'
                  : 'bg-secondary-fixed/50 text-[#914d00]'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isDuplicate ? 'content_copy' : 'warning'}
              </span>
            </div>
            <div>
              <h2 className="text-[20px] text-on-surface font-bold tracking-tight">
                {isDuplicate
                  ? 'Possible Duplicate Complaint – Please Review'
                  : 'Potential Overlapping Cases – Coordination Required'}
              </h2>
              <p className="text-[13px] text-on-surface-variant mt-0.5">
                {isDuplicate
                  ? 'AICTE Sangam detected an active complaint with identical institution and category in the same bureau.'
                  : 'AICTE Sangam identified existing regulatory dockets for this institution across bureaus.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="px-6 pb-4">
          {/* Match Details Callout */}
          <div className="bg-surface-container-low rounded-lg p-3.5 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-outline-variant/15">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  You entered:
                </span>
                <span className="text-[13px] font-semibold text-on-surface">
                  &ldquo;{institutionMatch?.typed_name || newCase?.typed_institution_name || 'Sunrise Engg Clg Nagpur'}&rdquo;
                </span>
              </div>
              <span className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant text-[11px] px-2.5 py-1 rounded-full font-medium self-start sm:self-auto">
                <span className="material-symbols-outlined text-[13px] text-tertiary-container">done_all</span>
                {institutionMatch?.reason || 'name similarity 93% · same city'}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Matched to:
              </span>
              <span className="text-[14px] font-bold text-primary">
                {institutionMatch?.matched?.name || 'Sunrise Engineering College, Nagpur'}
              </span>
              <span className="text-[12px] text-on-surface-variant font-mono bg-surface-container px-1.5 py-0.5 rounded">
                (AICTE ID: {institutionMatch?.matched?.aicte_id || '1-12345'})
              </span>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3">
            {/* Left Card: New Complaint */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3.5 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-fixed text-on-primary-fixed">
                    NEW CASE
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                    Pending
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">Case Reference</div>
                <div className="text-[17px] text-on-surface font-bold tracking-tight mb-3 font-mono">
                  {newCase?.case_id || 'AICTE-2026-000043'}
                </div>

                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant">Category:</span>
                    <span className="font-medium text-on-surface">{newCase?.category || 'Infrastructure'}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant">Bureau:</span>
                    <span className="font-semibold text-primary">{newCase?.bureau || 'RB (Regulation Bureau)'}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-on-surface-variant">Assigned Officer:</span>
                    <span className="font-medium text-on-surface">{newCase?.officer || 'R. Verma'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2 flex items-center gap-1.5 text-on-surface-variant text-[11px] bg-surface-container-low px-2 py-1.5 rounded">
                <span className="material-symbols-outlined text-[15px] text-primary">pending_actions</span>
                <span>Docket ready for formal intake</span>
              </div>
            </div>

            {/* Right Card: Existing Complaint */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3.5 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed-variant">
                    EXISTING CASE
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-fixed text-on-primary-fixed-variant">
                    {related.status || 'Under process'}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant">Case Reference</div>
                <div className="text-[17px] text-on-surface font-bold tracking-tight mb-3 font-mono">
                  {related.case_id || 'AICTE-2026-000041'}
                </div>

                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant">Category:</span>
                    <span className="font-medium text-on-surface">{related.category || 'Fee refund'}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant">Bureau:</span>
                    <span className="font-semibold text-secondary">{related.bureau || 'PGRC'}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-on-surface-variant">Assigned Officer:</span>
                    <span className="font-medium text-on-surface">{related.officer || 'A. Sharma'}</span>
                  </div>
                </div>
              </div>

              {!related.can_open ? (
                <div className="mt-3.5 p-2 bg-secondary-fixed/30 rounded-md flex items-center gap-1.5 text-[11px] text-on-secondary-fixed-variant font-medium">
                  <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">lock</span>
                  <span>Handled by {related.bureau || 'PGRC'} – contact {related.officer || 'A. Sharma'}</span>
                </div>
              ) : isDuplicate ? (
                <div className="mt-3.5 p-2 bg-secondary-fixed/30 rounded-md flex items-center gap-1.5 text-[11px] text-on-secondary-fixed-variant font-medium">
                  <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">merge_type</span>
                  <span>Same bureau &amp; category – merge candidate</span>
                </div>
              ) : (
                <div className="mt-3.5 p-2 bg-surface-container-low rounded-md flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-[15px] text-primary shrink-0">info</span>
                  <span>Accessible in your current bureau custody</span>
                </div>
              )}
            </div>
          </div>

          {/* Statutory Redressal Note */}
          <div className="flex items-start gap-2 p-2.5 bg-surface-container-low rounded-lg text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0 mt-0.5">info</span>
            <p className="leading-snug">
              <strong>Statutory Redressal Note:</strong> Proceeding will register docket {newCase?.case_id || 'AICTE-2026-000043'} under {newCase?.bureau || 'Regulation Bureau'} while automatically flagging an inter-bureau coordination notice to {related.bureau || 'PGRC'} for cross-verification.
            </p>
          </div>
        </div>

        {/* Modal Footer Action Bar */}
        <div className="px-6 py-3.5 bg-surface-container-low border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          {related.can_open ? (
            <button
              onClick={handleViewExisting}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-container text-[13px] font-semibold transition-colors"
              type="button"
            >
              <span>View full case {related.case_id}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 text-outline text-[12px] font-medium">
              <span>View full case {related.case_id}</span>
              <span className="text-[10px] uppercase font-bold text-error bg-error-container/40 px-1.5 py-0.5 rounded">
                [blocked]
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-[13px] font-medium shadow-sm border border-outline-variant/20"
              type="button"
            >
              Close
            </button>

            {isDuplicate && (
              <button
                type="button"
                onClick={() => {
                  alert(`Case merged into ${related.case_id} as addendum.`)
                  onClose()
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed-dim transition-colors text-[13px] font-semibold shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call_merge</span>
                <span>Merge with existing</span>
              </button>
            )}

            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-colors text-[13px] font-semibold shadow-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Open new case</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
