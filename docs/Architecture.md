# Employee Leave Management System — Architecture


##  Database Schema (Prisma — already scaffolded)

Three models: `Employee`, `Leave`, `LeaveBalance`.

**Relationships:**
- `Employee 1 — N Leave` (one employee has many leave requests)
- `Employee 1 — N LeaveBalance` (one row per employee per leaveType per year)

**Key constraints:**
- `Employee.email` — `@unique`
- `LeaveBalance` — `@@unique([employeeId, leaveType, year])` prevents duplicate balance rows
- Indexes on `Leave.employeeId + status` and `LeaveBalance.employeeId + year` for dashboard query performance


---

##  Request Lifecycle (how a request flows through the backend)

```
Client Request
     │
     ▼
Express App (app.ts)
     │
     ▼
Route (e.g. PUT /leaves/:id/approve)
     │
     ▼
verifyToken middleware  ──► 401 if missing/invalid token
     │
     ▼
requireRole('MANAGER')  ──► 403 if wrong role
     │
     ▼
validate(schema) middleware ──► 400 if bad payload
     │
     ▼
Controller (thin — parses req, calls service, sends res)
     │
     ▼
Service (business logic — e.g. approveLeave uses prisma.$transaction
         to flip Leave.status AND decrement LeaveBalance.remaining together)
     │
     ▼
Prisma → PostgreSQL
     │
     ▼
Response sent back OR error thrown
     │
     ▼
errorHandler middleware (catches anything thrown, formats consistent JSON error)
```


---

##  Auth Flow (end to end)

```
1. POST /login  { email, password }
      → auth.service checks bcrypt.compare(password, user.password)
      → jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' })
      → returns { token, role }

2. Frontend stores token (React state + optionally localStorage for persistence
   across refresh — document this choice in README under Assumptions)

3. Every subsequent request:
      Authorization: Bearer <token>   (set via axios interceptor)

4. Backend verifyToken middleware:
      → jwt.verify(token, JWT_SECRET)
      → attaches { id, role } to req.user

5. requireRole middleware (only on manager routes):
      → checks req.user.role === 'MANAGER'

6. Frontend ProtectedRoute component:
      → reads role from AuthContext
      → redirects to /login if no token
      → redirects to /  (or 403 page) if role doesn't match route requirement
```


---

## API Surface (grouped, matches your routes/ files)

**Auth** — `auth.routes.ts`
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/logout | Authenticated |

**Employee** — `employee.routes.ts`
| Method | Path | Access |
|---|---|---|
| GET | /api/employees/me | Authenticated |
| GET | /api/employees/me/dashboard | Authenticated |
| GET | /api/employees | Manager only |
| GET | /api/employees/:id | Manager only |

**Leave** — `leave.routes.ts`
| Method | Path | Access |
|---|---|---|
| POST | /api/leaves | Employee |
| GET | /api/leaves | Employee (own) — supports ?status=&type=&search= |
| GET | /api/leaves/:id | Owner or Manager |
| PUT | /api/leaves/:id | Employee, only if status=PENDING |
| DELETE | /api/leaves/:id | Employee, only if status=PENDING |

**Manager** — `manager.routes.ts`
| Method | Path | Access |
|---|---|---|
| GET | /api/manager/pending-leaves | Manager only |
| PUT | /api/leaves/:id/approve | Manager only |
| PUT | /api/leaves/:id/reject | Manager only (requires comments in body) |
| GET | /api/manager/dashboard | Manager only |



## Frontend Data Flow

```
Page component
     │
     ▼
Custom hook (useLeaves, useAuth) — wraps React Query
     │
     ▼
api/*.api.ts — axios calls, typed request/response
     │
     ▼
axios instance (api/axios.ts) — attaches Authorization header,
                                 handles 401 → redirect to /login globally
     │
     ▼
Backend API
```

**State management split:**
- **Server state** (leaves, employees, dashboard stats) → React Query. Gives you loading/error states and caching for free — directly covers "Loading Indicators" and "Error Handling" marks with minimal code.
- **Client/UI state** (form inputs, modals, filters) → local `useState` in the component.
- **Auth state** (token, role, user) → `AuthContext`, since it's needed across the whole app (Navbar, ProtectedRoute, every API call).

---

## Error Handling Strategy (backend)

Central `errorHandler.ts`, registered last in `app.ts`:

```typescript
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: { message: err.message || "Internal server error", code: status },
  });
});
```

Controllers/services throw a custom `AppError(message, statusCode)` instead of manually writing `res.status().json()` 

---



