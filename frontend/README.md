# FinanceHub Frontend

## Overview

FinanceHub is a modern, professional finance dashboard application built with React and Vite. It provides teams with intuitive tools to track expenses, analyze spending patterns, and manage financial operations with role-based access control and comprehensive analytics.

This frontend integrates seamlessly with the FinanceHub backend API to deliver authentication, role-based navigation, record management, team spending analytics, and admin controls.

### Main capabilities

- Secure login and registration with JWT token management
- Role-aware navigation (VIEWER, ANALYST, ADMIN) with protected routes
- Expense and income record creation, editing, filtering, and listing
- **Analyst spending breakdown** — view per-user spending analysis (ANALYST+ only)
- Dashboard analytics with visual metrics, trends, category breakdowns, and recent activity
- Admin user management interface with status control
- Summary stat cards showing totals and metrics across pages
- Modern dark-mode design with Tailwind CSS
- Responsive mobile-first layout

---

## Tech stack

- React 19
- Vite
- Axios
- React Router v7
- Tailwind CSS
- JavaScript (JSX)

---

## Project structure

```
frontend/
  ├─ public/
  ├─ src/
  │   ├─ api/
  │   │   └─ api.js
  │   ├─ components/
  │   │   ├─ Navbar.jsx
  │   │   └─ ProtectedRoute.jsx
  │   ├─ context/
  │   │   └─ AuthContext.jsx
  │   ├─ pages/
  │   │   ├─ Dashboard.jsx
  │   │   ├─ Login.jsx
  │   │   ├─ Register.jsx
  │   │   ├─ Records.jsx
  │   │   └─ Users.jsx
  │   ├─ App.jsx
  │   ├─ index.css
  │   └─ main.jsx
  ├─ package.json
  ├─ vite.config.js
  └─ README.md
```

---

## Local setup

```bash
cd frontend
npm install
npm run dev
```

Open the app in browser at `http://localhost:5173`.

### Production preview

```bash
npm run build
npm run preview
```

---

## Configuration

The frontend API base URL is configured in `src/api/api.js`:

```js
const API = axios.create({
  baseURL: "http://localhost:3000/api",
});
```

For production, update this to your deployed backend URL.

---

## Routing and access control

### Application routes

- `/login` — Login page (public)
- `/register` — Registration page (public)
- `/` — Analytics dashboard (authenticated users)
- `/records` — Financial records management (authenticated users)
- `/users` — Admin user management interface (ADMIN only)
- `/unauthorized` — Access denied page (role-based)

### Role-based features

- **VIEWER**: Can view dashboard and records
- **ANALYST**: Can view dashboard + per-user spending breakdown + manage records
- **ADMIN**: Can manage users, assign roles, toggle user status, plus all ANALYST features

---

## Styling

The entire application uses **Tailwind CSS** with a modern dark theme:

- Dark slate backgrounds (slate-950/800)
- Gradient accents (indigo, fuchsia, cyan)
- Glassmorphism effects (backdrop-blur)
- Smooth transitions and hover states
- Responsive grid layouts
- Professional shadow effects

No legacy CSS files — all styling via Tailwind utilities in `index.css`.

- `/unauthorized` — Access denied page

### Protected routes

`ProtectedRoute.jsx` enforces both authentication and role requirements.

- Routes without a `role` prop allow any authenticated user.
- Routes with `role="ANALYST"` require analyst or admin access.
- Routes with `role="ADMIN"` require admin access.

---

## Authentication flow

### Auth context

`src/context/AuthContext.jsx` handles:

- storing the current user
- storing JWT token in `localStorage`
- login and registration API calls
- logout
- role helpers: `isAdmin` and `isAnalyst`

### Token persistence

- The app loads token and user data from localStorage on startup.
- If a token exists, it is attached to every backend request.
- Logout clears stored token and user state.

---

## API integration

### Primary API endpoints

#### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`

#### Users

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id/role`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`

#### Records

- `GET /api/records`
- `GET /api/records/:id`
- `POST /api/records`
- `PATCH /api/records/:id`
- `DELETE /api/records/:id`

#### Dashboard

- `GET /api/dashboard/overview`
- `GET /api/dashboard/categories`
- `GET /api/dashboard/trends/monthly`
- `GET /api/dashboard/trends/weekly`
- `GET /api/dashboard/recent`

---

## Page summaries

### Login page

- Email and password input
- Shows errors from backend
- Redirects to home after login

### Register page

- Supports name, email, password, and role selection
- Automatically logs in new users
- Stores auth token and user data

### Dashboard page

- Displays summary cards: total income, total expenses, net balance, total records
- Shows category totals and trend charts
- Fetches analytics data from the backend
- Restricted to analyst and admin users

### Records page

- Displays a list of financial records
- Allows filtering by type, category, and amount
- Allows creation of records
- Admins can update and delete records

### Users page

- Admin-only page
- Create new users
- Update user role
- Activate / deactivate accounts
- Delete users
- Includes pagination support

---

## UI and styling

- Uses plain CSS in `src/index.css`
- Responsive layout for desktop and mobile
- Role-specific navbar links
- Buttons and cards styled for clarity
- Error and loading states are shown in the UI

---

## Role-based behavior

### Viewer

- Can access `/records`
- Can view and create records
- Cannot edit or delete records
- Cannot access dashboard or users page

### Analyst

- Can access `/dashboard`
- Can read and create records
- Cannot edit or delete records
- Cannot manage users

### Admin

- Full access to dashboard, records, and users
- Can edit and delete records
- Can create and manage users

---

## Development notes

- `src/api/api.js` automatically loads a saved token from localStorage.
- `ProtectedRoute.jsx` redirects unauthorized clients to `/unauthorized`.
- `Navbar.jsx` renders navigation links based on the current user role.

---

## How to deploy

### Static hosting

1. Build the app:

```bash
npm run build
```

2. Serve the generated `dist/` folder with any static hosting provider.

### Docker deployment example

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
```

---

## Helpful commands

- `npm run dev` — start frontend locally
- `npm run build` — build production assets
- `npm run preview` — preview production build locally

---

## Notes

- Ensure the backend API is running at `http://localhost:3000/api`.
- Update the API base URL in `src/api/api.js` for production.
- Use strong secrets and HTTPS in live environments.
