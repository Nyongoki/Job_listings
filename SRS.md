# Software Requirements Specification (SRS)
## Project: Homeland Jobs
**Version:** 1.0.0  
**Date:** July 2026  
**Author:** Software Engineering Team  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Homeland Jobs full-stack platform. It outlines the functional and non-functional requirements of the React frontend application and the Express/Node.js backend REST API.

### 1.2 Scope
Homeland Jobs is a specialized freelance marketplace platform connecting local employers with freelancers. 
- **Frontend Client:** Provides a responsive job board interface, search/filter panels, interactive proposal submission dialogs, and simulated loading/error state displays.
- **Backend API:** Provides secure JWT authentication, registration constraints, job creation and search logic, proposal tracking, transactional escrow funding/release simulations, and an automated payments processor.

### 1.3 Definitions and Acronyms
- **JWT:** JSON Web Token (used for secure, stateless request authentication).
- **Escrow:** A financial arrangement where a platform holds funds temporarily during project delivery before releasing them.
- **KES:** Kenyan Shilling (the primary currency format of the platform).
- **SRS:** Software Requirements Specification.

---

## 2. Overall Description

### 2.1 Product Perspective
Homeland Jobs is a full-stack platform consisting of two main sub-systems:
1. **`client/` (Frontend):** Built with React 19, Vite, and Tailwind CSS v4.
2. **`server/` (Backend):** Built with Express.js, Node.js, and a single-file SQLite database.

```
+------------------+                 +-------------------+
|   React Client   | <== HTTP/JSON =>|  Express Server   |
| (Vite + Tailwind)|                 |   (Node + JWT)    |
+------------------+                 +---------+---------+
                                               |
                                     +---------v---------+
                                     |  SQLite Database  |
                                     +-------------------+
```

### 2.2 Product Functions
- User registration and JWT-based session management.
- Dynamic job search by title, description, category, location, and budget range.
- Real-time job listing sorting (Newest, Budget High-to-Low, Budget Low-to-High).
- Freelancer proposal submission with cover letters, budgets, and delivery timelines.
- Transaction-backed proposal acceptance creating project contracts.
- Escrow funding, work delivery, and payment release (92% freelancer payout, 8% platform fee).
- Standalone auto-release daemon logic for neglected contracts.

### 2.3 User Classes and Characteristics
1. **Freelancer:** Can view jobs, submit job proposals, and mark contracts as delivered.
2. **Employer:** Can post jobs, accept proposals, fund contract escrows, and release escrow payments.
3. **Admin:** General system controller (recipient of platform transaction fees).

### 2.4 Design and Implementation Constraints
- The platform database must utilize the synchronous, file-based SQLite engine (`better-sqlite3`).
- Styling must use utility-first CSS classes (Tailwind CSS) with zero inline styles.
- Data transfers between frontend and backend must strictly use JSON formatting.

---

## 3. System Features

### 3.1 User Authentication and Authorization
- **Registration validation:** Enforces name length (min 2), email structure, password complexity (min 8 chars, 1 uppercase, 1 number), and phone format (`/^(07\d{8}|254\d{9})$/`).
- **Login system:** Verifies credentials, generates short-lived access tokens (1h), and logs long-lived refresh tokens (7d) in the database.
- **Role protection:** Protects routes using `requireRole` middleware.

### 3.2 Job Listings Board
- **Keyword Search:** Matches input string against job titles or descriptions.
- **Filters:** Filters results dynamically on exact category, exact location, and min/max budget range bounds.
- **Sorting Pipeline:** Filters first, then applies requested sorting (postedDate desc, budget desc, or budget asc).

### 3.3 Project Proposals & Contract Execution
- Enforces a unique constraint (one proposal per freelancer per job).
- Implements transactional proposal acceptance: accepting a proposal automatically rejects all competitor bids, sets the job status to `in_progress`, and spawns a `pending` contract record.

### 3.4 Escrow & Payment Simulation
- **Fund Escrow:** Changes contract status to `funded` and generates a mock checkout transaction receipt.
- **Deliver Work:** Changes status to `delivered` and logs delivery timestamp.
- **Release Funds:** Splits budget (92% to freelancer, 8% to platform admin), creates two payment logs, and changes contract status to `released`.
- **Raise Dispute:** Enables either party to flag the contract as `disputed` with a required 20-character reason.

---

## 4. Database Schema Requirements

The system must maintain the following relational database tables:

1. **`users`:** `user_id`, `name`, `email` (Unique), `phone`, `password_hash`, `role` (freelancer, employer, admin), `created_at`.
2. **`refresh_tokens`:** `id`, `user_id`, `token` (Unique), `expires_at`, `created_at`.
3. **`jobs`:** `job_id`, `employer_id`, `title`, `description`, `category`, `location`, `budget`, `skills` (JSON array string), `status` (open, in_progress, closed), `deadline`, `created_at`.
4. **`proposals`:** `proposal_id`, `job_id`, `freelancer_id`, `cover_letter`, `proposed_budget`, `timeline_days`, `portfolio_url`, `status` (pending, accepted, rejected), `submitted_at` (Unique pair `job_id` + `freelancer_id`).
5. **`contracts`:** `contract_id`, `proposal_id` (Unique), `job_id`, `employer_id`, `freelancer_id`, `agreed_budget`, `status` (pending, funded, delivered, released, disputed), `checkout_request_id`, `funded_at`, `delivered_at`, `released_at`, `created_at`.
6. **`payments`:** `payment_id`, `contract_id`, `recipient_id`, `amount`, `type` (freelancer_payout, platform_fee), `mpesa_receipt` (Unique), `created_at`.

---

## 5. Non-Functional Requirements

### 5.1 Security
- Passwords must be hashed using bcrypt with a salt work factor of 12.
- Database access credentials and JWT signature keys must be loaded from server environment variables rather than hardcoded.

### 5.2 Performance & Reliability
- Loading states must render skeleton card interfaces on the frontend.
- API operations must throw descriptive HTTP error status codes (400, 401, 403, 404, 409) rather than crashing the runtime server process.
