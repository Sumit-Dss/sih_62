// ─── MOCK API FUNCTIONS ──────────────────────────────────────────────────────
// Every function returns the exact §12 shape from frontend.md.
// postCase runs name-similarity matching + overlap/duplicate detection.

import {
  USERS, INSTITUTIONS, CASES, CASE_LINKS,
  getInstitutionById, getInstitutionByAicteId, getUserById,
  getLinksForCase, getRelatedCaseId, getActionsForCase,
  computeDeadline, isOverdue, isDueSoon,
  addCase, addCaseLink, addCaseAction, nextCaseId, addDays,
} from './mockStore'

const TODAY = '2026-10-26'

// ── helpers ──────────────────────────────────────────────────────────────────
function delay(ms = 300) {
  return new Promise(r => setTimeout(r, ms))
}

function normalizeName(name) {
  const abbrevs = {
    'engg': 'engineering', 'engr': 'engineering', 'eng': 'engineering',
    'clg': 'college', 'coll': 'college', 'col': 'college',
    'inst': 'institute', 'instt': 'institute',
    'tech': 'technology', 'univ': 'university', 'poly': 'polytechnic',
    'mgmt': 'management', 'mgt': 'management', 'sci': 'science',
  }
  const noise = ['pvt','ltd','private','limited','the','of','trust','society','and','&']
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => !noise.includes(w))
    .map(w => abbrevs[w] || w)
    .join(' ')
    .trim()
}

function tokenSetRatio(a, b) {
  const setA = new Set(normalizeName(a).split(' '))
  const setB = new Set(normalizeName(b).split(' '))
  const intersection = [...setA].filter(x => setB.has(x))
  const union = new Set([...setA, ...setB])
  if (union.size === 0) return 0
  return Math.round((intersection.length / union.size) * 100)
}

function matchInstitution(name, aicteId, city, state) {
  // 1. Exact AICTE ID
  if (aicteId) {
    const inst = getInstitutionByAicteId(aicteId)
    if (inst) return { institution: inst, method: 'aicte_id', confidence: 100, needs_confirmation: false, reason: 'same AICTE ID' }
  }
  // 2. Fuzzy name in same city / state
  let bestScore = 0
  let bestInst = null
  const candidates = INSTITUTIONS.filter(i => i.city.toLowerCase() === city.toLowerCase())
  const pool = candidates.length > 0 ? candidates : INSTITUTIONS.filter(i => i.state.toLowerCase() === state.toLowerCase())
  for (const inst of pool) {
    const names = [inst.name, ...inst.aliases]
    const score = Math.max(...names.map(n => tokenSetRatio(name, n)))
    if (score > bestScore) { bestScore = score; bestInst = inst }
  }
  const sameCity = bestInst && bestInst.city.toLowerCase() === city.toLowerCase()
  const cityNote = sameCity ? ' · same city' : ''
  if (bestScore >= 85 && bestInst) return { institution: bestInst, method: 'fuzzy_name', confidence: bestScore, needs_confirmation: false, reason: `name similarity ${bestScore}%${cityNote}` }
  if (bestScore >= 70 && bestInst) return { institution: bestInst, method: 'fuzzy_name', confidence: bestScore, needs_confirmation: true,  reason: `name similarity ${bestScore}%${cityNote} – please verify` }
  // 3. New institution
  const newInst = {
    id: INSTITUTIONS.length + 1,
    aicte_id: `NEW-${Date.now()}`,
    name, city, state,
    region: state === 'Maharashtra' || state === 'Gujarat' || state === 'Goa' ? 'Western'
           : state === 'Delhi' || state === 'Uttar Pradesh' || state === 'Punjab' || state === 'Haryana' ? 'Northern'
           : state === 'Karnataka' || state === 'Tamil Nadu' || state === 'Telangana' || state === 'Kerala' ? 'Southern'
           : state === 'West Bengal' || state === 'Odisha' || state === 'Bihar' ? 'Eastern' : 'Central',
    type: 'Unknown', address: `${city}, ${state}`, aliases: [],
  }
  INSTITUTIONS.push(newInst)
  return { institution: newInst, method: 'new_institution', confidence: 0, needs_confirmation: false, reason: 'new institution created' }
}

function buildCaseSummary(c) {
  const inst = getInstitutionById(c.institution_id)
  const officer = getUserById(c.officer_id)
  return {
    case_id: c.case_id,
    institution: { aicte_id: inst?.aicte_id, name: `${inst?.name}, ${inst?.city}` },
    bureau: c.bureau,
    category: c.category,
    status: c.status,
    officer: officer?.name || 'Unassigned',
    received_date: c.received_date,
    deadline: c.deadline,
    alert_type: c.alert_type,
  }
}

function canOpenCase(user, c) {
  if (!user) return false
  if (user.role === 'SENIOR_MANAGEMENT' || user.role === 'ADMIN') return true
  if (user.role === 'RB_OFFICER' || user.role === 'PGRC_OFFICER') return c.bureau === user.bureau
  if (user.role === 'REGIONAL_OFFICE') {
    const inst = getInstitutionById(c.institution_id)
    return inst?.region === user.region
  }
  return false
}

function scopedCases(user) {
  if (!user) return CASES
  if (user.role === 'SENIOR_MANAGEMENT' || user.role === 'ADMIN') return CASES
  if (user.role === 'RB_OFFICER' || user.role === 'PGRC_OFFICER') return CASES.filter(c => c.bureau === user.bureau)
  if (user.role === 'REGIONAL_OFFICE') {
    return CASES.filter(c => {
      const inst = getInstitutionById(c.institution_id)
      return inst?.region === user.region
    })
  }
  return CASES
}

// ── GET /meta/demo-users ─────────────────────────────────────────────────────
export async function getMetaDemoUsers() {
  await delay(100)
  return USERS.map(u => ({ id: u.id, name: u.name, role: u.role, bureau: u.bureau, region: u.region }))
}

// ── GET /meta/options ────────────────────────────────────────────────────────
export async function getMetaOptions() {
  await delay(100)
  return {
    bureaus: ['RB', 'PGRC', 'Approval Bureau', 'Academic Bureau'],
    categories: ['Fee refund','Admission','Faculty','Infrastructure','Approval/Affiliation','Harassment','Certificates withheld','Other'],
    source_channels: ['CSS portal','Email','Ministry/CPGRAMS','Post','Institute GRC','Court/RTI','Other'],
    states: [
      { name: 'Maharashtra', region: 'Western' },
      { name: 'Gujarat', region: 'Western' },
      { name: 'Goa', region: 'Western' },
      { name: 'Delhi', region: 'Northern' },
      { name: 'Uttar Pradesh', region: 'Northern' },
      { name: 'Punjab', region: 'Northern' },
      { name: 'Haryana', region: 'Northern' },
      { name: 'Karnataka', region: 'Southern' },
      { name: 'Tamil Nadu', region: 'Southern' },
      { name: 'Telangana', region: 'Southern' },
      { name: 'Kerala', region: 'Southern' },
      { name: 'West Bengal', region: 'Eastern' },
      { name: 'Odisha', region: 'Eastern' },
      { name: 'Bihar', region: 'Eastern' },
      { name: 'Madhya Pradesh', region: 'Central' },
      { name: 'Chhattisgarh', region: 'Central' },
    ],
  }
}

// ── GET /dashboard/kpis ──────────────────────────────────────────────────────
export async function getKpis({ user } = {}) {
  await delay(300)
  const cases = scopedCases(user)
  return {
    total: cases.length,
    pending: cases.filter(c => c.status === 'pending').length,
    under_process: cases.filter(c => c.status === 'under_process').length,
    disposed: cases.filter(c => c.status === 'disposed').length,
    transferred: cases.filter(c => c.status === 'transferred').length,
    overdue: cases.filter(c => isOverdue(c)).length,
  }
}

// ── GET /dashboard/attention ─────────────────────────────────────────────────
export async function getAttention({ user, limit = 10 } = {}) {
  await delay(300)
  const cases = scopedCases(user)
  const attention = cases
    .filter(c => isOverdue(c) || isDueSoon(c))
    .sort((a, b) => {
      const aOverdue = isOverdue(a), bOverdue = isOverdue(b)
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      return a.deadline.localeCompare(b.deadline)
    })
    .slice(0, limit)
  return attention.map(c => buildCaseSummary(c))
}

// ── GET /cases ───────────────────────────────────────────────────────────────
export async function getCases({ user, bureau, region, category, status, overdue, attention, q, sort = 'received_date', order = 'desc', page = 1, page_size = 20 } = {}) {
  await delay(350)
  let cases = scopedCases(user)

  if (bureau && bureau !== 'all') cases = cases.filter(c => c.bureau === bureau)
  if (category && category !== 'all') cases = cases.filter(c => c.category === category)
  if (status && status !== 'all') cases = cases.filter(c => c.status === status)
  if (overdue === 'true' || overdue === true) cases = cases.filter(c => isOverdue(c))
  if (attention === 'true' || attention === true) cases = cases.filter(c => isOverdue(c) || isDueSoon(c))
  if (region && region !== 'all') {
    cases = cases.filter(c => {
      const inst = getInstitutionById(c.institution_id)
      return inst?.region === region
    })
  }
  if (q) {
    const lq = q.toLowerCase()
    cases = cases.filter(c => {
      const inst = getInstitutionById(c.institution_id)
      return c.case_id.toLowerCase().includes(lq) ||
             inst?.name.toLowerCase().includes(lq) ||
             inst?.aicte_id?.toLowerCase().includes(lq)
    })
  }

  // sort
  cases = [...cases].sort((a, b) => {
    let va = a[sort] || '', vb = b[sort] || ''
    const cmp = va < vb ? -1 : va > vb ? 1 : 0
    return order === 'desc' ? -cmp : cmp
  })

  const total = cases.length
  const start = (page - 1) * page_size
  const items = cases.slice(start, start + page_size).map(c => buildCaseSummary(c))
  return { items, page, page_size, total }
}

// ── GET /cases/:case_id ───────────────────────────────────────────────────────
export async function getCase({ caseId, user } = {}) {
  await delay(350)
  const c = CASES.find(x => x.case_id === caseId)
  if (!c) return { error: 404, detail: 'Case not found' }
  if (user && !canOpenCase(user, c)) return { error: 403, detail: "You don't have access to this case" }

  const inst = getInstitutionById(c.institution_id)
  const officer = getUserById(c.officer_id)
  const links = getLinksForCase(c.case_id)
  const related_cases = links.map(link => {
    const relId = getRelatedCaseId(link, c.case_id)
    const rel = CASES.find(x => x.case_id === relId)
    if (!rel) return null
    const relInst = getInstitutionById(rel.institution_id)
    const relOfficer = getUserById(rel.officer_id)
    return {
      case_id: rel.case_id,
      link_type: link.link_type,
      bureau: rel.bureau,
      category: rel.category,
      status: rel.status,
      officer: relOfficer?.name,
      reason: link.reason,
      needs_confirmation: link.needs_confirmation,
      can_open: user ? canOpenCase(user, rel) : false,
    }
  }).filter(Boolean)

  const timeline = getActionsForCase(c.case_id)
  return {
    case_id: c.case_id,
    institution: { aicte_id: inst?.aicte_id, name: `${inst?.name}, ${inst?.city}` },
    bureau: c.bureau,
    category: c.category,
    status: c.status,
    officer: { id: c.officer_id, name: officer?.name || 'Unassigned' },
    source_channel: c.source_channel,
    complainant_name: c.complainant_name,
    description: c.description,
    received_date: c.received_date,
    deadline: c.deadline,
    last_action: c.last_action_text ? { text: c.last_action_text, date: c.last_action_date } : null,
    next_action: c.next_action,
    timeline,
    related_cases,
    permissions: { can_act: false, can_escalate: false, can_export: false, can_view_history: false },
  }
}

// ── POST /cases ───────────────────────────────────────────────────────────────
export async function postCase({ body, user } = {}) {
  await delay(600)
  const { institution_name, aicte_id, city, state, bureau, category, source_channel, received_date, complainant_name, description } = body

  // 1. Match institution
  const matchResult = matchInstitution(institution_name, aicte_id, city, state)
  const { institution, method, confidence, needs_confirmation, reason } = matchResult

  // 2. Create case
  const officerId = user?.id || 3
  const caseId = nextCaseId()
  const newCase = {
    case_id: caseId,
    institution_id: institution.id,
    bureau,
    category,
    source_channel,
    status: 'pending',
    officer_id: officerId,
    complainant_name: complainant_name || null,
    description,
    received_date,
    deadline: computeDeadline(received_date),
    last_action_text: null,
    last_action_date: null,
    next_action: 'Initial review',
    match_confidence: confidence,
    needs_confirmation,
    alert_type: null,
  }
  addCase(newCase)
  addCaseAction(caseId, { id: Date.now(), at: new Date().toISOString(), type: 'created', text: 'Case created', user_id: officerId, bureau, remarks: null })

  // 3. Detect overlap/duplicate
  const OPEN_STATUSES = ['pending','under_process','transferred','escalated']
  const openCases = CASES.filter(c => c.institution_id === institution.id && c.case_id !== caseId && OPEN_STATUSES.includes(c.status))
  const alerts = []
  const groupedByType = {}

  for (const existing of openCases) {
    const linkType = existing.bureau !== bureau ? 'overlap' : 'duplicate'
    const link = { id: Date.now() + Math.random(), case_a_id: caseId, case_b_id: existing.case_id, link_type: linkType, reason, needs_confirmation }
    addCaseLink(link)
    addCaseAction(caseId, { id: Date.now(), at: new Date().toISOString(), type: 'system', text: `${linkType === 'overlap' ? 'Overlap' : 'Possible duplicate'} detected with ${existing.case_id}`, user_id: null, bureau: null, remarks: null })
    newCase.alert_type = newCase.alert_type || linkType

    const relOfficer = getUserById(existing.officer_id)
    const relCase = {
      case_id: existing.case_id,
      bureau: existing.bureau,
      category: existing.category,
      status: existing.status,
      officer: relOfficer?.name,
      can_open: user ? canOpenCase(user, existing) : false,
    }
    if (!groupedByType[linkType]) groupedByType[linkType] = []
    groupedByType[linkType].push(relCase)
  }

  for (const [type, relatedCases] of Object.entries(groupedByType)) {
    alerts.push({
      type,
      title: type === 'overlap' ? 'Potential Overlapping Cases – Coordination Required' : 'Possible Duplicate Complaint – Please Review',
      related_cases: relatedCases,
    })
  }

  const officer = getUserById(officerId)
  return {
    case: { case_id: caseId, status: 'pending', deadline: newCase.deadline, bureau, officer: officer?.name },
    institution_match: {
      typed_name: institution_name,
      matched: { aicte_id: institution.aicte_id, name: `${institution.name}, ${institution.city}` },
      method, confidence, needs_confirmation, reason,
    },
    alerts,
  }
}

// ── GET /institutions/:aicte_id ───────────────────────────────────────────────
export async function getInstitution({ aicteId, user } = {}) {
  await delay(350)
  const inst = getInstitutionByAicteId(aicteId)
  if (!inst) return { error: 404, detail: 'Institution not found' }

  const instCases = CASES.filter(c => c.institution_id === inst.id)
  const OPEN_STATUSES = ['pending','under_process','transferred','escalated']
  const openCases = instCases.filter(c => OPEN_STATUSES.includes(c.status))
  const overdueCases = instCases.filter(c => isOverdue(c))

  // Bureaus involved
  const bureauMap = {}
  for (const c of instCases) {
    if (!bureauMap[c.bureau]) bureauMap[c.bureau] = { total: 0, open: 0, cases: [] }
    bureauMap[c.bureau].total++
    if (OPEN_STATUSES.includes(c.status)) bureauMap[c.bureau].open++
    const officer = getUserById(c.officer_id)
    const hasFullAccess = user ? (user.role === 'SENIOR_MANAGEMENT' || user.role === 'ADMIN' || c.bureau === user.bureau) : false
    const canOpen = user ? canOpenCase(user, c) : false
    bureauMap[c.bureau].cases.push({
      case_id: c.case_id,
      category: c.category,
      status: c.status,
      officer: officer?.name,
      received_date: c.received_date,
      deadline: c.deadline,
      can_open: canOpen,
      ...(hasFullAccess ? {} : {}),
    })
  }

  // Sort bureaus: open ones first
  const bureaus = Object.entries(bureauMap)
    .sort(([, a], [, b]) => b.open - a.open)
    .map(([bureau, data]) => {
      const hasFullAccess = user ? (user.role === 'SENIOR_MANAGEMENT' || user.role === 'ADMIN' || bureau === user.bureau) : true
      return { bureau, total: data.total, open: data.open, full_access: hasFullAccess, cases: data.cases }
    })

  // Overlap banner
  const openBureaus = bureaus.filter(b => b.open > 0)
  let overlap = null
  if (openBureaus.length >= 2) {
    overlap = {
      type: 'overlap',
      title: 'Potential Overlapping Cases – Coordination Required',
      bureaus: openBureaus.map(b => ({ bureau: b.bureau, open: b.open })),
    }
  } else if (openBureaus.length === 1 && openBureaus[0].open >= 2) {
    overlap = {
      type: 'duplicate',
      title: `Possible duplicate complaints in ${openBureaus[0].bureau}`,
      bureaus: openBureaus.map(b => ({ bureau: b.bureau, open: b.open })),
    }
  }

  return {
    institution: {
      aicte_id: inst.aicte_id,
      name: inst.name,
      address: inst.address,
      city: inst.city,
      state: inst.state,
      region: inst.region,
      type: inst.type,
      aliases: inst.aliases,
    },
    summary: {
      total: instCases.length,
      open: openCases.length,
      disposed: instCases.filter(c => c.status === 'disposed').length,
      overdue: overdueCases.length,
      bureaus_involved: new Set(instCases.map(c => c.bureau)).size,
    },
    overlap,
    bureaus,
  }
}

// ── GET /search ───────────────────────────────────────────────────────────────
export async function getSearch({ q, user } = {}) {
  await delay(250)
  if (!q || q.length < 2) return { cases: [], institutions: [] }
  const lq = q.toLowerCase()

  const cases = scopedCases(user)
    .filter(c => {
      const inst = getInstitutionById(c.institution_id)
      return c.case_id.toLowerCase().includes(lq) ||
             inst?.name.toLowerCase().includes(lq) ||
             inst?.aicte_id?.toLowerCase().includes(lq)
    })
    .slice(0, 5)
    .map(c => {
      const inst = getInstitutionById(c.institution_id)
      return { case_id: c.case_id, institution_name: inst?.name, bureau: c.bureau, status: c.status }
    })

  const institutions = INSTITUTIONS
    .map(inst => {
      const names = [inst.name, ...inst.aliases]
      const score = Math.max(...names.map(n => n.toLowerCase().includes(lq) ? 90 : tokenSetRatio(q, n)))
      return { aicte_id: inst.aicte_id, name: inst.name, city: inst.city, score }
    })
    .filter(i => i.score >= 40 || i.name.toLowerCase().includes(lq) || i.aicte_id.toLowerCase().includes(lq))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return { cases, institutions }
}
