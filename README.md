# Employee Leave Management System (LMS)

A full-stack MVP that digitizes employee leave requests , replacing manual email/spreadsheet-based tracking with a centralized system supporting role-based approval workflows.


---

## Table of Contents
- [Employee Leave Management System (LMS)](#employee-leave-management-system-lms)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Technology Stack](#technology-stack)
  - [Folder Structure](#folder-structure)
  - [Installation Steps](#installation-steps)
    - [Prerequisites](#prerequisites)
    - [Clone the repository](#clone-the-repository)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Application](#running-the-application)
  - [API Documentation](#api-documentation)
    - [Endpoint Summary](#endpoint-summary)
  - [Sample Login Credentials](#sample-login-credentials)
  - [Assumptions](#assumptions)
  - [Known Limitations](#known-limitations)
  - [Future Enhancements](#future-enhancements)

---

## Project Overview

Employees can register, log in, apply for leave, track leave status, and view their leave history. Managers can log in, view pending requests across all employees, and approve or reject them with comments. The system enforces role-based access control (RBAC) so employee-only and manager-only actions are properly restricted at the API level, not just hidden in the UI.

## Features

**Authentication**
- Email/password login with hashed passwords (bcrypt)
- JWT-based stateless authentication
- Role-based access control (`EMPLOYEE`, `MANAGER`)
- Protected routes on both frontend and backend
- Centralized error handling for invalid credentials

**Employee Module**
- Apply for leave (with type, date range, reason)
- View leave history, with search and filter by type/status
- Edit or cancel leave requests while still `PENDING`
- View personal leave balance by leave type
- Dashboard summary: total / approved / pending / rejected requests

**Manager Module**
- View all pending leave requests across employees
- Approve or reject requests with mandatory comments
- Search/filter employees and their leave history
- Dashboard summary: total employees, pending approvals, approved/rejected counts

**Leave Balance**
- Per-employee, per-leave-type, per-year balance tracking
- Balance is deducted automatically (in a DB transaction) when a leave is approved — not at request time
- Default balances seeded on employee creation (see [Assumptions](#assumptions))

## Technology Stack

| Layer | Technology 
|---|---|
| Frontend | React + TypeScript + Vite |
| State/Data | React Query (server state) + Context (auth) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL | Relational fit for Employee/Leave/Balance data |
| Auth | JWT  |
| Validation | Zod |
| Docs | Postman collection | 


## Folder Structure

```
OffShift/
├── backend/
│   ├── src/
│   │   ├── controller/
│   │   ├── middleware/
│   │   │   ├── verifyToken.ts
│   │   │   └── requireRole.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── types/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/ 
│   │   ├── hooks/ 
│   │   └── App.tsx
│   └── package.json
├── database/
│   └── schema.sql 
├── docs/
├── postman/
│   └── Offshift.postman_collection.json
├── README.md
└── .gitignore
```

## Installation Steps

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
-  pnpm

### Clone the repository
```bash
git clone 
cd Offshift
```

## Environment Variables

Create a `.env` file inside `backend/` based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/employee_lms?schema=public"

# Auth
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN="1d"

# Server
PORT=3001
```


## Database Setup

1. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE elms_db;"
   ```
2. From `backend/`, run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
   ```

### Schema Summary

- **Employee** — id, name, email, password (hashed), department, role (`EMPLOYEE`/`MANAGER`), timestamps
- **Leave** — id, employeeId (FK), leaveType, startDate, endDate, totalDays, reason, status, managerComments, timestamps
- **LeaveBalance** — id, employeeId (FK), leaveType, year, allocated, used, remaining — unique per (employeeId, leaveType, year)

Full schema: [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)

## Backend Setup

```bash
cd backend
pnpm install
pnpm run dev
```
Backend runs on `http://localhost:3001` .

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Running the Application

1. Start PostgreSQL
2. Start the backend (`pnpm run dev` inside `backend/`)
3. Start the frontend (`pnpm run dev` inside `frontend/`)
4. Visit `http://localhost:5173` in your browser
5. Log in using one of the [sample credentials](#sample-login-credentials) below

## API Documentation

Full request/response details are in the Postman collection at [`/postman/Offshift.postman_collection.json`](./postman/Offshift.postman_collection.json). Import it into Postman and set the `baseUrl` environment variable to your local server.

### Endpoint Summary

| Method | Endpoint | Auth Required | Role |
|---|---|---|---|
| POST | `/register` | No | — |
| POST | `/login` | No | — |
| POST | `/logout` | Yes | Any |
| GET | `/employees` | Yes | Manager |
| GET | `/employees/:id` | Yes | Any |
| POST | `/leaves` | Yes | Employee |
| GET | `/leaves` | Yes | Any (scoped to own for employees) |
| GET | `/leaves/:id` | Yes | Any |
| PUT | `/leaves/:id` | Yes | Employee (owner, pending only) |
| DELETE | `/leaves/:id` | Yes | Employee (owner, pending only) |
| GET | `/pending-leaves` | Yes | Manager |
| PUT | `/leaves/:id/approve` | Yes | Manager |
| PUT | `/leaves/:id/reject` | Yes | Manager |

**Auth header format:** `Authorization: Bearer <token>`

**Standard error response shape:**
```json
{ "error": "Descriptive message here" }
```

**Status codes used:** `200` success, `201` created, `400` validation error, `401` not authenticated, `403` authenticated but not authorized, `404` not found, `409` conflict (e.g. duplicate email), `500` server error.

## Sample Login Credentials

| Role | Email | Password |
|---|---|---|
| Employee | john@test.com | pass123 |
| Manager | jane@test.com | pass123 |

## Assumptions

- Leave balances are allocated per calendar year and reset annually (default: Casual 12, Sick 10, Earned 15).
- Leave balance is deducted only upon **approval**, not at the time of request.
- Cancelling a leave is only allowed while it is still `PENDING`; approved leaves cannot currently be cancelled/refunded.
- Logout is handled client-side (token discarded); no server-side token blocklist is implemented for this MVP.
- One manager role is assumed to have visibility over all employees (no department-scoped manager hierarchy).


## Known Limitations

- No JWT refresh token flow — access tokens simply expire and require re-login.
- No email notifications on leave status changes.
- No automated test suite (unit/integration) included due to time constraints.


## Future Enhancements

- Refresh token rotation for longer-lived sessions
- Email notifications on leave submission/approval/rejection
- Audit log of all approval/rejection actions
- Pagination and server-side search across leave/employee lists
- Dockerized setup for one-command local spin-up
- CI pipeline (GitHub Actions) running lint/tests on push