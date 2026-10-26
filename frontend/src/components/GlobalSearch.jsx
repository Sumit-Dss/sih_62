import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null)
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await client.get('/search', { params: { q: query.trim() } })
        setResults(res.data)
        setOpen(true)
        setSelectedIndex(-1)
      } catch (err) {
        console.error('Search error', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const cases = results?.cases || []
  const institutions = results?.institutions || []
  const allItems = [
    ...cases.map(c => ({ type: 'case', ...c })),
    ...institutions.map(i => ({ type: 'institution', ...i })),
  ]

  const handleSelect = (item) => {
    setOpen(false)
    setQuery('')
    if (item.type === 'case') {
      navigate(`/cases/${item.case_id}`)
    } else {
      navigate(`/institutions/${item.aicte_id}`)
    }
  }

  const handleKeyDown = (e) => {
    if (!open || allItems.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < allItems.length) {
        handleSelect(allItems[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results) setOpen(true) }}
          placeholder="Search case ID, AICTE ID or institution name"
          className="w-full pl-10 pr-10 py-2 bg-surface-container-low font-body-sm text-[13px] text-on-surface placeholder:text-on-surface-variant rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        )}
      </div>

      {open && results && (
        <div className="absolute left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
          {cases.length === 0 && institutions.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant text-sm">
              No cases or institutions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {institutions.length > 0 && (
                <div className="mb-2">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">account_balance</span>
                    <span>Institutions</span>
                  </div>
                  {institutions.map((inst, idx) => {
                    const itemIndex = cases.length + idx
                    const isSelected = selectedIndex === itemIndex
                    return (
                      <button
                        key={inst.aicte_id}
                        type="button"
                        onClick={() => handleSelect({ type: 'institution', ...inst })}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-sm transition-colors ${
                          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-low text-on-surface'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{inst.name}</span>
                          <span className="text-[12px] text-on-surface-variant">
                            AICTE ID: {inst.aicte_id} • {inst.city}
                          </span>
                        </div>
                        {inst.score && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            {inst.score}% match
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {cases.length > 0 && (
                <div>
                  <div className="px-3.5 py-1 text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">assignment</span>
                    <span>Cases</span>
                  </div>
                  {cases.map((c, idx) => {
                    const isSelected = selectedIndex === idx
                    return (
                      <button
                        key={c.case_id}
                        type="button"
                        onClick={() => handleSelect({ type: 'case', ...c })}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-sm transition-colors ${
                          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-low text-on-surface'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-primary">{c.case_id}</span>
                            <span className="text-[11px] px-1.5 py-0.2 rounded bg-surface-container font-medium text-on-surface-variant">
                              {c.bureau}
                            </span>
                          </div>
                          <span className="text-[12px] text-on-surface-variant">{c.institution_name}</span>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
