// ─── MOCK IN-MEMORY STORE ───────────────────────────────────────────────────
// Mirrors backend.md §12 seed data. Mutable so POSTing a case updates it.

const today = new Date('2026-10-26')

function daysAgo(n) {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// ── Users ──────────────────────────────────────────────────────────────────
export const USERS = [
  { id: 1, name: 'A. Sharma',  role: 'PGRC_OFFICER',      bureau: 'PGRC', region: null },
  { id: 2, name: 'M. Iyer',    role: 'PGRC_OFFICER',      bureau: 'PGRC', region: null },
  { id: 3, name: 'R. Verma',   role: 'RB_OFFICER',        bureau: 'RB',   region: null },
  { id: 4, name: 'S. Khan',    role: 'RB_OFFICER',        bureau: 'RB',   region: null },
  { id: 5, name: 'K. Nair',    role: 'REGIONAL_OFFICE',   bureau: null,   region: 'Western' },
  { id: 6, name: 'Dr. P. Rao', role: 'SENIOR_MANAGEMENT', bureau: null,   region: null },
  { id: 7, name: 'Admin',      role: 'ADMIN',             bureau: null,   region: null },
]

// ── Institutions ───────────────────────────────────────────────────────────
export const INSTITUTIONS = [
  { id: 1, aicte_id: '1-12345', name: 'Sunrise Engineering College', city: 'Nagpur',     state: 'Maharashtra', region: 'Western',  type: 'Private Engineering College', address: 'Plot 12, Hingna Road, Nagpur 440016', aliases: ['Sunrise Engg Clg Nagpur', 'Sunrise College of Engineering'] },
  { id: 2, aicte_id: '1-20481', name: 'ABC Institute of Technology',  city: 'Pune',       state: 'Maharashtra', region: 'Western',  type: 'Private Engineering College', address: '15, Baner Road, Pune 411045', aliases: ['ABC Inst of Tech'] },
  { id: 3, aicte_id: '1-30872', name: 'Greenfield Polytechnic',        city: 'Ahmedabad',  state: 'Gujarat',     region: 'Western',  type: 'Polytechnic', address: 'NH-8, Naroda, Ahmedabad 382330', aliases: ['Greenfield Poly'] },
  { id: 4, aicte_id: '1-41290', name: 'National College of Engineering',city: 'Delhi',     state: 'Delhi',       region: 'Northern', type: 'Government Engineering College', address: 'Sector 14, Dwarka, New Delhi 110078', aliases: [] },
  { id: 5, aicte_id: '1-52011', name: 'Lakeview Institute of Management',city:'Lucknow',  state: 'Uttar Pradesh',region:'Northern', type: 'Private Management College', address: 'Gomti Nagar, Lucknow 226010', aliases: [] },
  { id: 6, aicte_id: '1-63345', name: 'Deccan College of Engineering',  city: 'Hyderabad', state: 'Telangana',   region: 'Southern', type: 'Private Engineering College', address: 'Banjara Hills, Hyderabad 500034', aliases: [] },
  { id: 7, aicte_id: '1-74102', name: 'Coastal Institute of Technology',city: 'Mangaluru', state: 'Karnataka',   region: 'Southern', type: 'Private Engineering College', address: 'Derebail, Mangaluru 575006', aliases: [] },
  { id: 8, aicte_id: '1-85267', name: 'Vidya Pharmacy College',         city: 'Chennai',   state: 'Tamil Nadu',  region: 'Southern', type: 'Pharmacy College', address: 'Anna Nagar, Chennai 600040', aliases: [] },
  { id: 9, aicte_id: '1-96530', name: 'Shivaji Polytechnic',            city: 'Nashik',    state: 'Maharashtra', region: 'Western',  type: 'Polytechnic', address: 'College Road, Nashik 422005', aliases: ['Shivaji Poly'] },
  { id: 10, aicte_id: '1-10778', name: 'Eastern Institute of Science',  city: 'Bhubaneswar',state:'Odisha',      region: 'Eastern',  type: 'Private Science College', address: 'Nayapalli, Bhubaneswar 751012', aliases: [] },
]

// ── Case counter ───────────────────────────────────────────────────────────
let caseCounter = 56

function nextCaseId() {
  caseCounter++
  return `AICTE-2026-${String(caseCounter).padStart(6, '0')}`
}

// ── Cases ──────────────────────────────────────────────────────────────────
// received_date spread so dashboard shows overdue + due-soon + healthy mix
export const CASES = [
  // ── Overlap 1: ABC Institute: open PGRC (Fee refund) + open RB (Faculty) ──
  { case_id: 'AICTE-2026-000001', institution_id: 2, bureau: 'PGRC', category: 'Fee refund',        status: 'under_process', officer_id: 1, received_date: daysAgo(45), description: 'Student fee refund not processed after college dropout.', source_channel: 'CSS portal', complainant_name: 'Priya Mehta', last_action_text: 'Notice sent', last_action_date: daysAgo(30), next_action: 'Await reply', match_confidence: null },
  { case_id: 'AICTE-2026-000002', institution_id: 2, bureau: 'RB',   category: 'Faculty',           status: 'under_process', officer_id: 3, received_date: daysAgo(38), description: 'Faculty not paid salary for 3 months.', source_channel: 'Email', complainant_name: null, last_action_text: 'Query issued', last_action_date: daysAgo(25), next_action: 'Inspection', match_confidence: null },

  // ── Overlap 2: Deccan College: open RB + open Approval Bureau ──────────
  { case_id: 'AICTE-2026-000003', institution_id: 6, bureau: 'RB',               category: 'Approval/Affiliation', status: 'under_process', officer_id: 3, received_date: daysAgo(55), description: 'Unapproved courses being offered.', source_channel: 'Ministry/CPGRAMS', complainant_name: null, last_action_text: 'Inspection scheduled', last_action_date: daysAgo(40), next_action: 'Field visit', match_confidence: null },
  { case_id: 'AICTE-2026-000004', institution_id: 6, bureau: 'Approval Bureau',  category: 'Admission',            status: 'pending',        officer_id: 7, received_date: daysAgo(30), description: 'Excess admissions beyond sanctioned intake.', source_channel: 'Post', complainant_name: null, last_action_text: null, last_action_date: null, next_action: 'Send notice', match_confidence: null },

  // ── Overlap 3: Greenfield Polytechnic: open PGRC + open RB, one overdue ──
  { case_id: 'AICTE-2026-000005', institution_id: 3, bureau: 'PGRC', category: 'Fee refund',   status: 'under_process', officer_id: 1, received_date: daysAgo(40), description: 'Caution money refund denied.', source_channel: 'CSS portal', complainant_name: 'Ravi Kumar', last_action_text: 'Reminder sent', last_action_date: daysAgo(28), next_action: 'Final notice', match_confidence: null },
  { case_id: 'AICTE-2026-000006', institution_id: 3, bureau: 'RB',   category: 'Infrastructure',status: 'escalated',     officer_id: 4, received_date: daysAgo(75), description: 'Labs not functional, safety hazard.', source_channel: 'Ministry/CPGRAMS', complainant_name: null, last_action_text: 'Escalated to senior', last_action_date: daysAgo(60), next_action: 'Emergency inspection', match_confidence: null },

  // ── Duplicate 1: Lakeview: two open PGRC Fee refund ───────────────────
  { case_id: 'AICTE-2026-000007', institution_id: 5, bureau: 'PGRC', category: 'Fee refund', status: 'under_process', officer_id: 2, received_date: daysAgo(25), description: 'Fee refund after course cancellation.', source_channel: 'Email', complainant_name: 'Sneha Joshi', last_action_text: 'Under review', last_action_date: daysAgo(15), next_action: 'Verify documents', match_confidence: null },
  { case_id: 'AICTE-2026-000008', institution_id: 5, bureau: 'PGRC', category: 'Fee refund', status: 'pending',       officer_id: 2, received_date: daysAgo(10), description: 'Second complaint about same fee refund issue.', source_channel: 'CSS portal', complainant_name: 'Arun Sharma', last_action_text: null, last_action_date: null, next_action: 'Review for duplicate', match_confidence: null },

  // ── Duplicate 2: Shivaji Polytechnic: two open RB Infrastructure ───────
  { case_id: 'AICTE-2026-000009', institution_id: 9, bureau: 'RB', category: 'Infrastructure', status: 'under_process', officer_id: 3, received_date: daysAgo(27), description: 'Workshop equipment damaged, not replaced.', source_channel: 'Post', complainant_name: null, last_action_text: 'Notice issued', last_action_date: daysAgo(20), next_action: 'Compliance report', match_confidence: null },
  { case_id: 'AICTE-2026-000010', institution_id: 9, bureau: 'RB', category: 'Infrastructure', status: 'pending',       officer_id: 4, received_date: daysAgo(5),  description: 'Classrooms without proper ventilation.', source_channel: 'Email', complainant_name: null, last_action_text: null, last_action_date: null, next_action: 'Check if duplicate', match_confidence: null },

  // ── Sunrise Engineering: ONLY DISPOSED (free for live demo) ───────────
  { case_id: 'AICTE-2026-000011', institution_id: 1, bureau: 'RB',   category: 'Infrastructure', status: 'disposed', officer_id: 3, received_date: daysAgo(120), description: 'Old infrastructure complaint, resolved.', source_channel: 'Ministry/CPGRAMS', complainant_name: null, last_action_text: 'Compliance verified', last_action_date: daysAgo(90), next_action: null, match_confidence: null },
  { case_id: 'AICTE-2026-000012', institution_id: 1, bureau: 'PGRC', category: 'Fee refund',    status: 'disposed', officer_id: 1, received_date: daysAgo(180), description: 'Fee refund dispute resolved amicably.', source_channel: 'CSS portal', complainant_name: 'Student A', last_action_text: 'Closed after refund', last_action_date: daysAgo(150), next_action: null, match_confidence: null },

  // ── Attention list cases (overdue + due soon) ─────────────────────────
  { case_id: 'AICTE-2026-000042', institution_id: 2, bureau: 'RB',   category: 'Faculty',       status: 'escalated',     officer_id: 3, received_date: daysAgo(51), description: 'Faculty salary dispute escalated.', source_channel: 'Email', complainant_name: null, last_action_text: 'Escalated', last_action_date: daysAgo(40), next_action: 'Review', match_confidence: null },
  { case_id: 'AICTE-2026-000031', institution_id: 3, bureau: 'RB',   category: 'Infrastructure',status: 'under_process', officer_id: 4, received_date: daysAgo(28), description: 'Labs non-compliant.', source_channel: 'Post', complainant_name: null, last_action_text: 'Notice sent', last_action_date: daysAgo(20), next_action: 'Await response', match_confidence: null },
  { case_id: 'AICTE-2026-000038', institution_id: 9, bureau: 'RB',   category: 'Infrastructure',status: 'under_process', officer_id: 3, received_date: daysAgo(25), description: 'Workshop renovation incomplete.', source_channel: 'CSS portal', complainant_name: null, last_action_text: 'Under process', last_action_date: daysAgo(18), next_action: 'Site visit', match_confidence: null },
  { case_id: 'AICTE-2026-000029', institution_id: 7, bureau: 'PGRC', category: 'Fee refund',    status: 'escalated',     officer_id: 1, received_date: daysAgo(44), description: 'Fee irregularity at Coastal Institute.', source_channel: 'Ministry/CPGRAMS', complainant_name: 'P. Deshmukh', last_action_text: 'Escalated', last_action_date: daysAgo(35), next_action: 'Senior review', match_confidence: null },
  { case_id: 'AICTE-2026-000047', institution_id: 10,bureau: 'RB',   category: 'Certificates withheld', status: 'under_process', officer_id: 3, received_date: daysAgo(29), description: 'Original marksheets not returned.', source_channel: 'Post', complainant_name: 'K. Lal', last_action_text: 'Notice issued', last_action_date: daysAgo(22), next_action: 'Verification', match_confidence: null },

  // ── Mix of other cases ────────────────────────────────────────────────
  { case_id: 'AICTE-2026-000019', institution_id: 4, bureau: 'RB',   category: 'Faculty',    status: 'under_process', officer_id: 4, received_date: daysAgo(22), description: 'Faculty qualifications mismatch.', source_channel: 'Email', complainant_name: null, last_action_text: 'Query sent', last_action_date: daysAgo(15), next_action: 'Document verification', match_confidence: null },
  { case_id: 'AICTE-2026-000014', institution_id: 4, bureau: 'PGRC', category: 'Fee refund', status: 'disposed',      officer_id: 2, received_date: daysAgo(86), description: 'Resolved fee issue.', source_channel: 'CSS portal', complainant_name: 'S. Rathi', last_action_text: 'Refund verified', last_action_date: daysAgo(43), next_action: null, match_confidence: null },
  { case_id: 'AICTE-2026-000055', institution_id: 10,bureau: 'RB',   category: 'Approval/Affiliation', status: 'pending', officer_id: 3, received_date: daysAgo(8), description: 'Affiliation renewal pending.', source_channel: 'Post', complainant_name: null, last_action_text: null, last_action_date: null, next_action: 'Initial review', match_confidence: null },
  { case_id: 'AICTE-2026-000052', institution_id: 8, bureau: 'PGRC', category: 'Harassment', status: 'under_process', officer_id: 2, received_date: daysAgo(31), description: 'Ragging complaint.', source_channel: 'CSS portal', complainant_name: 'V. Subramanian', last_action_text: 'Inquiry formed', last_action_date: daysAgo(25), next_action: 'Report due', match_confidence: null },
  { case_id: 'AICTE-2026-000020', institution_id: 6, bureau: 'RB',   category: 'Infrastructure', status: 'transferred', officer_id: 3, received_date: daysAgo(60), description: 'Transferred to state authority.', source_channel: 'Ministry/CPGRAMS', complainant_name: null, last_action_text: 'Transferred to state', last_action_date: daysAgo(45), next_action: null, match_confidence: null },
  { case_id: 'AICTE-2026-000023', institution_id: 5, bureau: 'PGRC', category: 'Admission',  status: 'disposed',      officer_id: 1, received_date: daysAgo(90), description: 'Resolved admission dispute.', source_channel: 'Email', complainant_name: null, last_action_text: 'Closed', last_action_date: daysAgo(60), next_action: null, match_confidence: null },
  { case_id: 'AICTE-2026-000033', institution_id: 7, bureau: 'RB',   category: 'Faculty',    status: 'pending',       officer_id: 3, received_date: daysAgo(15), description: 'Shortage of faculty in CS dept.', source_channel: 'Email', complainant_name: null, last_action_text: null, last_action_date: null, next_action: 'Initial review', match_confidence: null },
]

// ── Case Links (overlap/duplicate) ────────────────────────────────────────
export const CASE_LINKS = [
  { id: 1, case_a_id: 'AICTE-2026-000002', case_b_id: 'AICTE-2026-000001', link_type: 'overlap',   reason: 'same AICTE ID', needs_confirmation: false },
  { id: 2, case_a_id: 'AICTE-2026-000004', case_b_id: 'AICTE-2026-000003', link_type: 'overlap',   reason: 'same AICTE ID', needs_confirmation: false },
  { id: 3, case_a_id: 'AICTE-2026-000006', case_b_id: 'AICTE-2026-000005', link_type: 'overlap',   reason: 'same AICTE ID', needs_confirmation: false },
  { id: 4, case_a_id: 'AICTE-2026-000008', case_b_id: 'AICTE-2026-000007', link_type: 'duplicate', reason: 'same bureau · same category', needs_confirmation: false },
  { id: 5, case_a_id: 'AICTE-2026-000010', case_b_id: 'AICTE-2026-000009', link_type: 'duplicate', reason: 'same bureau · same category', needs_confirmation: false },
  { id: 6, case_a_id: 'AICTE-2026-000042', case_b_id: 'AICTE-2026-000001', link_type: 'overlap',   reason: 'same AICTE ID · same city', needs_confirmation: false },
  { id: 7, case_a_id: 'AICTE-2026-000029', case_b_id: 'AICTE-2026-000005', link_type: 'overlap',   reason: 'same AICTE ID', needs_confirmation: false },
]

// ── Case Actions (timeline) ───────────────────────────────────────────────
export const CASE_ACTIONS = {
  'AICTE-2026-000001': [
    { id: 1, at: '2026-09-11T10:00:00+05:30', type: 'created', text: 'Case created', user_id: 1, bureau: 'PGRC', remarks: null },
    { id: 2, at: '2026-09-26T14:30:00+05:30', type: 'action',  text: 'Notice sent to institution', user_id: 1, bureau: 'PGRC', remarks: 'Registered post' },
  ],
  'AICTE-2026-000002': [
    { id: 3, at: '2026-09-18T09:00:00+05:30', type: 'created', text: 'Case created', user_id: 3, bureau: 'RB', remarks: null },
    { id: 4, at: '2026-09-18T09:05:00+05:30', type: 'system',  text: 'Overlap detected with AICTE-2026-000001', user_id: null, bureau: null, remarks: null },
    { id: 5, at: '2026-10-01T11:00:00+05:30', type: 'action',  text: 'Query issued to institution', user_id: 3, bureau: 'RB', remarks: null },
  ],
  'AICTE-2026-000042': [
    { id: 10, at: '2026-09-05T11:00:00+05:30', type: 'created',  text: 'Case created', user_id: 3, bureau: 'RB', remarks: null },
    { id: 11, at: '2026-09-05T11:05:00+05:30', type: 'system',   text: 'Overlap detected with AICTE-2026-000001', user_id: null, bureau: null, remarks: null },
    { id: 12, at: '2026-09-20T09:00:00+05:30', type: 'escalate', text: 'Escalated – no response from institution', user_id: 3, bureau: 'RB', remarks: 'Past 30-day SLA' },
  ],
}

// Helper: get default actions for a case
export function getActionsForCase(caseId) {
  return CASE_ACTIONS[caseId] || [
    { id: 99, at: new Date().toISOString(), type: 'created', text: 'Case created', user_id: 3, bureau: 'RB', remarks: null }
  ]
}

// Helper: get institution by id
export function getInstitutionById(id) {
  return INSTITUTIONS.find(i => i.id === id)
}

// Helper: get institution by aicte_id
export function getInstitutionByAicteId(aicteId) {
  return INSTITUTIONS.find(i => i.aicte_id === aicteId)
}

// Helper: get user by id
export function getUserById(id) {
  return USERS.find(u => u.id === id)
}

// Helper: get links for a case (both directions)
export function getLinksForCase(caseId) {
  return CASE_LINKS.filter(l => l.case_a_id === caseId || l.case_b_id === caseId)
}

// Helper: get related case id from link
export function getRelatedCaseId(link, caseId) {
  return link.case_a_id === caseId ? link.case_b_id : link.case_a_id
}

// Helper: compute deadline
export function computeDeadline(receivedDate) {
  return addDays(receivedDate, 30)
}

// Helper: is overdue?
export function isOverdue(c) {
  if (c.status === 'disposed') return false
  return c.deadline < today.toISOString().split('T')[0]
}

// Helper: is due soon (within 7 days)?
export function isDueSoon(c) {
  if (c.status === 'disposed') return false
  const dl = c.deadline
  const todayStr = today.toISOString().split('T')[0]
  return dl >= todayStr && dl <= addDays(todayStr, 7)
}

// Enrich cases with computed fields on load
CASES.forEach(c => {
  c.deadline = computeDeadline(c.received_date)
  const links = getLinksForCase(c.case_id)
  if (links.some(l => l.link_type === 'overlap'))   c.alert_type = 'overlap'
  else if (links.some(l => l.link_type === 'duplicate')) c.alert_type = 'duplicate'
  else c.alert_type = null
})

// ── Add new case to the store ──────────────────────────────────────────────
export function addCase(newCase) {
  CASES.push(newCase)
}

export function addCaseLink(link) {
  CASE_LINKS.push(link)
}

export function addCaseAction(caseId, action) {
  if (!CASE_ACTIONS[caseId]) CASE_ACTIONS[caseId] = []
  CASE_ACTIONS[caseId].push(action)
}

export { nextCaseId, addDays }
