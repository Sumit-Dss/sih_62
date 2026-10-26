import { createContext, useContext, useState, useEffect } from 'react'
import { setCurrentUser } from '../api/client'
import { USERS } from '../api/mockStore'

const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aicte_demo_user')
      if (saved) return JSON.parse(saved)
    } catch {}
    return USERS[2] // default: R. Verma (RB Officer)
  })

  useEffect(() => {
    setCurrentUser(user)
    try { localStorage.setItem('aicte_demo_user', JSON.stringify(user)) } catch {}
  }, [user])

  return (
    <RoleContext.Provider value={{ user, setUser, allUsers: USERS }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
