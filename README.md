# AICTE Sangam
**Integrated Complaint Monitoring Dashboard**
SIH 2026 · Problem Statement 26264

A single-window dashboard for AICTE officials to track institution-related complaint cases across all bureaus (RB, PGRC, and others), detect cross-bureau overlaps, and prevent duplicate work.

---

## The problem it solves

AICTE receives complaints about colleges from students, faculty, and other parties. These land in different bureaus — Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), etc. — and today there is no way to see that **the same college has open cases in two bureaus at the same time**. This causes duplicate effort, conflicting actions, and delays.

Sangam fixes this with a **single source of truth per institution** — open one college, see every case across every bureau, with automatic overlap and duplicate detection.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS (Material Design 3 tokens) |
| Routing | React Router |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form |
| Icons | Material Symbols (Google Fonts) |
| Toasts | react-hot-toast |
| Backend (later) | Python + FastAPI + Uvicorn |
| Database (later) | PostgreSQL local → Neon (serverless) |
| Fuzzy matching (later) | RapidFuzz |

---

## Current state

The frontend is fully built and runs against an **in-memory mock layer** — no backend or database needed right now. All data lives in `frontend/src/api/mockStore.js`.

When the backend is ready, the swap is one line in `src/api/client.js`. Pages don't change.

---

## Pages built

| Page | Route | What it does |
|---|---|---|
| Dashboard | `/` | KPI strip (6 cards) + Cases Needing Attention table |
| Cases list | `/cases` | Filterable, sortable, paginated case table with overlap/duplicate icons |
| Case detail | `/cases/:caseId` | Header, details, related cases box, timeline |
| New Complaint | `/cases/new` | Form with fuzzy institution matching + overlap/duplicate pop-up |
| Institution Profile | `/institutions/:aicteId` | All cases for a college across all bureaus, overlap banner |
| Coming Soon | `/alerts`, `/reports`, `/audit` | Placeholder for later pages |

---

## Running locally

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## Demo script

1. Open the dashboard — see KPIs and attention list with overdue cases
2. Switch role to **PGRC Officer (A. Sharma)** via the top-right dropdown
3. Go to **New Complaint** → enter "Sunrise Engineering College", Nagpur, Fee refund → Save → no alert (first case)
4. Switch to **RB Officer (R. Verma)**
5. New Complaint → "Sunrise Engg Clg Nagpur", Infrastructure → Save → **Overlap pop-up appears** (different bureau, same institution)
6. Search "sunrise" in the top bar → open the **Institution Profile** → saffron banner, RB rows clickable, PGRC rows locked
7. Switch to **Senior Management** → same profile, all rows unlocked

---

## Roles

| Role | What they see |
|---|---|
| PGRC Officer | PGRC cases only |
| RB Officer | RB cases only |
| Regional Office | Own region only |
| Senior Management | Everything, full access |
| Admin | Everything, full access |

Institution Profile is the exception — **all roles see all bureaus' cases**, but officers only see key fields for other bureaus' rows (no description, row not clickable).

---

## Folder structure

```
sih 2nd/
├── frontend/          # React + Vite app (fully built)
│   └── src/
│       ├── api/       # mock layer (client.js, mock.js, mockStore.js)
│       ├── context/   # RoleContext, DateRangeContext
│       ├── layout/    # AppLayout, Sidebar, TopBar
│       ├── components/# KPICard, StatusBadge, CountdownBadge, AlertResultModal, ...
│       ├── pages/     # Dashboard, CasesList, CaseDetail, NewComplaint, InstitutionProfile
│       └── utils/     # dates.js, roles.js
├── frontend.md        # Frontend spec (v3.1)
├── backend.md         # Backend spec (v1 — not built yet)
├── mvp-integration-plan.md
└── README.md
```

---

## What's next

- [ ] Build FastAPI backend (`backend.md` has the full spec)
- [ ] Run `seed_data.py` to populate PostgreSQL with the same data as `mockStore.js`
- [ ] Swap mock adapter in `client.js` for real axios → backend
- [ ] Deploy: Vercel (frontend + FastAPI) + Neon (PostgreSQL)
