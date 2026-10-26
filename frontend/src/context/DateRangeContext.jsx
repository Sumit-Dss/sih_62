import { createContext, useContext, useState } from 'react'

const DateRangeContext = createContext(null)

const PRESETS = [
  { label: 'This month',    value: 'this_month' },
  { label: 'Last 3 months', value: 'last_3_months' },
  { label: 'This year',     value: 'this_year' },
  { label: 'All time',      value: 'all_time' },
  { label: 'Custom',        value: 'custom' },
]

function getRange(preset) {
  const today = new Date('2026-10-26')
  if (preset === 'this_month')   return { from: '2026-10-01', to: '2026-10-26' }
  if (preset === 'last_3_months')return { from: '2026-07-26', to: '2026-10-26' }
  if (preset === 'this_year')    return { from: '2026-01-01', to: '2026-10-26' }
  if (preset === 'all_time')     return { from: null, to: null }
  return { from: null, to: null }
}

export function DateRangeProvider({ children }) {
  const [preset, setPreset] = useState('this_year')
  const [custom, setCustom] = useState({ from: null, to: null })

  const range = preset === 'custom' ? custom : getRange(preset)

  return (
    <DateRangeContext.Provider value={{ preset, setPreset, range, custom, setCustom, PRESETS }}>
      {children}
    </DateRangeContext.Provider>
  )
}

export function useDateRange() {
  return useContext(DateRangeContext)
}
