# Frontend Build Phases
_No backend yet. Every phase runs on an in-browser mock layer that returns the `frontend.md` §12 API shapes. When the backend is later ideated, delete the mock layer and point `client.js` at real `/api` — the pages don't change, because they already speak the §12 contract._

## Approach
- One React app. Mock API = plain functions in `src/api/` returning §12 JSON shapes, backed by an in-memory store seeded from fixtures.
- `client.js` (axios, baseURL `/api`) stays unchanged; a thin mock adapter resolves calls from fixtures for now. Later: remove the adapter, keep `client.js`, hit real FastAPI. Zero page edits.
- No MSW, no mock framework — the smallest thing that makes every page demoable offline.
- The mock store is **mutable**: creating a case or running an action updates it and recomputes derived fields (status, overdue, overlap/duplicate) so the demo is coherent end to end.

---

## Phase 0 — Foundation & mocks
- Vite + React + Tailwind + Router + React Query + tokens + Inter
- `client.js` (axios, `/api`) + mock adapter resolving from fixtures
- Fixtures: ~30 institutions, ~200 cases across RB/PGRC + 2 bureaus (mixed statuses), the Sunrise overlap scenario, 10 demo users (2 per role)
- Mock functions returning every §12 shape: kpis, attention, cases list, case detail, history, institutions, search, alerts, meta/options, demo-users
- Mutable store: `POST /cases` + `POST /actions` mutate it; a minimal name-similarity matcher produces overlap (different bureau) / duplicate (same bureau) alerts
- RoleContext (from mock demo-users) + DateRangeContext
**Demoable:** app boots; role switcher populates 5 users; switching role changes what data would show.
**Done when:** every mock endpoint returns a valid §12 shape (verify via a dev-only check route or console).

## Phase 1 — Layout shell
- AppLayout, Sidebar (links + ComingSoon for unbuilt), TopBar (search placeholder, date filter, role switcher, bell with mock count)
- Routes for all v1 pages; ComingSoon for Later pages
**Demoable:** every link navigates; active link styled; unbuilt pages show ComingSoon.

## Phase 2 — Dashboard
- KPIStrip (6 cards, deep-link to `/cases` filters) + Cases Needing Attention table (top 10, CountdownBadge)
**Demoable:** KPIs show mock totals; clicking a card sets the cases filter; attention list shows overdue rows in red.

## Phase 3 — Cases list
- DataTable, FilterBar (URL-synced), Pagination, StatusBadge, overlap/duplicate alert icons
**Demoable:** filters change URL + results; column sort; 20/page; overdue rows tinted; overlap ⚠ tooltip.

## Phase 4 — Case detail
- Header (status, CountdownBadge), Details, Related cases box, Timeline + History tabs
- Action modals (Add action / Transfer / Escalate / Close) wired to the mock store
**Demoable:** open a seeded case; run an action → timeline updates; transfer → bureau changes; close → status = disposed; another bureau's case shows the friendly 403 message.

## Phase 5 — New Complaint + alerts
- Form (React Hook Form) with validation; deadline preview (received + 30 days)
- Save → mock matcher → AlertResultModal (overlap saffron / duplicate amber) or success toast
**Demoable:** create PGRC Sunrise fee-refund case, then RB "Sunrise Engg Clg Nagpur" Infrastructure → overlap pop-up; same-bureau repeat → duplicate pop-up.

## Phase 6 — Institution Profile (headline feature)
- Identity card (+ optional aliases), OverlapBanner, summary strip, cases grouped by bureau, key-fields lock rule for officers/regional
**Demoable:** search "sunrise" → profile; saffron banner; RB rows clickable, PGRC rows 🔒 as RB officer; all rows clickable as Senior.

## Phase 7 — Top-bar extras
- GlobalSearch (debounced, grouped Cases/Institutions, ↑↓ Enter Esc) over mock data; NotificationBell (mock alerts with AlertTypeBadge)
**Demoable:** typing "sunrise" shows grouped results; keyboard nav; bell lists latest alerts.
**Blocked on the §18 SLA decision** — see Open dependency.

## Phase 8 — Polish & full demo
- Loading/empty/error states on every data section (frontend.md §15 checklist)
- Role gating on buttons/tabs; responsive (no horizontal page scroll)
- Run frontend.md §14 demo script against mocks, end to end
**Done when:** §14 demo passes locally with zero backend.

---

## Open dependency (unchanged)
Phase 7 NotificationBell is blocked on the §18 SLA decision:
- **(a)** define SLA alerts in the mock + bell (overdue / due-soon as bell entries)
- **(b)** drop ⏰ from the bell; v1 bell shows only overlap + duplicate; SLA moves to the Later Alerts page

## Note on frontend.md v3.1
v3.1 states "Removed MSW / heavy mocking – we call the real FastAPI backend from day one." With no backend ideated, that stance is now inverted: Phase 0 brings back a **minimal** mock layer (not MSW). When you're ready, update frontend.md §1 / §12 intro to reflect mocks-first. The pages themselves don't change — they already speak the §12 contract.
