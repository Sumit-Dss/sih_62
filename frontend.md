# Frontend Plan – AICTE Integrated Complaint Monitoring Dashboard
**SIH 2026 · Problem Statement 26264** · _v3.1 – prototype for the team_

**Scope:** a working prototype used by me and my teammates (≈5 users), not a production system.
Keep everything simple: one React app, one FastAPI backend, one PostgreSQL database.

**Stage 1 (now):** everything runs **locally** – PostgreSQL on each laptop, FastAPI on `localhost:8000`, React on `localhost:5173`.
**Stage 2 (later):** everything on **Vercel** (React + FastAPI as one project) with **Neon** PostgreSQL.

### What changed in v3.1
- 🔁 **Local-first:** PostgreSQL runs on each teammate's PC; same seed data for everyone
- 🔁 **All API paths start with `/api`** – Vite dev proxy forwards `/api` to FastAPI locally, Vercel serves it on the same domain later → **no CORS, no URL changes**
- 🔁 Deployment changed from Vercel + Render to **Vercel only + Neon** (Render dropped)
- 🔁 Tech stack table now lists backend/database/dev tools and both stages

**Version 1 pages:** Dashboard · Cases list · New Complaint · Case detail · **Institution Profile**
**Later:** Institutions list, Alerts page, Reports, Audit Log page, CSV import.

### What changed in v3
- ➕ **Institution Profile** moved into v1 (PS feature #1 – single source of truth per college)
- ➕ Profile visibility rule: **all officers see all bureaus' cases** on a profile (other bureaus = key fields only)
- ➕ FastAPI-specific API section: base URL, headers, `/docs`, every endpoint with request/response
- ➕ **Deployment** section for a small team (free tiers)
- ➖ Removed MSW / heavy mocking – we call the real FastAPI backend from day one (seed data fills it)
- 🔁 Simplified stack and quality checklist for a prototype

### Changes in v2 (kept)
- New Complaint form + alert pop-up (Overlap / Possible duplicate)
- History tab for officers on own cases; Export PDF for all roles; 30-day deadline

---

## 1. Tech Stack (kept small on purpose)

### Frontend
| Purpose | Choice |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| API calls | Axios (base URL `/api`) |
| Server data | TanStack Query (React Query) – loading/error/refetch for free |
| Forms | React Hook Form |
| Icons | lucide-react |
| Toasts | react-hot-toast |

### Backend & database (built separately – see backend.md)
| Purpose | Choice |
|---|---|
| API | Python + FastAPI (all routes under `/api`) |
| Server (local) | Uvicorn |
| ORM | SQLModel |
| Tables | Auto-created on startup; reseed when schema changes |
| Database | PostgreSQL |
| Fuzzy matching | RapidFuzz |
| PDF | ReportLab |
| Overdue / SLA | Computed on request (no background job) |

### Environments
| | Stage 1 – Local (now) | Stage 2 – Shared (later) |
|---|---|---|
| Frontend | Vite dev server `localhost:5173` | Vercel |
| Backend | Uvicorn `localhost:8000` | Vercel (FastAPI as one function) |
| Database | PostgreSQL on each laptop (installer or Docker) | Neon (free PostgreSQL, pooled connection) |
| API base in frontend | `/api` (Vite proxy → `localhost:8000`) | `/api` (same domain) |

### Dev tools
- Git + GitHub (one repo: `/frontend`, `/backend`)
- VS Code
- pgAdmin (comes with PostgreSQL installer) to view tables
- FastAPI `/docs` to test the backend without the frontend
- Docker (optional) for running PostgreSQL

### Setup checklist
- [ ] `npm create vite@latest frontend -- --template react`
- [ ] Install Tailwind, React Router, Axios, React Query, React Hook Form, lucide-react, react-hot-toast
- [ ] Add Vite dev proxy (below)
- [ ] `.env` → `VITE_API_URL=/api` (same value locally and on Vercel)

### `vite.config.js` – dev proxy
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000", // FastAPI running locally
    },
  },
});
```
The browser only ever talks to `localhost:5173`; Vite forwards `/api/*` to FastAPI. So no CORS setup is needed locally, and nothing changes when moving to Vercel.

---

## 2. Design System

### Colours
| Token | Hex | Used for |
|---|---|---|
| `navy` | `#1E3A5F` | Sidebar, headers, primary buttons |
| `saffron` | `#F28C28` | Overlap alerts, active link border |
| `duplicate` | `#FFF4E5` bg / `#B26A00` text | Possible-duplicate alerts |
| `bg` | `#F7F8FA` | Page background |
| `surface` | `#FFFFFF` | Cards, tables |
| `text` | `#1F2937` | Main text |
| `muted` | `#6B7280` | Secondary text |

### Status colours
| Status | Hex |
|---|---|
| Pending | `#757575` grey |
| Under process | `#1976D2` blue |
| Disposed | `#2E7D32` green |
| Transferred | `#6A1B9A` purple |
| Escalated | `#AD1457` magenta |
| Overdue | `#C62828` red |

### Countdown colours (deadline = received + 30 days)
| Condition | Text | Colour |
|---|---|---|
| Past deadline | "12 days late" | Red `#C62828` |
| 0–3 days | "Due today" / "2 days left" | Orange `#F28C28` |
| 4–7 days | "6 days left" | Amber `#F9A825` |

### Alert styles
| Type | When | Look | Title |
|---|---|---|---|
| **Overlap** | Same institution, open cases in **different** bureaus | Saffron border, ⚠ | "Potential Overlapping Cases – Coordination Required" |
| **Possible duplicate** | Same institution, open cases in the **same** bureau | Light amber, ⧉ | "Possible Duplicate Complaint – Please Review" |

### Typography & spacing
- Inter font (Google Fonts), body 14px, page title 24px, KPI number 28px
- Cards: 8px radius, soft shadow, 16–24px padding; mobile gutter 16px

- [ ] Add tokens to `tailwind.config.js`, load Inter, set base styles

---

## 3. Folder Structure

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # routes + layout
│   ├── api/
│   │   ├── client.js             # axios instance + role headers
│   │   ├── dashboard.js
│   │   ├── cases.js
│   │   ├── institutions.js
│   │   ├── search.js
│   │   ├── alerts.js
│   │   └── meta.js
│   ├── context/
│   │   ├── RoleContext.jsx
│   │   └── DateRangeContext.jsx
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   ├── components/
│   │   ├── GlobalSearch.jsx
│   │   ├── DateRangeFilter.jsx
│   │   ├── RoleSwitcher.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── KPICard.jsx / KPIStrip.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── CountdownBadge.jsx
│   │   ├── AlertTypeBadge.jsx
│   │   ├── OverlapBanner.jsx     # saffron banner on Institution Profile
│   │   ├── DataTable.jsx
│   │   ├── FilterBar.jsx
│   │   ├── Pagination.jsx
│   │   ├── Timeline.jsx
│   │   ├── RelatedCasesBox.jsx
│   │   ├── AlertResultModal.jsx
│   │   ├── Modal.jsx
│   │   └── States.jsx            # Skeleton, EmptyState, ErrorState
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── CasesList.jsx
│   │   ├── NewComplaint.jsx
│   │   ├── CaseDetail.jsx
│   │   ├── InstitutionProfile.jsx
│   │   └── ComingSoon.jsx
│   └── utils/
│       ├── dates.js              # countdown, IST formatting
│       └── roles.js              # permissions map
└── tailwind.config.js
```

---

## 4. Routing

| Path | Page | v1? |
|---|---|---|
| `/` | Dashboard | ✅ |
| `/cases` | Cases list (filters in URL) | ✅ |
| `/cases/new` | New Complaint | ✅ |
| `/cases/:caseId` | Case detail | ✅ |
| `/institutions/:aicteId` | **Institution Profile** | ✅ |
| `/institutions` | Institutions list | Later (ComingSoon) |
| `/alerts` | Alerts page | Later |
| `/reports` | Reports | Later |
| `/audit` | Audit log | Later |

- Declare `/cases/new` before `/cases/:caseId`.
- **Entry point to Institution Profile: Global search only** (search an institution name or AICTE ID → select an "Institutions" result).

---

## 5. Roles & Permissions

### RoleContext
- Roles: `PGRC_OFFICER`, `RB_OFFICER`, `REGIONAL_OFFICE`, `SENIOR_MANAGEMENT`, `ADMIN`
- Each role maps to a seeded demo user (`userId`, `userName`, `bureau`, `region`)
- Stored in `localStorage` (try/catch); sent on every request as headers `X-Role` and `X-User-Id`
- No passwords – it's a team prototype

### Permissions
| Role | Dashboard & Cases list | Institution Profile | Create complaint | Act on case | Escalate | Export PDF | History tab |
|---|---|---|---|---|---|---|---|
| PGRC Officer | PGRC only | **All bureaus** (others = key fields) | ✅ PGRC | ✅ own bureau | ❌ | ✅ own data | ✅ own cases |
| RB Officer | RB only | **All bureaus** (others = key fields) | ✅ RB | ✅ own bureau | ❌ | ✅ own data | ✅ own cases |
| Regional Office | Own region | **All bureaus** (others = key fields) | ❌ | Remarks only | ❌ | ✅ own data | ❌ |
| Senior Management | All | All, full detail | ✅ any bureau | ❌ | ✅ | ✅ all | ✅ all |
| Admin | All | All, full detail | ✅ any bureau | ✅ | ✅ | ✅ all | ✅ all |

**"Key fields only"** = case ID, bureau, category, status, officer, received date, deadline. No description, no actions, row not clickable (shows 🔒 "Handled by PGRC – contact A. Sharma").

> Frontend hides buttons; the **backend is the real check**.

### DateRangeContext
- Presets: This month · Last 3 months · This year (default) · All time · Custom
- Applies to Dashboard and Cases list (not to Institution Profile – profile always shows full history)

- [ ] RoleContext + RoleSwitcher
- [ ] DateRangeContext + DateRangeFilter
- [ ] `utils/roles.js`: `canCreate`, `canAct(case)`, `canEscalate`, `canExport`, `canViewHistory(case)`, `canViewAudit`

---

## 6. Layout (every page)

### Sidebar
- [ ] Navy, logo + name, links: Home, Cases, Institutions, Alerts, Reports, Audit Log
- [ ] Active link: saffron left border
- [ ] Audit Log link only for Senior/Admin
- [ ] Later pages → ComingSoon
- [ ] Collapsible; ☰ on mobile

### Top bar
- [ ] **Global search** – case ID / AICTE ID / institution name; debounced 300ms; dropdown grouped "Cases" and "Institutions"; ↑ ↓ Enter Esc
  - Case result → `/cases/:caseId`
  - Institution result → `/institutions/:aicteId` (**only way into the profile**)
- [ ] **Date range filter**
- [ ] **Role switcher** (badge shows current role)
- [ ] **Notification bell** – count + latest 5 alerts with `AlertTypeBadge` (overlap ⚠ / duplicate ⧉ / SLA ⏰); click → case
- [ ] User name + role

---

## 7. Page: Dashboard

```
[Total][Pending][Under process][Disposed][Transferred][Overdue]

Cases Needing Attention                                View all →
Case ID │ Institution │ Bureau │ Category │ Officer │ Deadline │ Countdown
```

### KPI strip
| Card | Click → |
|---|---|
| Total | `/cases` |
| Pending | `/cases?status=pending` |
| Under process | `/cases?status=under_process` |
| Disposed | `/cases?status=disposed` |
| Transferred | `/cases?status=transferred` |
| Overdue (red) | `/cases?overdue=true` |

### Cases Needing Attention
- Overdue + due within 7 days, sorted by urgency, top 10, colour-coded countdown
- Row click → case detail · "View all" → `/cases?attention=true`
- Empty: "No cases need attention 🎉"

- [ ] KPIStrip, attention table, skeleton/empty/error states
- [ ] Refetch on role or date change

---

## 8. Page: Cases List

```
Cases                                  [+ New Complaint] [Export PDF]
[Search…] [Bureau▾][Region▾][Category▾][Status▾][Date▾][☐ Overdue][Clear]
Case ID │ Institution │ Bureau │ Category │ Status │ Officer │ Received │ Deadline │ ⚠
```

- [ ] Filters synced to URL; removable filter chips
- [ ] Sort by column; 20 per page
- [ ] Alert icon column: ⚠ overlap / ⧉ duplicate (tooltip)
- [ ] Overdue rows tinted red
- [ ] Row click → case detail
- [ ] + New Complaint (if `canCreate`); Export PDF (all roles)
- [ ] Role filter applied by backend

---

## 9. Page: New Complaint

### Fields
| Field | Required | Notes |
|---|---|---|
| Institution name | ✅ | Free text, may be misspelled; **no live suggestions** |
| AICTE Permanent ID | ❌ | If given → exact match |
| City | ✅ | Used in matching |
| State | ✅ | Dropdown → region |
| Bureau / Cell | ✅ | Locked to officer's bureau; editable for Senior/Admin |
| Category | ✅ | Fee refund, Admission, Faculty, Infrastructure, Approval/Affiliation, Harassment, Certificates withheld, Other |
| Source channel | ✅ | CSS portal, Email, Ministry/CPGRAMS, Post, Institute GRC, Court/RTI, Other |
| Received date | ✅ | Default today, not in future |
| Complainant name | ❌ | |
| Description | ✅ | Min 20 chars |

- [ ] Shows "Deadline will be 24 Nov 2026 (30 days)"
- [ ] Save → `POST /cases`
  - `alerts` not empty → **AlertResultModal**
  - `alerts` empty → toast "Case RB-2026-0251 created" → case detail
- [ ] Keeps form data on error
- [ ] (Attachments skipped in v1 – add later if time)

### AlertResultModal
```
⚠ Potential Overlapping Cases – Coordination Required
You entered:  "Sunrise Engg Clg Nagpur"
Matched to:   Sunrise Engineering College, Nagpur (1-12345)
Match reason: name similarity 93% · same city

[ New case RB-2026-0251 ]   [ Existing PGRC-2026-0001 ]

[Open existing case]  [Open new case]  [Close]
```
- [ ] Overlap (saffron) and duplicate (amber) versions; both sections if both apply
- [ ] "Medium-confidence match – please verify" note when `needs_confirmation`
- [ ] Existing case from another bureau → "Open existing case" disabled for officers (key-fields only rule)
- [ ] Close → new case detail; bell refreshes

---

## 10. Page: Case Detail

```
RB-2026-0042            [Under process]  🔴 12 days late
Sunrise Engineering College, Nagpur (1-12345)
Bureau: RB · Officer: R. Verma · Received 03 Feb · Deadline 05 Mar
[Add action] [Transfer] [Escalate] [Close] [Export PDF]

Details                         Related cases
                                ⚠ Overlap  PGRC-2026-0001 …
[ Timeline ] [ History ]
```

- [ ] Header: ID, status, countdown, institution (plain text – not a link), bureau, officer, dates
- [ ] Details: category, source, complainant, description, last/next action
- [ ] Related cases box with ⚠ Overlap / ⧉ Duplicate labels + match reason
- [ ] Timeline tab (system events included)
- [ ] History tab – officers (own cases), Senior, Admin
- [ ] Action modals: Add action · Transfer · Escalate · Close
- [ ] Export PDF
- [ ] Opening another bureau's case as an officer → backend returns 403 → show "You don't have access to this case"

---

## 11. Page: Institution Profile (NEW in v1)

**Purpose:** one page per college showing everything AICTE has on it, across **all bureaus** – the single source of truth. Makes cross-bureau overlap visible without opening individual cases.

### Layout
```
← Back
┌──────────────────────────────────────────────────────────────────┐
│ Sunrise Engineering College                                      │
│ AICTE ID: 1-12345 · Nagpur, Maharashtra · Western Region         │
│ Address: Plot 12, Hingna Road, Nagpur 440016                     │
│ Type: Private Engineering College                                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ⚠ Potential Overlapping Cases – Coordination Required            │  (saffron)
│ Open cases in 2 bureaus: RB (1) · PGRC (1)                       │
└──────────────────────────────────────────────────────────────────┘

 Total 5 │ Open 3 │ Disposed 2 │ Overdue 1 │ Bureaus involved 2

RB  (2 cases · 1 open)
 Case ID       Category        Status         Officer    Received   Deadline   Countdown
 RB-2026-0042  Infrastructure  Under process  R. Verma   03 Feb     05 Mar     🔴 12d late
 RB-2025-0310  Approval        Disposed       S. Khan    10 Aug 25  09 Sep 25  —

PGRC  (3 cases · 2 open)                            🔒 key fields only
 PGRC-2026-0001  Fee refund   Under process  A. Sharma  10 Jan  09 Feb  🔴 …
 PGRC-2026-0019  Fee refund   Pending        A. Sharma  02 Oct  01 Nov  🟠 7d left
 PGRC-2025-0144  Harassment   Disposed       M. Iyer    …
```
_(Viewed as RB Officer: RB rows are full & clickable; PGRC rows are key fields only.)_

### Sections
**1. Identity card**
- [ ] Name, AICTE Permanent ID, address, city, state, region, institution type
- [ ] Known name variations (aliases) collected by matching, e.g. "Sunrise Engg Clg" – shown small (optional, nice for demo)

**2. Overlap banner (`OverlapBanner`)**
- [ ] Shown when **open** cases exist in **2 or more bureaus**
- [ ] Saffron, ⚠, title "Potential Overlapping Cases – Coordination Required"
- [ ] Lists bureaus involved with open counts
- [ ] If only same-bureau open duplicates exist → lighter amber banner "Possible duplicate complaints in RB"
- [ ] No banner when 0–1 bureaus have open cases

**3. Summary strip**
- [ ] Total · Open · Disposed · Overdue · Bureaus involved

**4. Cases grouped by bureau**
- [ ] One section per bureau, header "RB (2 cases · 1 open)"
- [ ] Bureaus with open cases listed first
- [ ] Within a section: open cases first (most urgent on top), then disposed
- [ ] Columns: Case ID · Category · Status · Officer · Received · Deadline · Countdown
- [ ] Includes **open + disposed** cases (full history)
- [ ] Not affected by the top-bar date filter

### Visibility rule
| Viewer | Own bureau rows | Other bureau rows |
|---|---|---|
| Officer / Regional | Full, clickable → case detail | **Key fields only**, not clickable, 🔒 "Handled by {bureau} – contact {officer}" |
| Senior / Admin | Full, clickable | Full, clickable |

- [ ] Section header shows 🔒 "key fields only" when the viewer can't open those cases
- [ ] Backend decides `can_open` per case; frontend just reads it

### Behaviour
- [ ] Fetch `GET /institutions/{aicte_id}` once
- [ ] Export PDF button (later – listed in Later Pages)
- [ ] Loading skeleton; 404 → "Institution not found"
- [ ] Page view logged to audit

---

## 12. API – FastAPI Backend

### Basics
- **Base URL:** `VITE_API_URL=/api` in both stages. All endpoints below are relative to it (e.g. `/cases` = `/api/cases`).
- **Interactive docs:** `http://localhost:8000/docs` locally (Swagger UI – test every endpoint without the frontend)
- **Headers on every request:** `X-Role`, `X-User-Id`
- **CORS:** not needed – same origin via Vite proxy (local) and Vercel (later)
- **Dates:** ISO `YYYY-MM-DD`; timestamps ISO with timezone; frontend displays in IST
- **Errors:** FastAPI default `{"detail": "..."}` – 403 no access, 404 not found, 422 validation

### `api/client.js`
```js
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("demoUser") || "{}");
    if (user.role) config.headers["X-Role"] = user.role;
    if (user.id) config.headers["X-User-Id"] = user.id;
  } catch {}
  return config;
});

export default api;
```

### Endpoints

| # | Method | Endpoint | Used by |
|---|---|---|---|
| 1 | GET | `/meta/options` | Form dropdowns (bureaus, categories, source channels, states) |
| 2 | GET | `/meta/demo-users` | Role switcher (seeded users per role) |
| 3 | GET | `/dashboard/kpis?from=&to=` | KPI strip |
| 4 | GET | `/dashboard/attention?from=&to=&limit=10` | Attention list |
| 5 | GET | `/search?q=` | Global search |
| 6 | GET | `/alerts/summary` | Bell |
| 7 | GET | `/cases?bureau=&region=&category=&status=&from=&to=&overdue=&attention=&q=&sort=&order=&page=&page_size=` | Cases list |
| 8 | POST | `/cases` | New Complaint |
| 9 | GET | `/cases/{case_id}` | Case detail |
| 10 | GET | `/cases/{case_id}/history` | History tab |
| 11 | POST | `/cases/{case_id}/actions` | Add action / transfer / escalate / close |
| 12 | GET | `/cases/{case_id}/pdf` | Case PDF |
| 13 | GET | `/cases/export/pdf?…filters…` | Cases list PDF |
| 14 | GET | `/institutions/{aicte_id}` | **Institution Profile** |
| 15 | POST | `/audit/event` | Page views, role switches, searches |

### 1. `GET /meta/options`
```json
{
  "bureaus": ["RB", "PGRC", "Approval Bureau", "Academic Bureau"],
  "categories": ["Fee refund", "Admission", "Faculty", "Infrastructure", "Approval/Affiliation", "Harassment", "Certificates withheld", "Other"],
  "source_channels": ["CSS portal", "Email", "Ministry/CPGRAMS", "Post", "Institute GRC", "Court/RTI", "Other"],
  "states": [{ "name": "Maharashtra", "region": "Western" }]
}
```

### 2. `GET /meta/demo-users`
```json
[
  { "id": 1, "name": "A. Sharma", "role": "PGRC_OFFICER", "bureau": "PGRC", "region": null },
  { "id": 3, "name": "R. Verma", "role": "RB_OFFICER", "bureau": "RB", "region": null },
  { "id": 5, "name": "K. Nair", "role": "REGIONAL_OFFICE", "bureau": null, "region": "Western" },
  { "id": 7, "name": "Dr. P. Rao", "role": "SENIOR_MANAGEMENT", "bureau": null, "region": null },
  { "id": 9, "name": "Admin", "role": "ADMIN", "bureau": null, "region": null }
]
```

### 3. `GET /dashboard/kpis`
```json
{ "total": 248, "pending": 61, "under_process": 44, "disposed": 120, "transferred": 14, "overdue": 9 }
```

### 4. `GET /dashboard/attention`
```json
[
  {
    "case_id": "RB-2026-0042",
    "institution": { "aicte_id": "1-12345", "name": "Sunrise Engineering College, Nagpur" },
    "bureau": "RB", "category": "Infrastructure", "officer": "R. Verma",
    "received_date": "2026-09-13", "deadline": "2026-10-13", "status": "under_process"
  }
]
```

### 5. `GET /search?q=sunrise engg`
```json
{
  "cases": [{ "case_id": "RB-2026-0042", "institution_name": "Sunrise Engineering College", "bureau": "RB" }],
  "institutions": [{ "aicte_id": "1-12345", "name": "Sunrise Engineering College", "city": "Nagpur", "score": 91 }]
}
```
Cases filtered by role; institutions always returned (so every officer can reach any profile).

### 6. `GET /alerts/summary`
```json
{
  "unresolved": 3,
  "latest": [
    { "id": 12, "type": "overlap", "case_id": "RB-2026-0251", "institution_name": "Sunrise Engineering College", "created_at": "2026-10-25T17:40:00+05:30" }
  ]
}
```

### 7. `GET /cases`
```json
{
  "items": [
    {
      "case_id": "RB-2026-0042",
      "institution": { "aicte_id": "1-12345", "name": "Sunrise Engineering College, Nagpur" },
      "bureau": "RB", "category": "Infrastructure", "status": "under_process",
      "officer": "R. Verma", "received_date": "2026-09-13", "deadline": "2026-10-13",
      "alert_type": "overlap"
    }
  ],
  "page": 1, "page_size": 20, "total": 248
}
```
`alert_type`: `"overlap"`, `"duplicate"` or `null`.

### 8. `POST /cases`
Request:
```json
{
  "institution_name": "Sunrise Engg Clg Nagpur",
  "aicte_id": null,
  "city": "Nagpur",
  "state": "Maharashtra",
  "bureau": "RB",
  "category": "Infrastructure",
  "source_channel": "Ministry/CPGRAMS",
  "received_date": "2026-10-25",
  "complainant_name": "",
  "description": "No proper labs and several faculty listed are not present..."
}
```
Response `201`:
```json
{
  "case": { "case_id": "RB-2026-0251", "status": "pending", "deadline": "2026-11-24", "bureau": "RB", "officer": "R. Verma" },
  "institution_match": {
    "typed_name": "Sunrise Engg Clg Nagpur",
    "matched": { "aicte_id": "1-12345", "name": "Sunrise Engineering College, Nagpur" },
    "method": "fuzzy_name",
    "confidence": 93,
    "needs_confirmation": false,
    "reason": "name similarity 93% · same city"
  },
  "alerts": [
    {
      "type": "overlap",
      "title": "Potential Overlapping Cases – Coordination Required",
      "related_cases": [
        { "case_id": "PGRC-2026-0001", "bureau": "PGRC", "category": "Fee refund", "status": "under_process", "officer": "A. Sharma", "can_open": false }
      ]
    }
  ]
}
```
- `method`: `"aicte_id"` | `"fuzzy_name"` | `"new_institution"`
- `alerts: []` when nothing matches

### 9. `GET /cases/{case_id}`
```json
{
  "case_id": "RB-2026-0042",
  "institution": { "aicte_id": "1-12345", "name": "Sunrise Engineering College, Nagpur" },
  "bureau": "RB", "category": "Infrastructure", "status": "under_process",
  "officer": { "id": 3, "name": "R. Verma" },
  "source_channel": "Ministry/CPGRAMS", "complainant_name": null,
  "description": "…", "received_date": "2026-02-03", "deadline": "2026-03-05",
  "last_action": { "text": "Notice sent to institution", "date": "2026-02-10" },
  "next_action": "Await reply / schedule inspection",
  "timeline": [
    { "at": "2026-02-03T11:00:00+05:30", "type": "created", "text": "Case created", "by": "R. Verma", "bureau": "RB", "remarks": null },
    { "at": "2026-02-25T09:00:00+05:30", "type": "system", "text": "Overlap detected with PGRC-2026-0001", "by": "System", "bureau": null, "remarks": null }
  ],
  "related_cases": [
    { "case_id": "PGRC-2026-0001", "link_type": "overlap", "bureau": "PGRC", "category": "Fee refund", "status": "under_process", "officer": "A. Sharma", "reason": "same AICTE ID", "needs_confirmation": false, "can_open": false }
  ],
  "permissions": { "can_act": true, "can_escalate": false, "can_export": true, "can_view_history": true }
}
```
`403` if the viewer's role can't open this case.

### 10. `GET /cases/{case_id}/history`
```json
[
  { "at": "2026-10-25T10:15:00+05:30", "user": "R. Verma", "role": "RB_OFFICER", "action": "update", "field": "status", "old": "under_process", "new": "disposed" },
  { "at": "2026-10-25T10:10:00+05:30", "user": "Dr. P. Rao", "role": "SENIOR_MANAGEMENT", "action": "view", "field": null, "old": null, "new": null }
]
```

### 11. `POST /cases/{case_id}/actions`
```json
{ "type": "add_action", "remarks": "Notice sent", "next_action": "Await reply", "next_date": "2026-11-05" }
{ "type": "transfer", "to_bureau": "PGRC", "to_officer_id": 1, "reason": "Fee matter" }
{ "type": "escalate", "to": "Senior Management", "reason": "No reply in 30 days" }
{ "type": "close", "remarks": "Fee refunded", "outcome": "Resolved" }
```
Response: the updated case (same shape as #9).

### 12–13. PDF endpoints
- Return `application/pdf`; frontend downloads with `responseType: "blob"`
```js
const res = await api.get(`/cases/${id}/pdf`, { responseType: "blob" });
const url = URL.createObjectURL(res.data);
const a = document.createElement("a"); a.href = url; a.download = `${id}.pdf`; a.click();
URL.revokeObjectURL(url);
```

### 14. `GET /institutions/{aicte_id}` – Institution Profile
```json
{
  "institution": {
    "aicte_id": "1-12345",
    "name": "Sunrise Engineering College",
    "address": "Plot 12, Hingna Road, Nagpur 440016",
    "city": "Nagpur", "state": "Maharashtra", "region": "Western",
    "type": "Private Engineering College",
    "aliases": ["Sunrise Engg Clg Nagpur", "Sunrise College of Engineering"]
  },
  "summary": { "total": 5, "open": 3, "disposed": 2, "overdue": 1, "bureaus_involved": 2 },
  "overlap": {
    "type": "overlap",
    "title": "Potential Overlapping Cases – Coordination Required",
    "bureaus": [{ "bureau": "RB", "open": 1 }, { "bureau": "PGRC", "open": 2 }]
  },
  "bureaus": [
    {
      "bureau": "RB", "total": 2, "open": 1, "full_access": true,
      "cases": [
        { "case_id": "RB-2026-0042", "category": "Infrastructure", "status": "under_process", "officer": "R. Verma", "received_date": "2026-02-03", "deadline": "2026-03-05", "can_open": true }
      ]
    },
    {
      "bureau": "PGRC", "total": 3, "open": 2, "full_access": false,
      "cases": [
        { "case_id": "PGRC-2026-0001", "category": "Fee refund", "status": "under_process", "officer": "A. Sharma", "received_date": "2026-01-10", "deadline": "2026-02-09", "can_open": false }
      ]
    }
  ]
}
```
- `overlap` is `null` when fewer than 2 bureaus have open cases; `type: "duplicate"` when only one bureau has multiple open cases
- `full_access: false` → frontend shows 🔒 header and non-clickable rows
- Key-field rows never include `description`
- `404` if AICTE ID not found

### 15. `POST /audit/event`
```json
{ "event": "page_view", "page": "/institutions/1-12345" }
{ "event": "role_switch", "from": "PGRC_OFFICER", "to": "RB_OFFICER" }
{ "event": "search", "query": "sunrise engg" }
```
(Creates, updates, actions and exports are logged by the backend automatically.)

### Shared business rules
- Deadline = `received_date + 30 days`
- Overdue = `deadline < today` AND not disposed
- Due soon = deadline within 7 days AND not disposed
- Overlap = same institution, open cases in **different** bureaus
- Possible duplicate = same institution, another open case in the **same** bureau
- Matching: ≥ 85% auto-link · 70–85% link + needs confirmation · < 70% new institution
- Role filter: officer → own bureau · regional → own region · senior/admin → all
- **Exception:** Institution Profile shows all bureaus to everyone (other bureaus key fields only for officers/regional)

---

## 13. Running & Deployment

### Stage 1 – Local (now)
Each teammate runs everything on their own laptop. Same seed script → same starting data for everyone.

**1. PostgreSQL on your PC** (pick one)
- **Installer:** postgresql.org → Download → your OS (includes pgAdmin). Keep port `5432`, set a password for `postgres`, then create the database:
  ```sql
  CREATE DATABASE aicte_dashboard;
  ```
- **Docker:**
  ```bash
  docker run -d --name aicte-db -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=aicte_dashboard -p 5432:5432 postgres:16
  ```

**2. Backend** – `backend/.env`
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aicte_dashboard
```
```bash
cd backend
python seed_data.py              # creates tables + sample data (rerun to reset)
uvicorn main:app --reload        # http://localhost:8000  (+ /docs)
```

**3. Frontend** – `frontend/.env`
```
VITE_API_URL=/api
```
```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173  (proxies /api → :8000)
```

**Local checklist**
- [ ] PostgreSQL running, `aicte_dashboard` database created
- [ ] `backend/.env` has correct `DATABASE_URL`
- [ ] Seed script runs without errors
- [ ] `http://localhost:8000/docs` opens and endpoints respond
- [ ] `http://localhost:5173` loads Dashboard with seeded numbers
- [ ] Demo script (section 14) works end to end

> A database on your PC is only reachable from your PC. Teammates run their own copy; shared data comes in Stage 2.

### Stage 2 – Shared on Vercel (later)
One Vercel project serves both the React build and the FastAPI app; database on Neon.

| Part | Where | Notes |
|---|---|---|
| Frontend | Vercel | Build `npm run build`, output `dist` |
| Backend | Vercel (same project) | FastAPI app becomes one Vercel Function; routes under `/api` |
| Database | Neon (free PostgreSQL) | Use the **pooled** connection string |

**Environment variables (Vercel dashboard)**
| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `VITE_API_URL` | `/api` |

**Deploy checklist (later)**
- [ ] Push repo to GitHub (`/frontend`, `/backend`)
- [ ] Create Neon project → copy pooled `DATABASE_URL`
- [ ] Run `seed_data.py` once from your laptop with `DATABASE_URL` pointing to Neon
- [ ] Import repo into Vercel; configure frontend build + FastAPI entrypoint (details in backend.md)
- [ ] Add env vars in Vercel
- [ ] SPA rewrite so refreshing `/cases/123` serves `index.html` (but not `/api/*`)
- [ ] Open the Vercel link, run the demo script, share link with teammates

Notes for Stage 2:
- Serverless = no always-on background jobs → overdue/SLA computed on request (already planned)
- Avoid free databases that expire (e.g. Render's free Postgres expires after 30 days) – Neon is the choice

---

## 14. Demo Script
1. Seeded DB → Dashboard shows KPIs + attention list
2. **PGRC Officer** → New Complaint → "Sunrise Engineering College", Nagpur, Fee refund → Save
3. **RB Officer** → New Complaint → "Sunrise Engg Clg Nagpur", Infrastructure → Save → **Overlap pop-up**
4. Global search "sunrise" → open **Institution Profile** → saffron banner, RB and PGRC sections side by side, PGRC rows 🔒 key fields only
5. Switch to **Senior Management** → same profile, all rows full and clickable
6. (Optional) RB Officer adds another Sunrise complaint → **Possible duplicate** pop-up
7. Export a case PDF
8. **Admin** → case History tab shows views and changes from the demo

---

## 15. Prototype Quality Checklist
- [ ] Works on laptop screens; usable on mobile (no horizontal page scroll)
- [ ] Loading, empty and error states on each data section
- [ ] Buttons/tabs hidden by role; backend 403 handled with a friendly message
- [ ] Dates in Indian format, IST
- [ ] Form keeps data if save fails

---

## 16. Build Order (v1)

1. **Setup** – Vite, Tailwind, Router, React Query, tokens, axios client
2. **Layout** – Sidebar, TopBar, RoleContext/RoleSwitcher (from `/meta/demo-users`), DateRangeFilter
3. **Dashboard** – KPIStrip, attention list
4. **Cases list** – table, filters (URL), pagination, badges
5. **New Complaint + AlertResultModal**
6. **Case detail** – header, details, related cases, timeline, history, action modals
7. **Institution Profile** – identity card, OverlapBanner, summary, bureau groups, lock rule
8. **Top bar extras** – GlobalSearch (institution results → profile), NotificationBell
9. **PDF downloads + audit events**
10. **Local run-through** – full demo script on localhost; Vercel + Neon deploy later

---

## 17. Later (after v1)
- Institutions list page
- Institution Profile PDF export
- Alerts page (overlap/duplicate cards, Link / Not related / Notify)
- Reports page with PDF export
- Audit Log page (Senior/Admin)
- Attachments on complaints and actions
- Bulk CSV import
- Clickable institution names across the app (currently entry is global search only)

---

## 18. Decisions

### Settled
- ✅ Prototype for ~5 users
- ✅ Stage 1 local (PostgreSQL on each PC); Stage 2 Vercel (frontend + FastAPI) + Neon
- ✅ API base `/api` everywhere (Vite proxy locally) → no CORS
- ✅ SQLModel, auto-create tables + reseed, ReportLab, SLA computed on request
- ✅ FastAPI + PostgreSQL backend; role sent via headers, no passwords
- ✅ Deadline: 30 days for every case
- ✅ PDF export: all roles, own data only
- ✅ History tab: officers (own cases) + Senior + Admin
- ✅ Alerts: Overlap (different bureaus) + Possible duplicate (same bureau); pop-up after Save
- ✅ Matching after Save only
- ✅ Demo starts from seeded data
- ✅ Institution Profile in v1: all bureaus visible to everyone, other bureaus key fields only, open + disposed, grouped by bureau, entry via global search

### Still open
- [ ] Timeline order: newest first or oldest first?
- [ ] **SLA alerts in the bell:** §6 shows a ⏰ SLA entry but SLA is defined nowhere — no §2 style, no `/alerts/summary` example, and business rules treat "due soon" as a computed status, not an alert. Either (a) make SLA real in v1: define SLA alerts as overdue + due-soon cases surfaced in the bell, add an SLA row to §2 styles and a `type: "sla"` example to `/alerts/summary`; or (b) defer SLA to the Alerts page: drop ⏰ from §6 so the v1 bell shows only overlap + duplicate.
