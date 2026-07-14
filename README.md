# Homeland Jobs — Full Stack Platform

A full-stack freelancer platform featuring a React + Vite frontend and a Node.js + Express + SQLite API backend. The project facilitates user authorization, job search & listing (with live filters and sorting), and secure contract escrow simulation.

## Repository Structure

```
homeland-jobs/
├── client/          ← React frontend (Vite + React)
├── server/          ← Node.js/Express backend
├── README.md        ← Root readme covering both
└── .env.example     ← Template for all env vars needed
```

---

## Part A: React Frontend

Detailed component design is documented in [client/ARCHITECTURE.md](file:///c:/Users/USER/Desktop/Alarms/Homeland/client/ARCHITECTURE.md).

### Features
- **Sticky Header:** Top-docked navigation bar with subtle overlay shadow.
- **Search & Filters:** Real-time text search (case-insensitive for title and description), dynamic Category/Location dropdowns, and Min/Max budget numeric limits.
- **Sorted Matches:** Pipeline that filters first, then sorts by Newest, Budget High–Low, and Budget Low–High.
- **Pulsing Skeletons:** Animated pulsing skeletons display during a simulated 1.5-second load time.
- **Accessible Detail Modal:** Accessible dialog box (`role="dialog"`, `aria-modal="true"`) supporting backdrop-clicks, Escape key closing, and tabbed focus trapping.
- **Validation Form:** Validates Cover Letter character lengths (min 100 characters), timelines (1-365 days), proposed budget, and portfolio URLs.

### Client Setup
```bash
cd client
npm install
npm run dev
```

---

## Part B: Node.js/Express Backend

The complete controller/routing structure is documented in [server/API_PLAN.md](file:///c:/Users/USER/Desktop/Alarms/Homeland/server/API_PLAN.md).

### Tech Stack
- Express.js, SQLite (`better-sqlite3`), `bcrypt` hashing, JWT access/refresh token pairs, and `express-validator` schema constraints.

### Server Setup
```bash
cd server
npm install
npm start
```
To run Jest + Supertest suites:
```bash
npm test
```

---

## API Endpoints Documentation

### POST /api/auth/register
**Auth required:** No  
**Role:** Any  
**Request body:**
```json
{ 
  "name": "Jane Doe", 
  "email": "jane@example.com", 
  "phone": "0712345678", 
  "password": "Password123", 
  "role": "freelancer" 
}
```
**Success response (201):**
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
**Error responses:**
- `400`: Validation errors (e.g. invalid phone format, short password).
- `409`: Email address already registered.

---

### POST /api/auth/login
**Auth required:** No  
**Role:** Any  
**Request body:**
```json
{ 
  "email": "jane@example.com", 
  "password": "Password123" 
}
```
**Success response (200):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "user_id": 1, "name": "Jane Doe", "role": "freelancer" }
}
```
**Error responses:**
- `401`: Invalid email or password (same message for both).

---

### POST /api/auth/refresh
**Auth required:** No  
**Role:** Any  
**Request body:**
```json
{ 
  "refreshToken": "eyJ..." 
}
```
**Success response (200):**
```json
{
  "accessToken": "eyJ..."
}
```
**Error responses:**
- `401`: Refresh token missing, invalid, or expired.

---

### GET /api/auth/me
**Auth required:** Yes  
**Role:** Any  
**Headers:** `Authorization: Bearer <accessToken>`  
**Success response (200):**
```json
{
  "user_id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0712345678",
  "role": "freelancer",
  "created_at": "2026-07-14T10:00:00.000Z"
}
```
**Error responses:**
- `401`: Authorization token missing or expired.

---

### GET /api/jobs
**Auth required:** No  
**Role:** Any  
**Query Parameters:** `search`, `category`, `location`, `budget_min`, `budget_max`, `sort`, `page`, `limit`  
**Success response (200):**
```json
{
  "jobs": [
    {
      "job_id": 1,
      "employer_id": 2,
      "title": "React Developer",
      "description": "Develop client user interface systems...",
      "category": "Web Development",
      "location": "Nairobi",
      "budget": 75000,
      "skills": ["React", "JavaScript"],
      "status": "open",
      "deadline": "2026-08-30",
      "created_at": "2026-07-14 17:00:00",
      "proposal_count": 3
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### POST /api/jobs
**Auth required:** Yes  
**Role:** `employer`  
**Headers:** `Authorization: Bearer <employerToken>`  
**Request body:**
```json
{
  "title": "React Developer",
  "description": "Develop client user interface systems...",
  "category": "Web Development",
  "location": "Nairobi",
  "budget": 75000,
  "skills": ["React", "JavaScript"],
  "deadline": "2026-08-30"
}
```
**Success response (201):**
```json
{
  "job_id": 1,
  "employer_id": 2,
  "title": "React Developer",
  "description": "Develop client user interface systems...",
  "category": "Web Development",
  "location": "Nairobi",
  "budget": 75000,
  "skills": ["React", "JavaScript"],
  "status": "open",
  "deadline": "2026-08-30",
  "created_at": "2026-07-14 17:00:00"
}
```
**Error responses:**
- `400`: Validation errors.
- `401`: Unauthorized.
- `403`: Access forbidden (role is not employer).

---

### GET /api/jobs/:id
**Auth required:** No  
**Role:** Any  
**Success response (200):**
```json
{
  "job_id": 1,
  "employer_id": 2,
  "title": "React Developer",
  "description": "Develop client user interface systems...",
  "category": "Web Development",
  "location": "Nairobi",
  "budget": 75000,
  "skills": ["React", "JavaScript"],
  "status": "open",
  "deadline": "2026-08-30",
  "created_at": "2026-07-14 17:00:00",
  "proposal_count": 3
}
```
**Error responses:**
- `404`: Job listing not found.

---

### POST /api/jobs/:id/proposals
**Auth required:** Yes  
**Role:** `freelancer`  
**Headers:** `Authorization: Bearer <freelancerToken>`  
**Request body:**
```json
{
  "cover_letter": "I would love to apply for this job as I have the required expertise...",
  "proposed_budget": 70000,
  "timeline_days": 14,
  "portfolio_url": "https://myportfolio.com/jane"
}
```
**Success response (210/201):**
```json
{
  "proposal_id": 1,
  "job_id": 1,
  "freelancer_id": 3,
  "cover_letter": "I would love to apply for this job...",
  "proposed_budget": 70000,
  "timeline_days": 14,
  "portfolio_url": "https://myportfolio.com/jane",
  "status": "pending",
  "submitted_at": "2026-07-14 18:00:00"
}
```
**Error responses:**
- `400`: Validation errors (e.g. cover letter < 50 characters).
- `409`: You have already submitted a proposal for this job.

---

### PUT /api/jobs/:id/proposals/:proposalId/accept
**Auth required:** Yes  
**Role:** `employer`  
**Headers:** `Authorization: Bearer <employerToken>`  
**Success response (200):**
```json
{
  "contract_id": 1,
  "proposal_id": 1,
  "job_id": 1,
  "employer_id": 2,
  "freelancer_id": 3,
  "agreed_budget": 70000,
  "status": "pending",
  "checkout_request_id": null,
  "funded_at": null,
  "delivered_at": null,
  "released_at": null,
  "created_at": "2026-07-14 18:30:00"
}
```
**Error responses:**
- `403`: Access forbidden (you do not own this job listing).
- `404`: Job or proposal not found.

---

### POST /api/contracts/:id/fund
**Auth required:** Yes  
**Role:** `employer`  
**Headers:** `Authorization: Bearer <employerToken>`  
**Success response (200):**
```json
{
  "message": "Escrow funded successfully",
  "mockReceipt": "MOCK-1720953600000",
  "contract": {
    "contract_id": 1,
    "proposal_id": 1,
    "job_id": 1,
    "employer_id": 2,
    "freelancer_id": 3,
    "agreed_budget": 70000,
    "status": "funded",
    "checkout_request_id": "MOCK-1720953600000",
    "funded_at": "2026-07-14T18:45:00.000Z",
    "delivered_at": null,
    "released_at": null,
    "created_at": "2026-07-14 18:30:00"
  }
}
```
**Error responses:**
- `400`: Contract already funded.
- `403`: Access forbidden (not your contract).

---

### POST /api/contracts/:id/deliver
**Auth required:** Yes  
**Role:** `freelancer`  
**Headers:** `Authorization: Bearer <freelancerToken>`  
**Success response (200):**
```json
{
  "contract_id": 1,
  "proposal_id": 1,
  "job_id": 1,
  "employer_id": 2,
  "freelancer_id": 3,
  "agreed_budget": 70000,
  "status": "delivered",
  "checkout_request_id": "MOCK-1720953600000",
  "funded_at": "2026-07-14T18:45:00.000Z",
  "delivered_at": "2026-07-14T19:00:00.000Z",
  "released_at": null,
  "created_at": "2026-07-14 18:30:00"
}
```
**Error responses:**
- `400`: Contract is not in funded status.
- `403`: Access forbidden (not your contract).

---

### POST /api/contracts/:id/approve
**Auth required:** Yes  
**Role:** `employer`  
**Headers:** `Authorization: Bearer <employerToken>`  
**Success response (200):**
```json
{
  "message": "Contract approved and funds released successfully",
  "freelancerPayout": 64400,
  "platformFee": 5600,
  "contract": {
    "contract_id": 1,
    "status": "released",
    "released_at": "2026-07-14T19:15:00.000Z"
  },
  "payments": [
    { "payment_id": 1, "recipient_id": 3, "amount": 64400, "type": "freelancer_payout" },
    { "payment_id": 2, "recipient_id": 1, "amount": 5600, "type": "platform_fee" }
  ]
}
```
**Error responses:**
- `400`: Contract is not in delivered status.
- `403`: Access forbidden (not your contract).

---

### POST /api/contracts/:id/dispute
**Auth required:** Yes  
**Role:** Employer or Freelancer on the contract  
**Headers:** `Authorization: Bearer <userToken>`  
**Request body:**
```json
{
  "reason": "Freelancer failed to implement mobile responsiveness layout."
}
```
**Success response (200):**
```json
{
  "contract_id": 1,
  "status": "disputed"
}
```
**Error responses:**
- `400`: Validation errors (reason must be min 20 chars).
- `403`: Access forbidden (you are not a party to this contract).

---

## AI Tools Declaration

In accordance with the project guidelines, I declare the use of AI tools during development:
- **Antigravity AI (Google Deepmind):** I utilized this assistant to scaffold the boilerplate, design the routers/controllers, build database schema scripts, and draft the automated Jest tests. All generated outputs were reviewed, customized, and verified manually.

## Known Limitations

- **Email Uniqueness:** The system handles duplicate email registration at the database validation layer and returns a 409 error response.
