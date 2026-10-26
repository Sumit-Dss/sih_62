# Backend Plan – AICTE Integrated Complaint Monitoring Dashboard
**SIH 2026 · Problem Statement 26264** · _v1 – MVP prototype_

**Scope:** a working MVP for me and my teammates, running **locally** first (PostgreSQL on each laptop), Vercel + Neon later.
Goal of the MVP: prove the core idea – **complaints from different bureaus are matched to the same institution, and overlaps/duplicates are flagged.**

---

## 1. MVP Scope

### In the MVP
| # | Feature | Endpoint(s) |
|---|---|---|
| 1 | Dropdown options + demo users (role switcher) | `GET /api/meta/options`, `GET /api/meta/demo-users` |
| 2 | Dashboard KPIs + "Cases needing attention" | `GET /api/dashboard/kpis`, `GET /api/dashboard/attention` |
| 3 | Cases list with filters, sort, pagination | `GET /api/cases` |
| 4 | **New complaint** → institution matching → overlap/duplicate detection → result for pop-up | `POST /api/cases` |
| 5 | Case detail (details, timeline, related cases) | `GET /api/cases/{case_id}` |
| 6 | **Institution Profile** (all bureaus, grouped, overlap banner) | `GET /api/institutions/{aicte_id}` |
| 7 | **Global search** (cases + institutions, fuzzy) | `GET /api/search` |
| 8 | Seed script (small dataset with planted overlaps/duplicates) | `python seed_data.py` |

### Not in the MVP (later)
- Audit log + History tab (old → new values, who viewed)
- PDF export (case + filtered list)
- Notification bell / stored alerts with unresolved count
- Case actions (add action, transfer, escalate, close) – statuses come from seed data for now
- Institutions list, Alerts page, Reports, CSV import, attachments, real login

> Alerts still exist in the MVP – they are returned in the `POST /api/cases` response (for the pop-up) and saved as **case links**, so the Related Cases box and Institution Profile show them.

---

## 2. Tech Stack

| Purpose | Choice |
|---|---|
| Language | Python 3.11+ |
| API framework | FastAPI |
| Server (local) | Uvicorn |
| ORM | SQLModel (SQLAlchemy + Pydantic in one) |
| Database | PostgreSQL (local) → Neon later |
| DB driver | psycopg (v3) – `psycopg[binary]` |
| Fuzzy matching | RapidFuzz |
| Config | python-dotenv |
| Tables | Auto-created on startup (`SQLModel.metadata.create_all`); reseed when schema changes |

### `requirements.txt`
```
fastapi
uvicorn[standard]
sqlmodel
psycopg[binary]
rapidfuzz
python-dotenv
```

---

## 3. Folder Structure

```
backend/
├── main.py                 # FastAPI app, routers mounted under /api, create tables on startup
├── database.py             # engine + get_session dependency
├── models.py               # SQLModel tables
├── schemas.py              # request / response models
├── deps.py                 # reads X-Role / X-User-Id → CurrentUser
├── constants.py            # bureaus, categories, source channels, states→regions, statuses
├── routers/
│   ├── meta.py
│   ├── dashboard.py
│   ├── cases.py
│   ├── institutions.py
│   └── search.py
├── services/
│   ├── permissions.py      # all role rules in one place
│   ├── matching.py         # name normalisation + RapidFuzz
│   ├── overlap.py          # overlap / duplicate detection + case links
│   ├── sla.py              # deadline, overdue, due-soon
│   └── case_ids.py         # AICTE-2026-000042 generator
├── seed_data.py
├── requirements.txt
└── .env                    # DATABASE_URL
```

---

## 4. Constants (`constants.py`)

| Name | Values |
|---|---|
| Bureaus | `RB`, `PGRC`, `Approval Bureau`, `Academic Bureau` |
| Categories | Fee refund, Admission, Faculty, Infrastructure, Approval/Affiliation, Harassment, Certificates withheld, Other |
| Source channels | CSS portal, Email, Ministry/CPGRAMS, Post, Institute GRC, Court/RTI, Other |
| Statuses | `pending`, `under_process`, `transferred`, `escalated`, `disposed` |
| Open statuses | everything except `disposed` |
| Roles | `PGRC_OFFICER`, `RB_OFFICER`, `REGIONAL_OFFICE`, `SENIOR_MANAGEMENT`, `ADMIN` |
| SLA days | `30` |
| Match thresholds | auto-link ≥ 85 · needs confirmation 70–84 · new institution < 70 |

**States → regions** (small set for the prototype)
| Region | States |
|---|---|
| Western | Maharashtra, Gujarat, Goa |
| Northern | Delhi, Uttar Pradesh, Punjab, Haryana |
| Southern | Karnataka, Tamil Nadu, Telangana, Kerala |
| Eastern | West Bengal, Odisha, Bihar |
| Central | Madhya Pradesh, Chhattisgarh |

---

## 5. Database Tables (`models.py`)

### User
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| name | str | "R. Verma" |
| role | str | one of the 5 roles |
| bureau | str \| null | officers only |
| region | str \| null | regional office only |

### Institution
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| aicte_id | str unique | "1-12345"; generated `NEW-xxxx` style for unmatched new institutions |
| name | str | official name |
| normalized_name | str | cached result of `normalize()` for matching |
| address | str \| null | |
| city | str | |
| state | str | |
| region | str | derived from state |
| type | str \| null | "Private Engineering College" |

### InstitutionAlias
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| institution_id | FK → Institution | |
| alias | str | name as typed in a complaint, e.g. "Sunrise Engg Clg Nagpur" |
| unique (institution_id, alias) | | no repeats |

### Case
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| case_id | str unique | `AICTE-2026-000042` |
| institution_id | FK → Institution | |
| typed_institution_name | str | exactly what was entered |
| bureau | str | |
| category | str | |
| source_channel | str | |
| status | str | default `pending` |
| officer_id | FK → User | creator (officer) or first officer of bureau |
| complainant_name | str \| null | |
| description | text | |
| received_date | date | |
| deadline | date | `received_date + 30 days` (stored for easy filtering) |
| last_action_text | str \| null | |
| last_action_date | date \| null | |
| next_action | str \| null | |
| match_confidence | int \| null | 0–100 |
| needs_confirmation | bool | default false |
| created_at | datetime | |

### CaseAction (timeline)
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| case_id | FK → Case | |
| at | datetime | |
| type | str | `created`, `action`, `transfer`, `escalate`, `close`, `system` |
| text | str | "Notice sent to institution" |
| user_id | FK → User \| null | null for system events |
| bureau | str \| null | |
| remarks | str \| null | |

MVP: rows come from the seed script, plus `created` and `system` (overlap/duplicate detected) rows written by `POST /api/cases`.

### CaseLink (overlap / duplicate)
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| case_a_id | FK → Case | the newer case |
| case_b_id | FK → Case | the existing case |
| link_type | str | `overlap` or `duplicate` |
| reason | str | "same AICTE ID" / "name similarity 93% · same city" |
| needs_confirmation | bool | copied from the match |
| created_at | datetime | |

Links are read **in both directions** (a case's related cases = links where it is `case_a` or `case_b`).

---

## 6. Who Is Asking (`deps.py`)

- Every request sends headers `X-Role` and `X-User-Id` (from the role switcher).
- `get_current_user()` loads the User by id and checks the role matches; returns `CurrentUser(id, name, role, bureau, region)`.
- Missing/invalid headers → `401 {"detail": "Select a demo user"}`.
- No passwords – team prototype only.

---

## 7. Permissions (`services/permissions.py`)

All role rules live here so every router behaves the same.

| Function | Rule |
|---|---|
| `case_scope_filter(user)` | Officer → `Case.bureau == user.bureau` · Regional → `Institution.region == user.region` · Senior/Admin → no filter |
| `can_open_case(user, case)` | Senior/Admin → yes · Officer → case.bureau == user.bureau · Regional → institution.region == user.region |
| `can_create(user, bureau)` | Officer → only own bureau · Senior/Admin → any · Regional → no |
| `has_full_profile_access(user, bureau)` | Senior/Admin → all bureaus · Officer → own bureau only · Regional → none (key fields for every bureau in the MVP) |

**Institution Profile exception:** every role sees **all bureaus' cases** on a profile. Bureaus without full access return **key fields only** (no description) with `can_open: false`.

**Search exception:** institutions are returned to everyone (so anyone can reach any profile); cases are filtered by `case_scope_filter`.

---

## 8. Business Rules

### SLA (`services/sla.py`)
- `deadline = received_date + 30 days` (set when a case is created)
- **Overdue** = `deadline < today` AND status ≠ `disposed`
- **Due soon** = `today ≤ deadline ≤ today + 7` AND status ≠ `disposed`
- **Attention list** = overdue + due soon, sorted: most overdue first, then least days left
- "Today" = current date in **Asia/Kolkata**

### Case ID (`services/case_ids.py`)
- Format: `AICTE-{year}-{6-digit running number}` → `AICTE-2026-000042`
- One running number across all bureaus, per year
- Next number = highest existing number for that year + 1 (fine for a few users; no concurrency handling needed)

### Assignment
- Officer creates a complaint → assigned to **that officer**
- Senior/Admin creates for a bureau → assigned to the **first officer of that bureau** (lowest user id)

---

## 9. Institution Matching (`services/matching.py`)

### Step 1 – Normalise
```
"Sunrise Engg. Clg., Nagpur (Pvt Ltd)"
→ lowercase                    "sunrise engg. clg., nagpur (pvt ltd)"
→ remove punctuation           "sunrise engg clg nagpur pvt ltd"
→ expand abbreviations         "sunrise engineering college nagpur pvt ltd"
→ remove noise words           "sunrise engineering college nagpur"
→ remove city name             "sunrise engineering college"
→ collapse spaces
```

**Abbreviations**
| Short | Expanded |
|---|---|
| engg, engr, eng | engineering |
| clg, coll, col | college |
| inst, instt | institute |
| tech | technology |
| univ | university |
| poly | polytechnic |
| mgmt, mgt | management |
| sci | science |
| &, and | and |

**Noise words removed:** `pvt`, `ltd`, `private`, `limited`, `the`, `of`, `trust`, `society`

### Step 2 – Find the institution
1. **AICTE ID given** and exists → match, `method = "aicte_id"`, confidence 100, reason "same AICTE ID".
2. **Fuzzy name:**
   - Candidates = institutions in the **same city** (case-insensitive). If none, all institutions in the same state.
   - Compare normalised typed name with each candidate's `normalized_name` and each of its aliases using `rapidfuzz.fuzz.token_set_ratio`; take the best score per institution.
   - Same city adds the text "· same city" to the reason (no score change).
3. **Decide by best score:**
| Score | Result |
|---|---|
| ≥ 85 | Link, `method = "fuzzy_name"`, `needs_confirmation = false` |
| 70–84 | Link, `method = "fuzzy_name"`, `needs_confirmation = true` |
| < 70 | Create a **new Institution** from the typed name, city, state; `method = "new_institution"` |

4. Save the typed name as an **InstitutionAlias** (if different from the official name and not already saved).

### Output
```python
MatchResult(
  institution: Institution,
  method: "aicte_id" | "fuzzy_name" | "new_institution",
  confidence: int,          # 0–100
  needs_confirmation: bool,
  reason: str               # "name similarity 93% · same city"
)
```

### Examples (seed must make these work)
| Typed | City | Expected |
|---|---|---|
| Sunrise Engineering College | Nagpur | Sunrise Engineering College, ~100 |
| Sunrise Engg Clg Nagpur | Nagpur | Sunrise Engineering College, ≥ 85 |
| Sunrise College of Engg | Nagpur | Sunrise Engineering College, ≥ 85 |
| Sunrise Inst | Nagpur | 70–84 → needs confirmation (or new) |
| Moonlight Polytechnic | Nagpur | < 70 → new institution |

---

## 10. Overlap & Duplicate Detection (`services/overlap.py`)

Runs right after a new case is saved.

```
open_cases = cases on the same institution
             WHERE status != 'disposed' AND id != new_case.id

for each existing in open_cases:
    if existing.bureau != new_case.bureau → link_type = "overlap"
    else                                  → link_type = "duplicate"
    create CaseLink(new_case, existing, link_type, reason, needs_confirmation)

add a CaseAction(type="system") on the new case:
    "Overlap detected with AICTE-2026-000001" / "Possible duplicate of AICTE-2026-000017"
```

**Alerts returned to the frontend** (grouped by type):
| type | title |
|---|---|
| `overlap` | Potential Overlapping Cases – Coordination Required |
| `duplicate` | Possible Duplicate Complaint – Please Review |

Each related case in the alert includes `can_open` for the current user.
Empty list when nothing matches.

**Institution-level overlap (for profile banner):**
- Count open cases per bureau.
- ≥ 2 bureaus with open cases → `overlap`
- Else, one bureau with ≥ 2 open cases → `duplicate`
- Else → `null`

---

## 11. API Endpoints

All routes under `/api`. All require `X-Role` + `X-User-Id` except `/api/meta/*`.
Errors use FastAPI default `{"detail": "..."}` → `401` no demo user · `403` no access · `404` not found · `422` validation.

### 11.1 `GET /api/meta/options`
Returns bureaus, categories, source channels, states with regions (from `constants.py`).

### 11.2 `GET /api/meta/demo-users`
Returns all seeded users: `id, name, role, bureau, region`.

### 11.3 `GET /api/dashboard/kpis?from=&to=`
- Cases in user scope with `received_date` in range (no range = all time)
- Returns `total, pending, under_process, disposed, transferred, overdue`
- `overdue` uses the SLA rule (any status except disposed); escalated cases count in `total` only (and overdue if late)

### 11.4 `GET /api/dashboard/attention?from=&to=&limit=10`
- Overdue + due-soon cases in scope, sorted by urgency
- Each item: `case_id, institution{aicte_id,name}, bureau, category, officer, received_date, deadline, status`

### 11.5 `GET /api/cases`
Query params (all optional):
| Param | Meaning |
|---|---|
| `q` | case ID, AICTE ID or institution name (contains, case-insensitive) |
| `bureau`, `region`, `category`, `status` | exact match |
| `from`, `to` | received date range |
| `overdue=true` | only overdue |
| `attention=true` | overdue + due soon |
| `sort` | `case_id`, `received_date`, `deadline`, `status`, `bureau` (default `received_date`) |
| `order` | `asc` / `desc` (default `desc`) |
| `page`, `page_size` | default 1, 20 (max 100) |

Response: `{ items: [...], page, page_size, total }`
Each item adds `alert_type`: `"overlap"` if the case has any overlap link, else `"duplicate"` if any duplicate link, else `null`.

### 11.6 `POST /api/cases` – New complaint (core of the demo)
**Request**
| Field | Required | Validation |
|---|---|---|
| institution_name | ✅ | 3–200 chars |
| aicte_id | ❌ | |
| city | ✅ | |
| state | ✅ | must be in states list |
| bureau | ✅ | must be a bureau; officers must use own bureau |
| category | ✅ | must be in list |
| source_channel | ✅ | must be in list |
| received_date | ✅ | not in future |
| complainant_name | ❌ | |
| description | ✅ | ≥ 20 chars |

**Steps**
1. `can_create(user, bureau)` else `403`
2. `match_institution(...)` → MatchResult (+ save alias)
3. Generate `case_id`, set `deadline`, assign officer, status `pending`
4. Save case + `CaseAction(type="created")`
5. `detect_links(new_case)` → CaseLinks + system CaseAction + alerts
6. Commit, return `201`

**Response**
```json
{
  "case": { "case_id": "AICTE-2026-000251", "status": "pending", "deadline": "2026-11-24", "bureau": "RB", "officer": "R. Verma" },
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
        { "case_id": "AICTE-2026-000001", "bureau": "PGRC", "category": "Fee refund", "status": "under_process", "officer": "A. Sharma", "can_open": false }
      ]
    }
  ]
}
```

### 11.7 `GET /api/cases/{case_id}`
- `404` if not found · `403` if `can_open_case` is false
- Returns: case fields, institution, officer, timeline (CaseAction, oldest → newest), related cases (both link directions) with `link_type, reason, needs_confirmation, can_open`
- `permissions`: MVP returns `{ "can_act": false, "can_escalate": false, "can_export": false, "can_view_history": false }` (features come later; frontend hides buttons)

### 11.8 `GET /api/institutions/{aicte_id}` – Institution Profile
- Everyone can open any profile
- Returns:
  - `institution` (identity + aliases)
  - `summary` – total, open, disposed, overdue, bureaus_involved
  - `overlap` – banner object or `null` (rule in §10)
  - `bureaus` – one group per bureau with `bureau, total, open, full_access, cases[]`
- **Ordering:** bureaus with open cases first; inside a bureau, open cases first (most urgent deadline on top), then disposed (newest first)
- **Key-field rows** (`full_access: false`): `case_id, category, status, officer, received_date, deadline, can_open:false` – **never** description
- `404` if AICTE ID not found

### 11.9 `GET /api/search?q=`
- `q` shorter than 2 chars → empty result
- **Cases** (in user scope): `case_id` contains `q`, or institution name/alias contains `q` → top 5
- **Institutions** (all): AICTE ID contains `q`, or fuzzy score (`token_set_ratio` on normalised names + aliases) ≥ 60 → top 5 by score
- Response: `{ "cases": [...], "institutions": [{ aicte_id, name, city, score }] }`

---

## 12. Seed Data (`seed_data.py`) – Small

Drops and recreates all tables, then inserts:

### Users (7)
| id | Name | Role | Bureau / Region |
|---|---|---|---|
| 1 | A. Sharma | PGRC_OFFICER | PGRC |
| 2 | M. Iyer | PGRC_OFFICER | PGRC |
| 3 | R. Verma | RB_OFFICER | RB |
| 4 | S. Khan | RB_OFFICER | RB |
| 5 | K. Nair | REGIONAL_OFFICE | Western |
| 6 | Dr. P. Rao | SENIOR_MANAGEMENT | – |
| 7 | Admin | ADMIN | – |

> MVP simplification: only RB and PGRC have officers. Cases in Approval/Academic Bureau are assigned to Admin (id 7), so Senior/Admin still see them.

### Institutions (10)
Across Western, Northern, Southern regions, e.g.:
| AICTE ID | Name | City | State |
|---|---|---|---|
| 1-12345 | Sunrise Engineering College | Nagpur | Maharashtra |
| 1-20481 | ABC Institute of Technology | Pune | Maharashtra |
| 1-30872 | Greenfield Polytechnic | Ahmedabad | Gujarat |
| 1-41290 | National College of Engineering | Delhi | Delhi |
| 1-52011 | Lakeview Institute of Management | Lucknow | Uttar Pradesh |
| 1-63345 | Deccan College of Engineering | Hyderabad | Telangana |
| 1-74102 | Coastal Institute of Technology | Mangaluru | Karnataka |
| 1-85267 | Vidya Pharmacy College | Chennai | Tamil Nadu |
| 1-96530 | Shivaji Polytechnic | Nashik | Maharashtra |
| 1-10778 | Eastern Institute of Science | Bhubaneswar | Odisha |

### Cases (~40)
- Mix of bureaus (mostly RB and PGRC), categories, statuses
- `received_date` spread over the last ~6 months so the dashboard shows:
  - several **overdue** (received 35–120 days ago, not disposed)
  - several **due soon** (received 23–29 days ago)
  - some **disposed**, a couple **transferred**, one **escalated**
- `typed_institution_name` uses **variations** for some cases ("ABC Inst of Tech", "Sunrise College of Engg") + matching aliases saved
- 2–4 timeline actions per case (created → notice sent → reply received → disposed …)

### Planted scenarios
| Scenario | Data |
|---|---|
| **Overlap 1** | ABC Institute of Technology: open PGRC (Fee refund) + open RB (Faculty) |
| **Overlap 2** | Deccan College: open RB (Approval/Affiliation) + open Academic Bureau (Admission) |
| **Overlap 3** | Greenfield Polytechnic: open PGRC + open RB, one overdue |
| **Duplicate 1** | Lakeview Institute: two open PGRC "Fee refund" cases |
| **Duplicate 2** | Shivaji Polytechnic: two open RB "Infrastructure" cases |
| **Live demo target** | **Sunrise Engineering College:** only **disposed** cases in seed (so the profile has history but **no** open overlap until the demo) |

CaseLinks for overlap/duplicate scenarios are created by running the same `detect_links()` logic after inserting cases (so seed and live behave identically).

### Run
```bash
python seed_data.py      # wipes and refills the database – rerun before every demo
```

---

## 13. Demo Flow (backend view)
1. `python seed_data.py`
2. PGRC Officer → `POST /api/cases` "Sunrise Engineering College", Nagpur, Fee refund → `alerts: []`
3. RB Officer → `POST /api/cases` "Sunrise Engg Clg Nagpur", Infrastructure → match 1-12345 (≥ 85) → **overlap alert** with the PGRC case (`can_open: false`)
4. `GET /api/institutions/1-12345` as RB Officer → overlap banner, RB full, PGRC key fields only
5. Same call as Senior Management → all bureaus full access
6. (Optional) RB Officer posts another Sunrise complaint → **duplicate alert** (+ overlap with PGRC)

All of this can be tested at `http://localhost:8000/docs` before the frontend exists – set the `X-Role` / `X-User-Id` headers in Swagger (add them as parameters via the `get_current_user` dependency).

---

## 14. Local Setup

```bash
# 1. PostgreSQL running, database created
#    CREATE DATABASE aicte_dashboard;

# 2. backend/.env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/aicte_dashboard

# 3. install + seed + run
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload        # http://localhost:8000/docs
```

Note the `postgresql+psycopg://` prefix – it tells SQLModel to use psycopg v3.

---

## 15. Testing Checklist

**Matching**
- [ ] Exact AICTE ID → confidence 100
- [ ] "Sunrise Engg Clg Nagpur" → Sunrise Engineering College, ≥ 85
- [ ] Medium score → `needs_confirmation: true`
- [ ] Unknown name → new institution created with generated AICTE ID
- [ ] Typed name saved as alias (no duplicates)

**Overlap / duplicate**
- [ ] Different bureau open case → `overlap` alert + CaseLink + system timeline entry
- [ ] Same bureau open case → `duplicate`
- [ ] Disposed cases never trigger alerts
- [ ] Both types in one response when both apply

**Permissions**
- [ ] RB officer: cases list/dashboard show only RB
- [ ] RB officer opening a PGRC case → 403
- [ ] RB officer on a profile → PGRC group `full_access: false`, no description
- [ ] Senior/Admin → everything full
- [ ] Regional office → only own region in lists; cannot create (403)
- [ ] Officer creating for another bureau → 403

**Dashboard / lists**
- [ ] KPI counts match the seed
- [ ] Attention list sorted by urgency
- [ ] Filters, sort, pagination work; `alert_type` correct

**Search**
- [ ] "sunrise engg" finds Sunrise Engineering College
- [ ] AICTE ID search works
- [ ] Officer only sees own-bureau cases but all institutions

---

## 16. Build Order

1. **Setup** – venv, requirements, `.env`, `database.py`, `main.py` with `/api` prefix, health route
2. **Models + constants** – tables created on startup
3. **deps.py + permissions.py**
4. **Seed script (basic)** – users, institutions, cases without links
5. **Meta + Dashboard endpoints**
6. **Cases list**
7. **matching.py** – test with the examples table
8. **overlap.py + POST /api/cases**
9. **Seed planted scenarios** using `detect_links()`
10. **Case detail**
11. **Institution Profile**
12. **Search**
13. **Run testing checklist + demo flow in `/docs`**, then connect the frontend

---

## 17. Later (after MVP)
- Case actions: add action, transfer, escalate, close
- Notification bell (stored Alert table, unresolved count)
- PDF export with ReportLab
- Audit log + History tab (old → new values, views)
- Institutions list, Alerts page, Reports
- "Mark as not related" for links; officer confirmation of medium matches
- Vercel + Neon deployment (`DATABASE_URL` swap, pooled connection, FastAPI entrypoint)

---

## 18. Decisions

### Settled
- ✅ FastAPI + SQLModel + PostgreSQL (local first), RapidFuzz
- ✅ Case ID: `AICTE-2026-000042` (one running number per year)
- ✅ Assignment: officer who created it; Senior/Admin → first officer of that bureau
- ✅ Seed data: small (~10 institutions, ~40 cases), Sunrise kept free for the live demo
- ✅ Deadline: 30 days; overdue/due-soon computed on request
- ✅ MVP features: dashboard, cases list, new complaint + matching + overlap/duplicate, case detail, institution profile, global search
- ✅ Audit log, History tab, PDF, bell, case actions → later

### Still open
- [ ] Timeline order in case detail (backend returns oldest → newest; frontend can reverse)
