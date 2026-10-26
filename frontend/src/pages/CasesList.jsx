import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import { useRole } from '../context/RoleContext'
import { canCreate } from '../utils/roles'
import { formatIndianDate } from '../utils/dates'
import StatusBadge from '../components/StatusBadge'
import CountdownBadge from '../components/CountdownBadge'
import Pagination from '../components/Pagination'
import { LoadingSkeleton, ErrorState } from '../components/States'

export default function CasesList() {
  const navigate = useNavigate()
  const { user } = useRole()
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''
  const bureau = searchParams.get('bureau') || ''
  const region = searchParams.get('region') || ''
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const overdueParam = searchParams.get('overdue') === 'true'
  const attentionParam = searchParams.get('attention') === 'true'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sort = searchParams.get('sort') || 'received_date'
  const order = searchParams.get('order') || 'desc'

  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  const updateFilters = (newFilters) => {
    const updated = new URLSearchParams(searchParams)
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === false) {
        updated.delete(key)
      } else {
        updated.set(key, String(val))
      }
    })
    // Reset page to 1 when changing filters
    if (!('page' in newFilters)) {
      updated.set('page', '1')
    }
    setSearchParams(updated)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateFilters({ q: searchInput.trim() })
  }

  const handleClear = () => {
    setSearchInput('')
    setSearchParams(new URLSearchParams({ page: '1' }))
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cases_list', user?.id, q, bureau, region, category, status, overdueParam, attentionParam, page, sort, order],
    queryFn: async () => {
      const res = await client.get('/cases', {
        params: {
          q: q || undefined,
          bureau: bureau || undefined,
          region: region || undefined,
          category: category || undefined,
          status: status || undefined,
          overdue: overdueParam || undefined,
          attention: attentionParam || undefined,
          page,
          page_size: 20,
          sort,
          order,
        },
      })
      return res.data
    },
  })

  const cases = data?.items || []
  const total = data?.total || 0

  const activeFilterChips = []
  if (bureau) activeFilterChips.push({ key: 'bureau', label: `Bureau: ${bureau}` })
  if (region) activeFilterChips.push({ key: 'region', label: `Region: ${region}` })
  if (category) activeFilterChips.push({ key: 'category', label: `Category: ${category}` })
  if (status) activeFilterChips.push({ key: 'status', label: `Status: ${status}` })
  if (overdueParam) activeFilterChips.push({ key: 'overdue', label: 'Overdue only' })
  if (attentionParam) activeFilterChips.push({ key: 'attention', label: 'Needing Attention' })
  if (q) activeFilterChips.push({ key: 'q', label: `Search: "${q}"` })

  const handleSort = (field) => {
    if (sort === field) {
      updateFilters({ order: order === 'asc' ? 'desc' : 'asc' })
    } else {
      updateFilters({ sort: field, order: 'desc' })
    }
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Cases</h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            Central Regulatory &amp; Grievance Docket System • National Oversight
          </p>
        </div>
        {canCreate(user) && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/cases/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg text-sm font-semibold hover:bg-primary transition-all duration-150 shadow-sm active:scale-[0.99]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ New Complaint</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Console */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
          {/* Search Input */}
          <div className="lg:col-span-3 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search case ID, institution, complainant..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-[13px] rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Bureau */}
          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={bureau}
                onChange={(e) => updateFilters({ bureau: e.target.value })}
                className="w-full appearance-none pl-2.5 pr-6 py-1.5 bg-surface-container-low text-on-surface text-[13px] rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary-container"
              >
                <option value="">Bureau: All</option>
                <option value="RB">Bureau: RB</option>
                <option value="PGRC">Bureau: PGRC</option>
                <option value="Approval Bureau">Bureau: Approval</option>
                <option value="Academic Bureau">Bureau: Academic</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Region */}
          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={region}
                onChange={(e) => updateFilters({ region: e.target.value })}
                className="w-full appearance-none pl-2.5 pr-6 py-1.5 bg-surface-container-low text-on-surface text-[13px] rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary-container"
              >
                <option value="">Region: All</option>
                <option value="Western">Region: Western</option>
                <option value="Northern">Region: Northern</option>
                <option value="Southern">Region: Southern</option>
                <option value="Eastern">Region: Eastern</option>
                <option value="Central">Region: Central</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full appearance-none pl-2.5 pr-6 py-1.5 bg-surface-container-low text-on-surface text-[13px] rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary-container"
              >
                <option value="">Category: All</option>
                <option value="Fee refund">Fee refund</option>
                <option value="Faculty">Faculty &amp; Service</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Admission">Admission</option>
                <option value="Approval/Affiliation">Approval / Affiliation</option>
                <option value="Harassment">Harassment</option>
                <option value="Certificates withheld">Certificates withheld</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="lg:col-span-1 min-w-[110px]">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full appearance-none pl-2.5 pr-6 py-1.5 bg-surface-container-low text-on-surface text-[13px] rounded-lg border border-outline-variant/20 focus:outline-none focus:border-primary-container"
              >
                <option value="">Status: All</option>
                <option value="pending">Pending</option>
                <option value="under_process">Under process</option>
                <option value="disposed">Disposed</option>
                <option value="transferred">Transferred</option>
                <option value="escalated">Escalated</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Overdue check & Clear action */}
          <div className="lg:col-span-2 flex items-center justify-between sm:justify-end gap-3 pl-1">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overdueParam}
                onChange={(e) => updateFilters({ overdue: e.target.checked })}
                className="w-4 h-4 rounded border-outline-variant/40 text-primary-container focus:ring-0 accent-[#1e3a5f] cursor-pointer"
              />
              <span className="text-[12px] font-medium text-on-surface">Overdue</span>
            </label>
            <button
              onClick={handleClear}
              type="button"
              className="text-[12px] font-medium text-outline hover:text-error hover:underline transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Active Filter Chips Area */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-outline-variant/15">
            <span className="text-[11px] font-semibold text-on-surface-variant mr-1">Active filters:</span>
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-surface-container-low text-on-primary-fixed-variant rounded-full text-[11px] font-medium border border-outline-variant/20"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => updateFilters({ [chip.key]: false })}
                  className="hover:text-error transition-colors flex items-center ml-0.5"
                  aria-label={`Remove ${chip.key} filter`}
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            ))}
            <button
              onClick={handleClear}
              type="button"
              className="text-[11px] text-on-primary-container hover:text-primary transition-colors underline ml-2 font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Data Table Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
        {isLoading ? (
          <LoadingSkeleton rows={10} />
        ) : error ? (
          <ErrorState message="Could not load cases list." onRetry={refetch} />
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-[40px] text-outline mb-2">find_in_page</span>
            <div className="font-semibold text-on-surface text-base">No matching cases found</div>
            <p className="text-xs text-on-surface-variant mt-1">
              Try adjusting your search criteria or resetting filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/20 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider select-none">
                  <th onClick={() => handleSort('case_id')} className="py-3 px-3.5 pl-4 font-semibold whitespace-nowrap cursor-pointer hover:text-on-surface">
                    <div className="inline-flex items-center gap-1">
                      <span>Case ID</span>
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                    </div>
                  </th>
                  <th onClick={() => handleSort('institution')} className="py-3 px-3.5 font-semibold min-w-[240px] cursor-pointer hover:text-on-surface">
                    <div className="inline-flex items-center gap-1">
                      <span>Institution</span>
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                    </div>
                  </th>
                  <th onClick={() => handleSort('bureau')} className="py-3 px-3 font-semibold whitespace-nowrap cursor-pointer hover:text-on-surface">
                    <div className="inline-flex items-center gap-1">
                      <span>Bureau</span>
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Category</th>
                  <th onClick={() => handleSort('status')} className="py-3 px-3 font-semibold whitespace-nowrap cursor-pointer hover:text-on-surface">
                    <div className="inline-flex items-center gap-1">
                      <span>Status</span>
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 font-semibold whitespace-nowrap">Officer</th>
                  <th onClick={() => handleSort('received_date')} className="py-3 px-3 font-semibold whitespace-nowrap cursor-pointer hover:text-on-surface">
                    <div className="inline-flex items-center gap-1">
                      <span>Received</span>
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                    </div>
                  </th>
                  <th onClick={() => handleSort('deadline')} className="py-3 px-3.5 font-semibold whitespace-nowrap cursor-pointer hover:text-on-surface">
                    <div className="inline-flex items-center gap-1">
                      <span>Deadline</span>
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 pr-4 text-center font-semibold whitespace-nowrap">Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-[13px]">
                {cases.map((c) => {
                  const isOverdueRow = c.status !== 'disposed' && c.deadline && c.deadline < '2026-10-26'
                  return (
                    <tr
                      key={c.case_id}
                      onClick={() => navigate(`/cases/${c.case_id}`)}
                      className={`cursor-pointer transition-colors ${
                        isOverdueRow
                          ? 'bg-error-container/20 hover:bg-error-container/35 border-l-[3.5px] border-l-error'
                          : 'hover:bg-surface-container-low/70'
                      }`}
                    >
                      <td className="py-3.5 px-3.5 pl-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-primary hover:underline">
                          {c.case_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-on-surface leading-snug">
                          {c.institution?.name?.split(',')[0]}
                        </div>
                        <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                          {c.institution?.name?.split(',').slice(1).join(',').trim()}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-on-surface">
                        {c.bureau}
                      </td>
                      <td className="py-3.5 px-3.5 text-on-surface">
                        {c.category}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-3 text-on-surface whitespace-nowrap">
                        {c.officer}
                      </td>
                      <td className="py-3.5 px-3 text-on-surface-variant whitespace-nowrap">
                        {formatIndianDate(c.received_date)}
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="text-on-surface font-medium text-[12px]">{formatIndianDate(c.deadline)}</div>
                        <CountdownBadge deadline={c.deadline} status={c.status} />
                      </td>
                      <td className="py-3.5 px-3 pr-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {c.alert_type === 'overlap' ? (
                          <div className="relative group inline-block">
                            <span className="inline-flex items-center justify-center text-secondary-container hover:text-secondary">
                              <span className="material-symbols-filled text-[20px] text-[#f28c28]">warning</span>
                            </span>
                            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block z-30 bg-inverse-surface text-inverse-on-surface text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                              Overlap Alert: Active docket in other bureau
                            </div>
                          </div>
                        ) : c.alert_type === 'duplicate' ? (
                          <div className="relative group inline-block">
                            <span className="inline-flex items-center justify-center text-secondary hover:text-on-secondary-container">
                              <span className="material-symbols-outlined text-[20px] text-[#914d00]">content_copy</span>
                            </span>
                            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block z-30 bg-inverse-surface text-inverse-on-surface text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                              Possible duplicate: similar case in same bureau
                            </div>
                          </div>
                        ) : (
                          <span className="text-outline-variant">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <Pagination
          page={page}
          total={total}
          pageSize={20}
          onChange={(newPage) => updateFilters({ page: newPage })}
        />
      </div>
    </div>
  )
}
