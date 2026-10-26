import { useState, useRef, useEffect } from 'react'
import { useDateRange } from '../context/DateRangeContext'

export default function DateRangeFilter() {
  const { preset, setPreset, PRESETS } = useDateRange()
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

  const currentLabel = PRESETS.find(p => p.value === preset)?.label || 'This year'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface rounded-lg transition-colors text-[13px] font-medium"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
        <span>{currentLabel}</span>
        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg py-1 z-50 animate-in fade-in duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-outline uppercase tracking-wider">
            Date Range Filter
          </div>
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => {
                setPreset(p.value)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors ${
                p.value === preset
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span>{p.label}</span>
              {p.value === preset && (
                <span className="material-symbols-outlined text-[16px] text-primary">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
