import { useState, useRef, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import { roleBadgeLabel } from '../utils/roles'

export default function RoleSwitcher() {
  const { user, setUser, allUsers } = useRole()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSubLabel = (u) => {
    if (u.bureau) return `${u.bureau} Cell`
    if (u.region) return `${u.region} Region`
    return 'Headquarters'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-surface-container-low transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </div>
        <div className="flex flex-col text-left hidden md:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-on-surface font-semibold leading-tight">
              {roleBadgeLabel(user)}
            </span>
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim shrink-0"></span>
          </div>
          <span className="text-[11px] text-on-surface-variant leading-none mt-0.5">
            {getSubLabel(user)}
          </span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl py-2 z-50">
          <div className="px-3.5 py-1.5 border-b border-outline-variant/15 mb-1">
            <div className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Switch Demo Role
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Simulates RBAC permissions across bureaus
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {allUsers.map((u) => {
              const active = u.id === user?.id
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setUser(u)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-primary/10 border-l-[3px] border-primary text-primary font-semibold'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium leading-snug">{roleBadgeLabel(u)}</div>
                      <div className="text-[11px] text-on-surface-variant">{getSubLabel(u)}</div>
                    </div>
                  </div>
                  {active && (
                    <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
