# FinanceHub - System Architecture & Integration Guide

## 🏗️ System Overview

FinanceHub is a full-stack SaaS financial management platform with role-based access control, built with:

- **Frontend**: React 19 with React Router v7, Axios
- **Backend**: Express.js with TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT-based authentication

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            React 19 SPA (Port 5173)                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  App.jsx (Router + AuthProvider)                   │  │  │
│  │  │  ├─ ProtectedRoute (RBAC Enforcement)             │  │  │
│  │  │  ├─ Navbar (Navigation with Role Check)           │  │  │
│  │  │  └─ Pages (Dashboard, Records, Users)             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓ HTTP (Axios)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API (Port 3000)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Express.js + TypeScript                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Routes                                            │  │  │
│  │  │  ├─ /api/auth (Public)                            │  │  │
│  │  │  │  ├─ POST /register                             │  │  │
│  │  │  │  └─ POST /login                                │  │  │
│  │  │  ├─ /api/users (Admin Only)                       │  │  │
│  │  │  │  ├─ GET /users (List)                          │  │  │
│  │  │  │  ├─ POST /users (Create)                       │  │  │
│  │  │  │  ├─ PATCH /users/:id/role (Update Role)       │  │  │
│  │  │  │  └─ DELETE /users/:id (Delete)                │  │  │
│  │  │  ├─ /api/records (Role-Based)                     │  │  │
│  │  │  │  ├─ GET /records (All Roles)                  │  │  │
│  │  │  │  ├─ POST /records (All Roles)                 │  │  │
│  │  │  │  ├─ PATCH /records/:id (Admin Only)           │  │  │
│  │  │  │  └─ DELETE /records/:id (Admin Only)          │  │  │
│  │  │  └─ /api/dashboard (Analyst+)                     │  │  │
│  │  │     ├─ GET /overview                              │  │  │
│  │  │     ├─ GET /categories                            │  │  │
│  │  │     ├─ GET /trends/monthly                        │  │  │
│  │  │     └─ GET /recent                                │  │  │
│  │  │                                                     │  │  │
│  │  │  Middleware                                        │  │  │
│  │  │  ├─ auth.middleware (JWT Verification)            │  │  │
│  │  │  ├─ rbac.middleware (Role-Based Access)           │  │  │
│  │  │  └─ error.middleware (Error Handling)             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  Services (Business Logic)                              │  │
│  │  ├─ AuthService (Register, Login, JWT)                 │  │
│  │  ├─ UserService (CRUD + Role Management)               │  │
│  │  ├─ RecordService (CRUD + Filtering)                   │  │
│  │  └─ DashboardService (Analytics Queries)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓ Prisma ORM                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables                                                  │  │
│  │  ├─ User (id, name, email, role, status, created)      │  │
│  │  ├─ Record (id, type, amount, category, desc, user_id) │  │
│  │  └─ Indexes on user_id, role, type, category, created │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Examples

### Authentication Flow (Login)

```
User Input (Email + Password)
↓
POST /api/auth/login
↓
Backend AuthService
├─ Find user by email
├─ Validate password (bcryptjs)
├─ Generate JWT token
└─ Return { token, user }
↓
Frontend AuthContext
├─ Store token in localStorage
├─ Store user in localStorage
├─ Set Authorization header
└─ Update app state
↓
Redirect to Dashboard
```

### Record Creation Flow (VIEWER User)

```
User selects "Add Record" → Form with:
├─ Type: "expense"
├─ Category: "Groceries"
├─ Amount: 50.00
└─ Description: "Weekly groceries"

↓
POST /api/records
→ Headers: Authorization: Bearer {token}
→ Body: { type, category, amount, description }

↓
Backend Middleware
├─ Check JWT valid ✓
├─ Check RBAC (VIEWER+ allowed) ✓
└─ Process in RecordService

↓
Database
├─ Insert record
├─ Associate with user_id
└─ Return created record

↓
Frontend
├─ Update records state
├─ Re-render table
├─ Show success message
└─ Clear form
```

### Dashboard Analytics Flow (ANALYST User)

```
User navigates to "/"

↓
ProtectedRoute checks
├─ Is authenticated? ✓
├─ Has role="ANALYST"? ✓
└─ Render Dashboard

↓
Dashboard.useEffect() triggers
4 Parallel API calls:

├─ GET /api/dashboard/overview
│  └─ Returns: totalIncome, totalExpenses, netBalance, totalRecords
│
├─ GET /api/dashboard/categories
│  └─ Returns: [{ category, amount, count }, ...]
│
├─ GET /api/dashboard/trends/monthly?months=6
│  └─ Returns: [{ month, income, expense }, ...]
│
└─ GET /api/dashboard/recent?limit=10
   └─ Returns: [{ id, type, amount, description, createdAt }, ...]

↓
All responses processed
├─ setOverview(data)
├─ setCategories(data)
├─ setMonthlyTrends(data)
└─ setRecentActivity(data)

↓
Render Dashboard with:
├─ Overview cards (4 metrics)
├─ Category breakdown chart
├─ Monthly trends chart
└─ Recent activity list
```

### Access Denial Flow (VIEWER accessing Dashboard)

```
User tries to visit "/"

↓
ProtectedRoute renders
├─ Check isAuthenticated ✓
├─ Check role="ANALYST"?
│  └─ User has role="VIEWER" ✗
│
└─ Redirect to /unauthorized

↓
Unauthorized page shows
└─ "Access Denied - You don't have permission"
```

## 🔐 Role-Based Access Control

### RBAC Implementation

**Frontend Level:**

```javascript
<ProtectedRoute role="ANALYST">
  <Dashboard />
</ProtectedRoute>
// Checks: roleHierarchy[user.role] >= roleHierarchy["ANALYST"]
```

**Backend Level:**

```javascript
// RBAC Middleware
if (!authorizedRoles.includes(user.role)) {
  return res.status(403).json({ message: "Forbidden" });
}
```

### Role Hierarchy

```
VIEWER (1)
  ↓ Can access everything VIEWER can
ANALYST (2)
  ↓ Can access everything ANALYST can
ADMIN (3)
  ↓ Can access everything
```

## 🔌 API Response Format

### Success Response

```javascript
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John",
    "email": "john@example.com",
    "role": "ADMIN"
  },
  "message": "User created successfully"
}
```

### Error Response

```javascript
{
  "success": false,
  "message": "Invalid credentials",
  "error": "UNAUTHORIZED"
}
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('VIEWER', 'ANALYST', 'ADMIN') DEFAULT 'VIEWER',
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Records Table

```sql
CREATE TABLE records (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_records_userId ON records(userId);
CREATE INDEX idx_records_type ON records(type);
CREATE INDEX idx_records_category ON records(category);
CREATE INDEX idx_records_createdAt ON records(createdAt DESC);
```

## 📦 Frontend State Management

### AuthContext Structure

```javascript
{
  user: {
    id, name, email, role, status
  },
  loading: boolean,
  error: string,
  isAuthenticated: boolean,
  isAdmin: boolean,
  isAnalyst: boolean,
  login: async (email, password) => user,
  register: async (name, email, password) => user,
  logout: () => void
}
```

### Component State Examples

**Records Page:**

```javascript
{
  records: Record[],
  loading: boolean,
  error: string,
  showForm: boolean,
  filters: { type, category, minAmount, maxAmount },
  formData: { type, category, amount, description },
  editingId: string | null
}
```

**Users Page:**

```javascript
{
  users: User[],
  loading: boolean,
  error: string,
  showForm: boolean,
  formData: { name, email, password, role },
  editingId: string | null,
  pagination: { page, limit }
}
```

## 🔐 Security Implementation

### Frontend Security

1. **Token Storage**: localStorage (consider httpOnly cookies for production)
2. **XSS Protection**: React auto-escapes JSX values
3. **CSRF Protection**: None needed with stateless JWT
4. **Input Validation**: Form validation before API calls
5. **HTTPS**: Enforced in production

### Backend Security

1. **JWT Verification**: Every protected route
2. **Password Hashing**: bcryptjs 10-salt rounds
3. **Rate Limiting**: Recommendations for auth endpoints
4. **CORS**: Restrict to frontend origin
5. **Input Sanitization**: Via Zod validation

## 🚀 Deployment Architecture

### Development

```
Local Machine
├─ npm run dev (Frontend on 5173)
└─ npm start (Backend on 3000)
```

### Production

```
Frontend:        Vercel / Netlify / Static Bucket
├─ npm run build
├─ dist/ folder
└─ Environment: https://api.yourdomain.com

Backend:         AWS / Azure / DigitalOcean
├─ Node.js
├─ Express server on port 3000
└─ Environment variables configured

Database:        Managed PostgreSQL
├─ AWS RDS / Azure Database / Supabase
└─ Backup & replication enabled
```

## 📈 Scalability Considerations

### Current Capacity

- Single Express instance
- Direct PostgreSQL connection
- In-memory session management

### Scaling Improvements

1. **Database**: Connection pooling (PgBouncer)
2. **Caching**: Redis for session/tokens
3. **Load Balancing**: Multiple Express instances
4. **CDN**: Static assets to CloudFront/CloudFlare
5. **API Gateway**: Rate limiting, auth delegation

## 🧪 Testing Strategy

### Frontend Testing

- Component unit tests (React Testing Library)
- Integration tests (user flows)
- E2E tests (Cypress/Playwright)

### Backend Testing

- API endpoint tests (Jest + Supertest)
- Service layer tests
- Database migration tests
- RBAC enforcement tests

## 📊 Monitoring & Logging

### Frontend

- Error tracking: Sentry, LogRocket
- Analytics: Google Analytics, Mixpanel
- Performance: Web Vitals

### Backend

- Request logging: Winston, Morgan
- Error tracking: Sentry
- Database monitoring: query performance logs
- Health checks: /health endpoint

## 🔄 CI/CD Pipeline

```
Git Push
  ↓
GitHub Actions / GitLab CI
  ├─ Run Tests
  ├─ Build Frontend
  ├─ Build Backend
  ├─ Database migrations
  └─ Deploy to Production
```

## 📝 Environment Variables

### Frontend (.env)

```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_VERSION=1.0.0
```

### Backend (.env)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainers**: Development Team
