# 💰 FinanceHub Backend — Data Processing & Access Control

**Zorvyn FinTech Screening Assessment**

FinanceHub is a scalable backend API for a finance dashboard application that enables users to track expenses, analyze financial data, and manage users with role-based access control. It was meticulously designed to exceed the requirements of the Finance Data Processing and Access Control Backend assessment.

The system is built upon a modular architecture, strong inputs validation via Zod, strict user isolation routing, and production-ready enterprise standards.

---

## 🛠 Tech Stack

* Node.js
* TypeScript
* Express.js
* Prisma ORM
* PostgreSQL (NeonDB)
* JWT Authentication
* Zod Validation
* Redis (optional caching)
* Jest + Supertest (Testing)

---

## 🔥 Core Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Secure login and registration
* Role-based access control (RBAC)

Roles:

* **VIEWER** → create & view own records
* **ANALYST** → view all records + analytics
* **ADMIN** → full control (users + records)

---

### 👤 User Management (ADMIN)

* Create users
* Update roles
* Activate / deactivate accounts
* Soft delete users

---

### 💰 Financial Records

* Create income & expense records
* Filter by type, category, date
* Pagination support
* Soft delete functionality

---

### 📊 Dashboard Analytics

Accessible based on role:

* **VIEWER** → sees only own data
* **ANALYST & ADMIN** → see all data

Endpoints:

* Overview (income, expense, balance)
* Category-wise totals
* Monthly trends
* Weekly trends
* Recent activity

---

### 🔒 Security & Validation

* JWT-protected routes
* Role-based middleware
* Input validation using Zod
* Centralized error handling

---

### 🧪 Testing

* RBAC tests
* Authentication tests
* Records API tests
* Users API tests
* Dashboard tests

---

## 📁 Project Structure

```
Backend/
├── prisma/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── records/
│   │   └── dashboard/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
```

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` file:

```env
PORT=3000
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
REDIS_URL=redis://127.0.0.1:6379
```

---

### 3. Run the server

```bash
npm run dev
```

Server runs at:

```
http://localhost:3000
```

---

## 🔗 API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

---

### Users (ADMIN only)

* GET `/api/users`
* GET `/api/users/:id`
* POST `/api/users`
* PATCH `/api/users/:id/role`
* PATCH `/api/users/:id/status`
* DELETE `/api/users/:id`

---

### Records

* GET `/api/records`
* GET `/api/records/:id`
* POST `/api/records`
* PATCH `/api/records/:id` (ADMIN)
* DELETE `/api/records/:id` (ADMIN)

---

### Dashboard

* GET `/api/dashboard/overview`
* GET `/api/dashboard/categories`
* GET `/api/dashboard/trends/monthly`
* GET `/api/dashboard/trends/weekly`
* GET `/api/dashboard/recent`

---

## 🔑 Authentication

All protected routes require:

```
Authorization: Bearer <token>
```

---

## 🧠 Access Control Summary

| Role    | Access                             |
| ------- | ---------------------------------- |
| VIEWER  | Own records + dashboard (own data) |
| ANALYST | All records + analytics            |
| ADMIN   | Full system access                 |

---

## 🧪 Testing

Run tests:

```bash
npm test
```

Includes:

* Unit tests
* Integration tests
* RBAC validation

---

## 📌 Notes

* Uses soft delete for safety
* Designed with modular architecture
* Easily extendable for production scaling

---

## 👨‍💻 Author / Candidate

**Sam Prem Kumar Thalla**
[samprem888111@gmail.com](mailto:samprem888111@gmail.com)
