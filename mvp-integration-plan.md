# MVP Integration Plan
_Builds the minimum from `frontend.md` v3.1 + `backend.md` v1. **MVP scope = the 9 endpoints both docs share** (the backend MVP set, `backend.md` §1). The frontend-first half builds against a mock that speaks the same contract; the second half builds the backend and swaps the mock for real `/api`. The pages don't change at the swap — they already speak the contract._

## MVP scope (what's in)
**9 endpoints** (frontend §12 ↔ backend §11.1–11.9): meta/options · meta/demo-users · dashboard/kpis · dashboard/attention · cases (GET) · cases (POST) · case detail · institutions/{id} · search.

**6 frontend pages:** Dashboard · Cases list · New Complaint · Case detail (read-only) · Institution Profile · GlobalSearch (in top bar).

## Deferred to "Later" (the 6 frontend-spec-only endpoints)
| frontend §12 # | endpoint | reason |
|---|---|---|
| #6 | `/alerts/summary` | Notification bell — backend defers → **resolves §18 SLA decision: option (b), bell not in v1** |
| #10 | `/cases/{id}/history` | History tab |
| #11 | `/cases/{id}/actions` | Case actions — case detail `permissions` are all `false` in the MVP, buttons hidden |
| #12, #13 | case PDF, cases PDF | PDF export |
| #15 | `/audit/event` | Audit log |

`frontend.md` §14 demo steps 7–8 (Export PDF, Admin History tab) depend on these → **trim them for the MVP demo (run steps 1–6 only)**.

---

# Part 1 — Frontend on mocks (no backend)
Goal: a fully demoable MVP frontend with zero backend.

## F0 — Foundation & mocks
- Vite + React + Tailwind + Router + React Query + tokens + Inter
- axios `client.js` (baseURL `/api`) + a **mock adapter** resolving the 9 MVP endpoints from fixtures
- **Fixtures = `backend.md` §12 seed in JS** (7 users, 10 institutions, ~40 cases, planted overlap/duplicate scenarios; Sunrise kept free for the live demo) — so the mock and the real seed show identical data
- Mock functions returning the §11 shapes; **mutable store** so `POST /cases` updates it and recomputes `alert_type`/overlap
- Minimal name-similarity matcher for the New Complaint alert (deliberately dumb — disposable)
- RoleContext (from mock demo-users) + DateRangeContext
**Demoable:** app boots; role switcher populates 5 users; mock data flows.
**Done when:** every mock endpoint returns a valid §11 shape (dev check route or console).

## F1 — Layout shell
- AppLayout, Sidebar (links + ComingSoon for Later), TopBar (search placeholder, date filter, role switcher — **no bell**)
- Routes for the 6 MVP pages; ComingSoon for the rest
**Demoable:** every link navigates; active link styled; Later pages show ComingSoon.

## F2 — Dashboard
- KPIStrip (6 cards, deep-link to `/cases` filters) + Cases Needing Attention (top 10, CountdownBadge)
**Demoable:** KPIs from mock; clicking a card sets the cases filter; overdue rows red.

## F3 — Cases list
- DataTable, FilterBar (URL-synced), Pagination, StatusBadge, overlap/duplicate alert icons
**Demoable:** filters change URL + results; column sort; 20/page; overdue rows tinted; overlap ⚠ tooltip.

## F4 — Case detail (read-only)
- Header (status, CountdownBadge), Details, Related cases box (overlap/duplicate labels + match reason), Timeline tab (read-only)
- **No History tab, no action modals** — `permissions` object is all `false` in the MVP; buttons hidden
**Demoable:** open a seeded case; timeline renders; related cases box shows the overlap.

## F5 — New Complaint + AlertResultModal (core demo)
- Form (React Hook Form) + validation + deadline preview (received + 30 days)
- Save → mock matcher → AlertResultModal (overlap saffron / duplicate amber) or success toast
**Demoable:** create PGRC Sunrise fee-refund → no alerts; then RB "Sunrise Engg Clg Nagpur" Infrastructure → **overlap pop-up**; same-bureau repeat → **duplicate pop-up**.

## F6 — Institution Profile (headline feature)
- Identity card (+ optional aliases), OverlapBanner, summary strip, cases grouped by bureau, key-fields lock rule for officers/regional
**Demoable:** search "sunrise" → profile; saffron banner; PGRC rows 🔒 as RB officer; all rows full as Senior.

## F7 — GlobalSearch (top bar)
- Debounced, grouped Cases/Institutions, ↑↓ Enter Esc — over mock data
**Demoable:** typing "sunrise" shows grouped results; keyboard nav works.

## F8 — Polish + frontend demo
- Loading/empty/error states on every data section; role gating on buttons/tabs; responsive (no horizontal scroll)
- Run the **trimmed §14 demo (steps 1–6)** against mocks
**Done when:** trimmed demo passes locally with zero backend.

---

# Part 2 — Build backend MVP, swap mock for real
F0–F8 give a frontend that demos the MVP with no backend. Now build the backend (`backend.md` §16 build order) and swap.

## B0 — Backend setup
- venv, `requirements.txt`, `.env` (`DATABASE_URL=postgresql+psycopg://postgres:PWD@localhost:5432/aicte_dashboard`), `database.py`, `main.py` (`/api` prefix, create tables on startup), health route; PostgreSQL + `CREATE DATABASE aicte_dashboard`
**Done when:** `uvicorn main:app --reload` boots; `http://localhost:8000/docs` opens.

## B1 — Models + constants + deps + permissions
- SQLModel tables (User, Institution, InstitutionAlias, Case, CaseAction, CaseLink); `constants.py`; `deps.py` (X-Role/X-User-Id → CurrentUser); `permissions.py` (all role rules, `backend.md` §7)
**Done when:** tables auto-create on startup.

## B2 — Seed script
- `seed_data.py`: 7 users, 10 institutions, ~40 cases, planted scenarios via `detect_links()`; Sunrise free for the live demo (`backend.md` §12)
**Done when:** seed runs; **data matches the F0 mock fixtures** (so the swap changes nothing visible).

## B3 — Read endpoints
- meta/options, meta/demo-users, dashboard/kpis, dashboard/attention, cases (GET), case detail, institutions/{id}, search
**Done when:** each returns its §11 shape via `/docs` and matches the mock shape exactly.

## B4 — New complaint endpoint (core)
- `matching.py` (normalise + RapidFuzz) + `overlap.py` (overlap/duplicate + CaseLinks + system timeline) + `POST /cases`
**Done when:** create RB "Sunrise Engg Clg Nagpur" Infrastructure as RB officer → overlap alert with the PGRC case, `can_open:false`; same-bureau repeat → duplicate.

## B5 — Swap mock for real backend
- Remove the mock adapter; `client.js` stays (baseURL `/api`); Vite proxy forwards `/api` → `localhost:8000`
- Run the **same trimmed §14 demo** against FastAPI
**Done when:** the exact same demo passes against the real backend as it did against mocks. **Nothing in the pages changed.**

---

# Verification rule (both parts)
A phase is done only when its **Demoable/Done-when** checks pass — compiling is not done. The seam between mock and real backend is verified in B5 by the same demo passing twice.
