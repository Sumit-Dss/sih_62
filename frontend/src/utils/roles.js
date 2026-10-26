export function canCreate(user) {
  if (!user) return false
  return ['RB_OFFICER','PGRC_OFFICER','SENIOR_MANAGEMENT','ADMIN'].includes(user.role)
}

export function canAct(user, caseObj) {
  if (!user || !caseObj) return false
  if (['SENIOR_MANAGEMENT','ADMIN'].includes(user.role)) return true
  if (['RB_OFFICER','PGRC_OFFICER'].includes(user.role)) return caseObj.bureau === user.bureau
  return false
}

export function canEscalate(user) {
  return user && ['SENIOR_MANAGEMENT','ADMIN'].includes(user.role)
}

export function canExport(user) {
  return !!user
}

export function canViewHistory(user, caseObj) {
  if (!user) return false
  if (['SENIOR_MANAGEMENT','ADMIN'].includes(user.role)) return true
  if (['RB_OFFICER','PGRC_OFFICER'].includes(user.role)) return caseObj?.bureau === user.bureau
  return false
}

export function roleBadgeLabel(user) {
  if (!user) return 'Select role'
  const roleLabels = {
    PGRC_OFFICER:      'PGRC Officer',
    RB_OFFICER:        'RB Officer',
    REGIONAL_OFFICE:   'Regional Office',
    SENIOR_MANAGEMENT: 'Senior Management',
    ADMIN:             'Admin',
  }
  return `${roleLabels[user.role] || user.role} – ${user.name}`
}

export function roleShortLabel(user) {
  if (!user) return ''
  const labels = { PGRC_OFFICER:'PGRC', RB_OFFICER:'RB', REGIONAL_OFFICE:'Regional', SENIOR_MANAGEMENT:'Senior Mgmt', ADMIN:'Admin' }
  return labels[user.role] || user.role
}
