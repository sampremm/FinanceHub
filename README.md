# 💰 FinanceHub — Finance Data Processing & Access Control

**Zorvyn FinTech Screening Assessment Submission**  
Submitted by **Sam Prem Kumar Thalla**  
🔗 **Live Demo:** [https://financehub-frountend.vercel.app/login](https://financehub-frountend.vercel.app/login)

A **robust full-stack financial management platform** built exactly to the specifications of the Finance Data Processing and Access Control Backend assignment. Featuring strict **role-based access control (RBAC)**, real-time analytics, a robust REST API, and a modern UI.

---

## 🚀 Project Status

✅ **Complete & Production Ready**
✅ Full-stack (Frontend + Backend)
✅ Role-based system (Viewer / Analyst / Admin)
✅ Dashboard analytics + CRUD operations

---

## 🧠 Overview

FinanceHub is designed to simulate a **real-world financial tracking system** where:

* Users can manage income & expenses
* Analysts can analyze financial data
* Admins control users and system

👉 Built with clean architecture, proper validation, and scalable design.

## 📋 Zorvyn Assignment Mapping

This project explicitly aligns with all **Core Requirements** and **Optional Enhancements** specified in the assignment:
- **User and Role Management:** Secure JWT Auth with `VIEWER`, `ANALYST`, and `ADMIN` role distinction.
- **Financial Records Management:** Express REST API with full CRUD capability, built with PostgreSQL + Prisma. Includes `Amount`, `Type`, `Category`, `Date`, etc.
- **Dashboard Summary APIs:** Dedicated analytics service (total income/expenses, net balance, category totals, monthly/weekly trends).
- **Access Control Logic:** Implemented using isolated RBAC middleswares. Viewers are strictly isolated to their own records.
- **Validation and Error Handling:** Zod configuration with generic AppError handler ensuring strong typing and 4xx/5xx status reporting.
- **Data Persistence:** Fully relational PostgreSQL instance via Prisma ORM schemas.
- **Optional Enhancements:** Included Token Auth, Pagination, Secure Soft-Deletes across all schemas, robust caching with Redis, and extensive Jest testing.

---

## 🏗️ Architecture

Refer full architecture: 

### Stack

**Frontend**

* React (Vite)
* Axios
* Context API

**Backend**

* Node.js + Express
* TypeScript
* Prisma ORM

**Database**

* PostgreSQL

**Auth**

* JWT-based authentication

---

## 📂 Project Structure

```
FinanceHub/
├── Backend/        → API server
├── frontend/       → React app
├── ARCHITECTURE.md
├── SETUP_GUIDE.md
├── FRONTEND_FEATURES.md
```

---

## 🔐 Role-Based Access Control

| Role    | Permissions                     |
| ------- | ------------------------------- |
| VIEWER  | Add & view expenses             |
| ANALYST | View + analyze data (dashboard) |
| ADMIN   | Full control (users + records)  |

---

## 📊 Core Features

### 🔐 Authentication

* Register / Login with JWT
* Role-based access enforcement
* Persistent sessions

---

### 💸 Financial Records

* Create income/expense records
* Filter by category, type, date
* Soft delete support
* Pagination

---

### 📊 Dashboard (Analyst+)

* Total income / expenses / balance
* Category breakdown
* Monthly trends
* Recent activity

---

### 👥 User Management (Admin)

* Create users with roles
* Update roles & status
* Activate / deactivate users
* Delete users

---

### 🛡️ Backend Quality

* Zod validation
* Centralized error handling
* RBAC middleware
* Clean service architecture
* Unit tests (Jest + Supertest)

---

## 🎨 Frontend Highlights

Full frontend details: 

* Modern responsive UI
* Protected routes
* Role-based navigation
* Dashboard visualizations
* Form validation + UX

---

## ⚙️ Setup Guide

Full setup guide: 

---

### 🔧 Backend Setup

```bash
cd Backend
npm install
npm run dev
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Base URL

```
http://localhost:3000/api
```

---

## 🔑 Example Accounts

| Role    | Email                                             | Password    |
| ------- | ------------------------------------------------- | ----------- |
| VIEWER  | [viewer@example.com](mailto:viewer@example.com)   | password123 |
| ANALYST | [analyst@example.com](mailto:analyst@example.com) | password123 |
| ADMIN   | [admin@example.com](mailto:admin@example.com)     | password123 |

---

## 🧪 Testing

### Backend

* Jest + Supertest
* RBAC tests
* Route tests

### Manual

* Login/Register
* Add records
* Role access checks
* Dashboard analytics

---

## 🔐 Security

* JWT authentication
* Password hashing (bcrypt)
* Role-based authorization
* Input validation (Zod)
* Environment variables protected

---

## 📦 Deployment

Recommended:

* Frontend → Vercel
* Backend → Render
* Database → Neon

---

## 📈 Key Learnings

* Designing scalable backend systems
* Implementing RBAC properly
* Building full-stack SaaS apps
* API + frontend integration
* Production-level project structuring

---

## 🎯 Final Outcome

✔ Real-world SaaS project
✔ Clean architecture
✔ Recruiter-ready GitHub repo
✔ Production-ready codebase

---

## 👨‍💻 Author

**Sam Prem Kumar Thalla**

* Full Stack Developer
* MERN + Cloud Enthusiast

---

## ⭐ Final Note

This project demonstrates:

> **Strong backend design + clean frontend integration + real-world problem solving**

---

🚀 **FinanceHub is ready for production & deployment**
