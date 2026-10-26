import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import client from '../api/client'
import { useRole } from '../context/RoleContext'
import { addDays } from '../api/mockStore'
import { formatIndianDate } from '../utils/dates'
import AlertResultModal from '../components/AlertResultModal'

export default function NewComplaint() {
  const navigate = useNavigate()
  const { user } = useRole()

  const defaultBureau = user?.bureau || 'RB'
  const isOfficer = user?.role === 'RB_OFFICER' || user?.role === 'PGRC_OFFICER'

  const [institutionName, setInstitutionName] = useState('Sunrise Engg Clg Nagpur')
  const [aicteId, setAicteId] = useState('')
  const [city, setCity] = useState('Nagpur')
  const [state, setState] = useState('Maharashtra')
  const [bureau, setBureau] = useState(defaultBureau)
  const [category, setCategory] = useState('Infrastructure')
  const [sourceChannel, setSourceChannel] = useState('Ministry/CPGRAMS')
  const [receivedDate, setReceivedDate] = useState('2026-10-26')
  const [complainantName, setComplainantName] = useState('')
  const [description, setDescription] = useState(
    'Deficiencies reported regarding computer centre carpet area, laboratory equipment shortages and unapproved shift operation in mechanical engineering department.'
  )

  const [submitting, setSubmitting] = useState(false)
  const [alertResult, setAlertResult] = useState(null)
  const [newCaseData, setNewCaseData] = useState(null)
  const [matchData, setMatchData] = useState(null)

  // Compute deadline preview
  const previewDeadline = receivedDate ? addDays(receivedDate, 30) : '2026-11-25'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!institutionName.trim()) {
      toast.error('Institution name is required')
      return
    }
    if (!city.trim()) {
      toast.error('City is required')
      return
    }
    if (description.trim().length < 20) {
      toast.error('Description must be at least 20 characters')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        institution_name: institutionName.trim(),
        aicte_id: aicteId.trim() || null,
        city: city.trim(),
        state,
        bureau,
        category,
        source_channel: sourceChannel,
        received_date: receivedDate,
        complainant_name: complainantName.trim() || null,
        description: description.trim(),
      }

      const res = await client.post('/cases', payload)
      const data = res.data

      if (data.alerts && data.alerts.length > 0) {
        setAlertResult(data.alerts[0])
        setNewCaseData({ ...data.case, category, typed_institution_name: institutionName })
        setMatchData(data.institution_match)
      } else {
        toast.success(`Docket ${data.case?.case_id} registered successfully`)
        navigate(`/cases/${data.case?.case_id}`)
      }
    } catch (err) {
      console.error('Registration error', err)
      toast.error(err.message || 'Failed to register complaint')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-12">
      {/* Top Navigation & Context Trail */}
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
        <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-medium bg-surface-container px-3 py-1 rounded-full">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary-container"></span>
          <span>Session: Active Triage Intake</span>
        </div>
      </div>

      {/* Centered Docket Registration Card */}
      <div className="w-full max-w-[840px] mx-auto bg-surface-container-lowest rounded-xl shadow-md border-0 overflow-hidden relative">
        {/* Accent Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary-container via-secondary-container to-primary"></div>

        <div className="p-8 sm:p-10 flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 mb-6 bg-surface-container-low/40 -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 p-8 sm:p-10 border-b border-outline-variant/15">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">assignment_add</span>
                <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  Register New Complaint
                </h1>
              </div>
              <p className="text-[13px] text-on-surface-variant max-w-lg">
                Enter grievance particulars and intake metadata for statutory AICTE docket registration.
              </p>
            </div>

            <div className="flex items-center self-start bg-surface-container-low px-3 py-1.5 rounded-lg shadow-sm border border-outline-variant/20">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Intake Status
                </span>
                <div className="flex items-center gap-1.5 text-primary text-[13px]">
                  <span className="material-symbols-outlined text-[16px] text-secondary">fingerprint</span>
                  <span className="font-mono font-bold">AICTE-2026-DRAFT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Field 1: Institution Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-on-surface flex items-center justify-between">
                  <span>Institution Name <span className="text-error font-bold">*</span></span>
                  <span className="text-[11px] text-on-surface-variant font-normal">Official Registry</span>
                </label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Sunrise Engineering College"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low text-[13px] text-on-surface rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all"
                />
              </div>

              {/* Field 2: AICTE Permanent ID */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-on-surface flex items-center justify-between">
                  <span>AICTE Permanent ID</span>
                  <span className="text-[11px] text-on-surface-variant font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={aicteId}
                  onChange={(e) => setAicteId(e.target.value)}
                  placeholder="e.g. 1-12345"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low text-[13px] text-on-surface placeholder:text-on-surface-variant/60 rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all"
                />
              </div>

              {/* Field 3: City */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-on-surface">
                  City / Municipal Area <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nagpur"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low text-[13px] text-on-surface rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all"
                />
              </div>

              {/* Field 4: State */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-on-surface">
                  State / UT <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 bg-surface-container-low text-[13px] text-on-surface rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all cursor-pointer"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi (NCT)</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Punjab">Punjab</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Field 5: Bureau / Cell */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-on-surface">
                    Assigned Bureau / Cell
                  </label>
                  {isOfficer && (
                    <div className="flex items-center gap-1 text-on-surface-variant text-[11px]">
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                      <span>Locked to active role</span>
                    </div>
                  )}
                </div>
                {isOfficer ? (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={`${bureau} — ${bureau === 'RB' ? 'Regulation Bureau' : 'Public Grievance Redressal Cell'}`}
                      className="w-full pl-9 pr-24 py-2.5 bg-surface-container-high/60 text-[13px] text-on-surface/80 rounded-lg cursor-not-allowed select-none border border-outline-variant/20 focus:outline-none"
                    />
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                      shield_lock
                    </span>
                    <span className="absolute right-3 px-2 py-0.5 bg-surface-container text-[11px] text-primary font-bold rounded">
                      {bureau} Cell
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={bureau}
                      onChange={(e) => setBureau(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 pr-10 bg-surface-container-low text-[13px] text-on-surface rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-container border border-outline-variant/20 cursor-pointer"
                    >
                      <option value="RB">RB — Regulation Bureau</option>
                      <option value="PGRC">PGRC — Public Grievance Redressal Cell</option>
                      <option value="Approval Bureau">Approval Bureau</option>
                      <option value="Academic Bureau">Academic Bureau</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                )}
              </div>

              {/* Field 6: Category */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-on-surface">
                  Grievance Category <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 bg-surface-container-low text-[13px] text-on-surface rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all cursor-pointer"
                  >
                    <option value="Fee refund">Fee refund</option>
                    <option value="Admission">Admission irregularity</option>
                    <option value="Faculty">Faculty grievance / Non-payment</option>
                    <option value="Infrastructure">Infrastructure deficiency</option>
                    <option value="Approval/Affiliation">Approval / Affiliation compliance</option>
                    <option value="Harassment">Harassment / Discrimination</option>
                    <option value="Certificates withheld">Original certificates withheld</option>
                    <option value="Other">Other statutory matters</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Field 7: Source Channel */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-on-surface">
                  Source Channel <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={sourceChannel}
                    onChange={(e) => setSourceChannel(e.target.value)}
                    required
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 bg-surface-container-low text-[13px] text-on-surface rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all cursor-pointer"
                  >
                    <option value="Ministry/CPGRAMS">Ministry / CPGRAMS Portal</option>
                    <option value="CSS portal">CSS portal (Direct citizen)</option>
                    <option value="Email">Official Apex Email</option>
                    <option value="Post">Physical Speed Post / Registry</option>
                    <option value="Institute GRC">Institute GRC Referral</option>
                    <option value="Court/RTI">Court Directive / RTI Cell</option>
                    <option value="Other">Other regulatory referral</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Field 8: Received Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-on-surface flex items-center justify-between">
                  <span>Date Received <span className="text-error font-bold">*</span></span>
                  <span className="text-[11px] text-on-surface-variant font-normal">YYYY-MM-DD</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low text-[13px] text-on-surface rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all"
                  />
                </div>
              </div>

              {/* Field 9: Complainant Name */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[12px] font-semibold text-on-surface flex items-center justify-between">
                  <span>Complainant Name</span>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Whistleblower protection enabled
                  </span>
                </label>
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="Optional – confidential or anonymous allowed"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low text-[13px] text-on-surface placeholder:text-on-surface-variant/60 rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all"
                />
              </div>

              {/* Field 10: Description */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-on-surface">
                    Grievance Description &amp; Summary Particulars <span className="text-error font-bold">*</span>
                  </label>
                  <span className="text-[11px] text-on-surface-variant font-normal">Min. 20 characters</span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a factual summary of the complaint, key dates, aggrieved parties, and specific allegations..."
                  className="w-full p-3.5 bg-surface-container-low text-[13px] text-on-surface placeholder:text-on-surface-variant/60 rounded-lg shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/20 transition-all resize-y leading-relaxed"
                ></textarea>
              </div>
            </div>

            {/* Statutory SLA Trigger Callout Box */}
            <div className="w-full bg-primary-fixed/25 border border-primary-fixed rounded-lg p-4 flex items-start gap-3 mt-2">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-primary font-bold">Statutory SLA Trigger</span>
                  <span className="px-2 py-0.5 text-[11px] bg-surface-container-lowest text-primary rounded-full font-semibold border border-outline-variant/20">
                    30-Day Window
                  </span>
                </div>
                <p className="text-[13px] text-on-surface">
                  Deadline will be <strong>{formatIndianDate(previewDeadline)}</strong> (30 days from received date).
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-outline-variant/15 mt-2">
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="w-full sm:w-auto px-5 py-2.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-medium text-sm rounded-lg shadow-sm border border-outline-variant/20 transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="inline-block animate-spin material-symbols-outlined text-[18px]">
                      progress_activity
                    </span>
                    <span>Registering Docket...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Save complaint</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Compliance footer note */}
      <div className="mt-6 text-center text-on-surface-variant text-[11px] max-w-lg mx-auto flex items-center justify-center gap-1.5">
        <span className="material-symbols-outlined text-[15px] text-primary">gavel</span>
        <span>All docket records are processed in compliance with AICTE (Redressal of Grievance) Regulations.</span>
      </div>

      {/* Alert Result Pop-up Modal */}
      {alertResult && (
        <AlertResultModal
          alertData={alertResult}
          newCase={newCaseData}
          institutionMatch={matchData}
          onClose={() => setAlertResult(null)}
        />
      )}
    </div>
  )
}
