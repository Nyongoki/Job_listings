# Homeland Jobs — Day 2 Agent Brief
**Interview: HomelandHub.org | July 2026 | K2B1 / K2F1**

---

## OVERVIEW

You are building two things in parallel:

1. **DAY 2A (Q11–Q15)** — A React frontend: Job Listings page with filters, modal, error states, sorting, and a clean codebase.
2. **DAY 2B (Q16–Q20)** — A Node.js/Express backend: Auth system, Jobs API, Escrow simulation, tests, and documentation.

Both must be in the **same GitHub repository** with a well-written `README.md`.

Treat this as a real junior developer submission. Code must be clean, commented, and functional. AI tool usage must be declared in the README.

---

## REPOSITORY STRUCTURE

Set up the repo like this before writing any code:

```
homeland-jobs/
├── client/          ← React frontend (Vite + React)
├── server/          ← Node.js/Express backend
├── README.md        ← Root readme covering both
└── .env.example     ← Template for all env vars needed
```

---

## PART A — FRONTEND (Q11–Q15)

### Q11 — Written Component Architecture Plan [6 marks]

Before writing any frontend code, produce a written component tree. This will also serve as the `ARCHITECTURE.md` file in the `client/` folder.

**Document the following components and for each one state:**
- What props it receives
- What state it manages (if any)
- Its parent and children

**Required components (minimum):**

```
<App>
  └── <Header />
  └── <JobsPage>
        ├── <SearchBar />
        ├── <FilterPanel>
        │     ├── <CategoryFilter />
        │     ├── <LocationFilter />
        │     └── <BudgetRangeFilter />
        ├── <ResultsCount />
        ├── <SortDropdown />
        ├── <JobGrid>
        │     ├── <JobCardSkeleton />  ← shown during loading
        │     └── <JobCard />
        ├── <EmptyState />
        └── <JobDetailModal>
              └── <ProposalForm />
```

Write this tree into `client/ARCHITECTURE.md` with a one-paragraph description of each component covering props, state, and relationships. This document must exist in the repo — it is assessed separately.

---

### Q12 — Job Listings Page [14 marks]

**Stack:** React (Vite). No Next.js required. Use Tailwind CSS for all styling — zero inline styles.

#### Mock Data

Create `client/src/data/jobs.js` with **at least 10 job objects**. Each job must have:

```js
{
  id: 1,
  title: "Senior React Developer",
  employer: "TechCorp Kenya",
  employerRating: 4.5,
  budget: 85000,           // in KES
  location: "Nairobi",
  category: "Web Development",
  skills: ["React", "TypeScript", "Node.js"],
  postedDate: "2026-07-08",
  proposalCount: 7,
  description: "Full job description text here — at least 3 sentences.",
  deadline: "2026-08-01"
}
```

Use varied categories (Web Development, Design, Writing, Marketing, Data, Mobile Dev), varied locations (Nairobi, Mombasa, Kisumu, Remote), and a realistic budget spread from KES 5,000 to KES 200,000.

#### Features Required

**Header (sticky):**
- Logo text "HomelandJobs" on the left
- Nav links: Home, Jobs, Post a Job, Sign In — right aligned
- Must stay fixed at top on scroll (`position: sticky; top: 0`)
- Give it a white background with a subtle box-shadow so content scrolls beneath it

**Search + Filters (all real-time, no submit button needed):**
- Text search: filters by job `title` and `description` (case-insensitive)
- Category dropdown: populated from unique categories in the mock data
- Location dropdown: populated from unique locations in the mock data
- Budget range: two number inputs — Min KES and Max KES. A job shows if its budget falls within the range (treat empty fields as no limit)

**Results count:** `Showing 6 of 10 jobs` — updates live as filters change

**Sort dropdown:** Three options — Newest (by `postedDate` desc), Budget High–Low, Budget Low–High. Sorting applies to the already-filtered set.

**Job Cards:**
Each card must show:
- Job title (bold)
- Employer name
- Budget (formatted as `KES 85,000`)
- Location
- Skills as pill/tag elements
- Posted date (formatted as `8 Jul 2026`)
- Proposal count (`7 proposals`)
- An `Apply` button — clicking this opens the Job Detail Modal

**Loading skeleton:**
- On first load, simulate a 1.5 second delay with `setTimeout` before setting jobs data
- During this delay show 6 skeleton card placeholders (grey animated pulse blocks)
- Use a `isLoading` state variable to toggle between skeletons and real cards

**Empty state:**
- When no jobs match the active filters, show a centred message:
  - An icon (a simple SVG or emoji is fine)
  - Heading: `No jobs found`
  - Subtext: `Try adjusting your filters or search term`
  - A `Clear Filters` button that resets everything

**Responsive grid:**
```css
/* Desktop: 3 columns */
/* Tablet (≤ 768px): 2 columns */
/* Mobile (≤ 480px): 1 column */
```
Use Tailwind responsive prefixes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

---

### Q13 — Job Detail Modal + Proposal Form [14 marks]

**Triggered by:** clicking any job card's Apply button.

#### Modal Behaviour
- Opens and renders the selected job's full details
- Closes when: Escape key is pressed, or the user clicks the backdrop (outside the modal box)
- Trap focus inside the modal while it is open (tab should cycle through modal elements only)
- Add `role="dialog"` and `aria-modal="true"` for accessibility
- Animate open/close with a simple CSS transition (fade + slight scale)

#### Modal Content (left panel or top section)
Display:
- Full job title
- Employer name + star rating (e.g. ⭐ 4.5)
- Full description
- Skills tags
- Budget: `KES 85,000`
- Deadline formatted as a readable date

#### Proposal Submission Form (right panel or bottom section)

All inputs must have visible `<label>` elements — not just placeholders.

| Field | Type | Validation |
|---|---|---|
| Cover Letter | `<textarea>` | Required. Min 100 characters. Show char count `142 / 100`. |
| Proposed Budget (KES) | `<input type="number">` | Required. Must be > 0. |
| Timeline (days) | `<input type="number">` | Required. Must be between 1 and 365. |
| Portfolio URL | `<input type="url">` | Optional. If provided, must be a valid URL. |

**Validation rules:**
- Validate on submit only (not on every keystroke)
- Show errors inline below each field in red text — no `alert()` or `window.confirm()`
- Do not clear the form on validation failure — preserve what the user typed

**Success state:**
- After passing validation, replace the form with a confirmation message:
  - A green checkmark icon
  - `Proposal submitted successfully!`
  - `We'll notify you when the employer responds.`
  - A `Close` button
- No real API call needed — just `setTimeout(resolve, 800)` to simulate async

**Keyboard navigation:**
- Tab order: Cover Letter → Proposed Budget → Timeline → Portfolio URL → Submit
- Submit button must be reachable and activatable via Enter/Space

---

### Q14 — Error State + Sorting [10 marks]

#### (a) Error State

In `client/src/hooks/useJobs.js` (or wherever you fetch/load data), add an error simulation mode:

- Add a boolean constant `SIMULATE_ERROR = false` at the top of the file
- When `SIMULATE_ERROR = true`, instead of loading jobs, throw an error after the 1.5s delay
- The UI must catch this and show:
  - An error icon (⚠️ or SVG)
  - Heading: `Something went wrong`
  - Subtext: `We couldn't load the job listings. Please try again.`
  - A `Retry` button that re-runs the load (resets state and tries again)
- This must work without a blank page or unhandled JS error in the console

The assessor will flip `SIMULATE_ERROR = true` to test this. Make sure it works.

#### (b) Sorting

The sort dropdown from Q12 must sort the **filtered** result set, not the original data.

Logic order must be:
1. Filter by search text
2. Filter by category
3. Filter by location
4. Filter by budget range
5. Sort the result of steps 1–4

Sorting options:
- `newest` → sort by `postedDate` descending
- `budget_high` → sort by `budget` descending
- `budget_low` → sort by `budget` ascending

The sort must reapply whenever filters change — not just when the sort dropdown changes.

---

### Q15 — Code Quality Refactor [6 marks]

After the build is complete, do a pass across all components and verify:

**Semantic HTML:**
- Job cards use `<article>` not `<div>`
- Page sections use `<section>` with an `aria-label`
- Header uses `<header>`, footer (if any) uses `<footer>`
- Dates use `<time datetime="2026-07-08">8 Jul 2026</time>`
- Employer contact info (if shown) uses `<address>`

**No inline styles:**
- Search for `style={{` across the entire `client/src` folder — it must return zero results
- All styling via Tailwind classes or CSS Modules

**Image alt text:**
- Any `<img>` tag must have meaningful `alt` text
- `alt=""` is only acceptable for purely decorative images

**Comments:**
- Add at least 5 comments across the codebase explaining *why* something is done, not what
- Example of a good comment: `// Debounce the search to avoid filtering on every keystroke — improves performance on large lists`
- Example of a bad comment: `// filter jobs` above a filter function

**README (client section):**
Must include:
- Setup steps (`npm install`, `npm run dev`)
- Features list
- AI tools used and how (be honest)
- Known limitations or incomplete items

---

## PART B — BACKEND (Q16–Q20)

### Q16 — Written API Plan [6 marks]

Before writing backend code, produce a written plan. Save it as `server/API_PLAN.md`.

**Folder structure to document and implement:**

```
server/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── jobs.controller.js
│   │   └── contracts.controller.js
│   ├── middleware/
│   │   ├── requireRole.js
│   │   └── validate.js
│   ├── models/          ← Sequelize or Prisma models (or raw SQLite queries)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── jobs.routes.js
│   │   └── contracts.routes.js
│   ├── utils/
│   │   └── autoRelease.js
│   └── app.js
├── tests/
│   └── auth.test.js
├── .env.example
├── API_PLAN.md
└── package.json
```

In `API_PLAN.md`, document every endpoint in a table like this:

| Method | Path | Auth Required | Role | Description |
|--------|------|--------------|------|-------------|
| POST | /api/auth/register | No | Any | Register new user |
| POST | /api/auth/login | No | Any | Login, returns JWT |
| POST | /api/auth/refresh | No | Any | Refresh access token |
| GET | /api/auth/me | Yes | Any | Get current user |
| GET | /api/jobs | No | Any | List jobs with filters + pagination |
| POST | /api/jobs | Yes | employer | Create job |
| GET | /api/jobs/:id | No | Any | Get single job + proposal count |
| POST | /api/jobs/:id/proposals | Yes | freelancer | Submit proposal |
| PUT | /api/jobs/:id/proposals/:proposalId/accept | Yes | employer | Accept proposal, create contract |
| POST | /api/contracts/:id/fund | Yes | employer | Fund escrow |
| POST | /api/contracts/:id/deliver | Yes | freelancer | Mark delivered |
| POST | /api/contracts/:id/approve | Yes | employer | Approve + release payment |
| POST | /api/contracts/:id/dispute | Yes | employer or freelancer | Raise dispute |

---

### Q17 — Authentication API [14 marks]

**Stack:** Node.js, Express, SQLite (via `better-sqlite3` — easiest for no-config setup), `bcrypt`, `jsonwebtoken`, `express-validator`.

#### Database Setup

Use SQLite. Create tables in a `db/init.js` file that runs on server start:

```sql
CREATE TABLE IF NOT EXISTS users (
  user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('freelancer', 'employer', 'admin')),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(user_id),
  token      TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### POST /api/auth/register

**Validation (field-level errors):**
- `name`: required, min 2 chars
- `email`: required, valid email format
- `phone`: required, must match `/^(07\d{8}|254\d{9})$/`
- `password`: required, min 8 chars, at least 1 uppercase letter, at least 1 number
- `role`: required, must be `freelancer` or `employer`

**On success:**
- Hash password with `bcrypt.hash(password, 12)`
- Insert user into DB
- Return `201` with:
```json
{
  "message": "Registration successful",
  "user": {
    "user_id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "0712345678",
    "role": "freelancer",
    "created_at": "2026-07-14T10:00:00.000Z"
  }
}
```
- **Never include `password_hash` in any response.**

**On failure (validation errors):**
```json
{
  "errors": {
    "email": "Must be a valid email address",
    "password": "Must be at least 8 characters with 1 uppercase and 1 number"
  }
}
```

**On duplicate email:** return `409` with `{ "error": "An account with this email already exists" }`

#### POST /api/auth/login

- Look up user by email
- Compare password with `bcrypt.compare()`
- On wrong password: return `401` with `{ "error": "Invalid email or password" }` (same message for both cases — don't reveal which was wrong)
- On success:
  - Generate access token: `jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' })`
  - Generate refresh token: `jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })` — store in `refresh_tokens` table
  - Return `200`:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "user_id": 1, "name": "Jane Doe", "role": "freelancer" }
}
```

#### POST /api/auth/refresh

- Accept `{ "refreshToken": "eyJ..." }` in request body
- Verify against `REFRESH_SECRET`
- Check it exists in the `refresh_tokens` table (not expired, not revoked)
- Return a new access token (1hr expiry)
- Return `401` if token is missing, invalid, or not found in DB

#### GET /api/auth/me

- Protected: requires valid Bearer token in Authorization header
- Use the `requireRole` middleware (any role)
- Look up the user by `userId` from the decoded JWT
- Return the user object without `password_hash`

---

### Q18 — Jobs API [14 marks]

Add these tables to your DB init:

```sql
CREATE TABLE IF NOT EXISTS jobs (
  job_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  employer_id   INTEGER NOT NULL REFERENCES users(user_id),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  location      TEXT NOT NULL,
  budget        REAL NOT NULL CHECK(budget > 0),
  skills        TEXT NOT NULL,   -- store as JSON string, parse on read
  status        TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','closed')),
  deadline      DATE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposals (
  proposal_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id         INTEGER NOT NULL REFERENCES jobs(job_id),
  freelancer_id  INTEGER NOT NULL REFERENCES users(user_id),
  cover_letter   TEXT NOT NULL,
  proposed_budget REAL NOT NULL CHECK(proposed_budget > 0),
  timeline_days  INTEGER NOT NULL CHECK(timeline_days BETWEEN 1 AND 365),
  portfolio_url  TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
  submitted_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, freelancer_id)   -- one proposal per freelancer per job
);

CREATE TABLE IF NOT EXISTS contracts (
  contract_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_id      INTEGER NOT NULL UNIQUE REFERENCES proposals(proposal_id),
  job_id           INTEGER NOT NULL REFERENCES jobs(job_id),
  employer_id      INTEGER NOT NULL REFERENCES users(user_id),
  freelancer_id    INTEGER NOT NULL REFERENCES users(user_id),
  agreed_budget    REAL NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending','funded','delivered','released','disputed')),
  checkout_request_id TEXT,
  funded_at        DATETIME,
  delivered_at     DATETIME,
  released_at      DATETIME,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id      INTEGER NOT NULL REFERENCES contracts(contract_id),
  recipient_id     INTEGER NOT NULL REFERENCES users(user_id),
  amount           REAL NOT NULL CHECK(amount > 0),
  type             TEXT NOT NULL CHECK(type IN ('freelancer_payout','platform_fee')),
  mpesa_receipt    TEXT UNIQUE,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### GET /api/jobs

Supports all query params, all optional:
- `search` — case-insensitive match on title or description (`LIKE %term%`)
- `category` — exact match
- `location` — exact match
- `budget_min`, `budget_max` — inclusive range
- `sort` — `newest` (default) | `budget_high` | `budget_low`
- `page` (default 1), `limit` (default 10, max 50)

Response:
```json
{
  "jobs": [...],
  "total": 47,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

Each job in the array must include a `proposal_count` field (computed via a subquery or join).

#### POST /api/jobs

- Auth: employer only
- Required fields: `title`, `description`, `category`, `location`, `budget`, `skills` (array), `deadline`
- `skills` array stored as `JSON.stringify(skills)` in the DB, parsed back on read
- Return `201` with the created job

#### GET /api/jobs/:id

- Public (no auth required)
- Return full job object + `proposal_count`
- Return `404` if job not found

#### POST /api/jobs/:id/proposals

- Auth: freelancer only
- Required: `cover_letter` (min 50 chars), `proposed_budget` (> 0), `timeline_days` (1–365)
- Optional: `portfolio_url`
- If the freelancer already submitted a proposal for this job, return `409 { "error": "You have already submitted a proposal for this job" }`
- Return `201` with the created proposal

#### PUT /api/jobs/:id/proposals/:proposalId/accept

- Auth: employer only
- Verify the employer owns the job (check `jobs.employer_id === req.user.userId`) — return `403` if not
- In a single transaction:
  1. Set the target proposal status to `accepted`
  2. Set all other proposals for this job to `rejected`
  3. Set the job status to `in_progress`
  4. Create a `contracts` record:
     - `proposal_id`, `job_id`, `employer_id`, `freelancer_id` (from proposal), `agreed_budget` (from proposal's `proposed_budget`)
     - `status: 'pending'`
- Return `200` with the created contract

---

### Q19 — Escrow Simulation API [10 marks]

All routes are under `/api/contracts/:id/`.

#### POST /api/contracts/:id/fund

- Auth: employer only
- Verify `employer_id` on the contract matches `req.user.userId` — return `403` if not
- Verify contract status is `pending` — return `400` if already funded
- Update contract:
  - `status` → `funded`
  - `funded_at` → current timestamp
  - `checkout_request_id` → generate a mock receipt: `` `MOCK-${Date.now()}` ``
- Return `200`:
```json
{
  "message": "Escrow funded successfully",
  "mockReceipt": "MOCK-1720953600000",
  "contract": { ...updated contract }
}
```

#### POST /api/contracts/:id/deliver

- Auth: freelancer only
- Verify `freelancer_id` on the contract matches `req.user.userId`
- Verify status is `funded` — return `400` otherwise
- Update: `status` → `delivered`, `delivered_at` → now
- Return `200` with updated contract

#### POST /api/contracts/:id/approve

- Auth: employer only
- Verify ownership and status is `delivered`
- Calculate:
  - `freelancerPayout = agreed_budget * 0.92`
  - `platformFee = agreed_budget * 0.08`
- In a transaction:
  1. Insert two rows into `payments`:
     - `{ contract_id, recipient_id: freelancer_id, amount: freelancerPayout, type: 'freelancer_payout', mpesa_receipt: 'MOCK-PAY-' + Date.now() }`
     - `{ contract_id, recipient_id: platform_admin_id (use user_id 1 or hardcode), amount: platformFee, type: 'platform_fee' }`
  2. Update contract: `status` → `released`, `released_at` → now
- Return `200` with payment breakdown

#### POST /api/contracts/:id/dispute

- Auth: either party (employer or freelancer on the contract)
- Required: `reason` (min 20 chars)
- Update: `status` → `disputed`
- Return `200`

#### autoReleaseEscrow() utility

Create `server/src/utils/autoRelease.js`:

```js
// This function is meant to be called by a cron job (not implemented here)
// It auto-approves escrow for contracts delivered more than 3 days ago
// where the employer has not acted, to protect freelancers from being ghosted.
async function autoReleaseEscrow() {
  // Find all contracts where:
  //   status = 'delivered'
  //   AND delivered_at <= now - 3 days
  // For each one, call the same approve logic used in POST /approve
  // Return a summary: { released: N, failed: [...] }
}
```

Implement the function fully. It does not need a route or a cron schedule — just the function, exported and working.

---

### Q20 — Tests + Documentation [6 marks]

#### Automated Tests (`server/tests/auth.test.js`)

Use **Jest + Supertest**. Install: `npm install --save-dev jest supertest`.

Write exactly these three tests:

```js
// Test 1: Successful registration returns 201 with correct shape
// - POST /api/auth/register with valid body
// - Assert: status 201
// - Assert: response body has user.email matching input
// - Assert: response body does NOT have password_hash anywhere

// Test 2: Login with wrong password returns 401
// - First register a user, then try logging in with wrong password
// - Assert: status 401
// - Assert: response body has { error: "Invalid email or password" }

// Test 3: Freelancer cannot POST a job (returns 403)
// - Register a freelancer, log in, get token
// - POST /api/jobs with a valid job body and the freelancer's token
// - Assert: status 403
```

Add to `package.json`:
```json
"scripts": {
  "test": "jest --testEnvironment=node"
}
```

#### Postman Collection

Export a Postman collection JSON file as `server/homeland-jobs.postman_collection.json`.

It must include one request per endpoint, with:
- Correct method and URL (use `{{base_url}}` variable)
- Authorization header set up (Bearer `{{access_token}}`)
- Example request body for POST/PUT routes
- Brief description on each request explaining what it does

#### README.md (server section)

Document every endpoint in this format:

```
### POST /api/auth/register

**Auth required:** No  
**Role:** Any

**Request body:**
{ "name": "...", "email": "...", "phone": "07XX...", "password": "...", "role": "freelancer" }

**Success response (201):**
{ "message": "Registration successful", "user": { ... } }

**Error responses:**
- 400: Validation errors with field-level messages
- 409: Email already registered
```

Repeat for all 13 endpoints.

---

## ENVIRONMENT VARIABLES

Create `.env.example` at the root:

```
# Server
PORT=3001
JWT_SECRET=your_jwt_secret_here_min_32_chars
REFRESH_SECRET=your_refresh_secret_here_min_32_chars
DB_PATH=./db/homeland.sqlite

# Client
VITE_API_URL=http://localhost:3001
```

---

## SCORING SUMMARY

| Q | Marks | Deliverable |
|---|-------|-------------|
| Q11 | 6 | `client/ARCHITECTURE.md` component tree |
| Q12 | 14 | Fully working React listings page |
| Q13 | 14 | Modal + proposal form with validation |
| Q14 | 10 | Error state + correct sort logic |
| Q15 | 6 | Semantic HTML, no inline styles, comments, README |
| Q16 | 6 | `server/API_PLAN.md` endpoint table |
| Q17 | 14 | Auth routes, bcrypt, JWT, refresh tokens |
| Q18 | 14 | Jobs CRUD + proposals + accept flow |
| Q19 | 10 | Escrow fund/deliver/approve/dispute + autoRelease |
| Q20 | 6 | 3 Jest tests + Postman collection + endpoint docs |
| **Total** | **100** | |

---

## SUBMISSION CHECKLIST

Before submitting, verify:

- [ ] `client/` runs with `npm install && npm run dev` without errors
- [ ] `server/` runs with `npm install && node src/app.js` without errors
- [ ] `server/` tests pass with `npm test`
- [ ] `SIMULATE_ERROR = true` in `useJobs.js` shows the error UI correctly
- [ ] All 10+ job cards render, filters work, sort works, modal opens/closes
- [ ] All 13 API endpoints return correct status codes
- [ ] Postman collection is exported and in the repo
- [ ] `.env.example` is present, `.env` is in `.gitignore`
- [ ] `README.md` covers setup, features, AI tools used, known limitations
- [ ] `client/ARCHITECTURE.md` exists
- [ ] `server/API_PLAN.md` exists

---

## NOTES FOR THE AGENT

- Use `better-sqlite3` for the database — it is synchronous and requires no setup beyond `npm install`. All queries are simple and can be written as raw SQL strings. No ORM needed.
- For the frontend, use Vite with the React template: `npm create vite@latest client -- --template react`. Then install Tailwind following the Vite guide.
- Do not use `create-react-app` — it is deprecated.
- The mock data for the frontend and the real SQLite DB for the backend are separate. The frontend uses local JSON; the backend uses a real DB.
- Declare all AI tool usage honestly in the README. The assessors expect it — hiding it is worse than admitting it.
- Write the three automated tests *before* finalising the routes so you catch any breaking changes.
- `autoReleaseEscrow()` is a standalone function — there is no route for it, no cron job. Just export the function and make sure it works if called manually.
