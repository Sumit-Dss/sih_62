// Mock client — intercepts all calls and routes to mock.js
// When backend is ready: delete the interceptor, keep axios instance.

import * as mock from './mock'

// Current role accessor (set by RoleContext)
let _currentUser = null
export function setCurrentUser(user) { _currentUser = user }
export function getCurrentUser() { return _currentUser }

// Fake axios-like interface
const client = {
  get: async (url, config = {}) => {
    const params = config.params || {}
    const user = _currentUser

    if (url === '/meta/demo-users') return { data: await mock.getMetaDemoUsers() }
    if (url === '/meta/options')    return { data: await mock.getMetaOptions() }
    if (url === '/dashboard/kpis')  return { data: await mock.getKpis({ user }) }
    if (url === '/dashboard/attention') return { data: await mock.getAttention({ user, ...params }) }
    if (url === '/cases')           return { data: await mock.getCases({ user, ...params }) }
    if (url === '/search')          return { data: await mock.getSearch({ q: params.q, user }) }

    const caseMatch = url.match(/^\/cases\/([^/]+)$/)
    if (caseMatch) return { data: await mock.getCase({ caseId: caseMatch[1], user }) }

    const instMatch = url.match(/^\/institutions\/([^/]+)$/)
    if (instMatch) return { data: await mock.getInstitution({ aicteId: instMatch[1], user }) }

    throw new Error(`No mock for GET ${url}`)
  },
  post: async (url, body) => {
    const user = _currentUser
    if (url === '/cases') return { data: await mock.postCase({ body, user }) }
    throw new Error(`No mock for POST ${url}`)
  },
}

export default client
