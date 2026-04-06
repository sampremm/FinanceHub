# FinanceHub - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ (with npm or yarn)
- Backend API running on `http://localhost:3000`
- Git

### Installation (5 minutes)

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. **Open browser**
   - Navigate to `http://localhost:5173`
   - You'll see the login page

## 🔐 Default Test Accounts

Create these users via the backend or admin panel:

```
VIEWER Account:
- Email: viewer@example.com
- Password: password123
- Role: VIEWER

ANALYST Account:
- Email: analyst@example.com
- Password: password123
- Role: ANALYST

ADMIN Account:
- Email: admin@example.com
- Password: password123
- Role: ADMIN
```

## 📋 Features by Role

### 👁️ VIEWER Role

- ✅ View financial records
- ✅ Create new income/expense records
- ❌ Cannot edit/delete records
- ❌ Cannot access dashboard analytics
- ❌ Cannot manage users

**Navigation Available:**

- Records page only

### 📊 ANALYST Role

- ✅ Access complete dashboard with analytics
- ✅ View 6-month trends and category breakdown
- ✅ View recent activity
- ✅ Create records
- ❌ Cannot edit/delete records
- ❌ Cannot manage users

**Navigation Available:**

- Dashboard
- Records

### 🔑 ADMIN Role

- ✅ Full system access
- ✅ Dashboard analytics
- ✅ Edit/delete any record
- ✅ Create, edit, delete users
- ✅ Assign/change user roles
- ✅ Activate/deactivate accounts

**Navigation Available:**

- Dashboard
- Records
- Users (Admin Panel)

## 🎯 User Workflows

### Workflow 1: Income/Expense Tracking (All Users)

1. Go to **Records** page
2. Click **"➕ Add Record"** button
3. Fill in:
   - Type: Select "Income" or "Expense"
   - Category: Pick from dropdown
   - Amount: Enter numerical value
   - Description: Add notes (optional)
4. Click **"Create Record"** button
5. View in table immediately

### Workflow 2: Filter Records (All Users)

1. On Records page, use filter panel above table
2. Select filters:
   - **Type**: All, Income, or Expense
   - **Category**: Pick category
   - **Min Amount**: Set minimum
   - **Max Amount**: Set maximum
3. Filters apply automatically
4. Click **"Reset Filters"** to clear

### Workflow 3: Edit/Delete Records (Admin Only)

1. Navigate to Records page
2. Find record in table
3. Click **"✏️ Edit"** or **"🗑️ Delete"**
4. Edit: Update form fields and click Update
5. Delete: Confirm in dialog, record removed

### Workflow 4: View Dashboard Analytics (Analyst+)

1. Go to **Dashboard** (home page)
2. View four summary cards:
   - Total Income this period
   - Total Expenses this period
   - Net Balance
   - Total Records count
3. See Category Breakdown chart
4. View Monthly Trends (6-month view)
5. Check Recent Activity (last 10 transactions)
6. Click **"🔄 Refresh"** to update data

### Workflow 5: Manage Users (Admin Only)

1. Click **"👥 Users"** in navbar
2. Click **"➕ Add User"** to create new user
3. Fill in:
   - Full Name
   - Email
   - Password
   - Role (VIEWER, ANALYST, ADMIN)
4. Click **"Create User"**
5. View users in table
6. For existing users:
   - Click **"✏️ Edit"** to change role
   - Click **"🔒 Deactivate"** to disable account
   - Click **"🗑️ Delete"** to remove user

## 🔐 Security Best Practices

1. **Change Default Passwords**
   - Never use default test passwords in production
   - Enforce strong passwords (8+ chars, mixed case, numbers)

2. **Use HTTPS in Production**
   - Update API URL to use https://
   - Ensure SSL/TLS certificates

3. **JWT Token Security**
   - Tokens auto-stored in localStorage
   - Clear LocalStorage on logout (automatic)
   - Set short expiration times (15-30 mins)

4. **Admin Account Protection**
   - Create strong admin passwords
   - Use unique admin accounts for each person
   - Regularly audit admin activity

## 📝 Configuration

### API Endpoint Setup

**File**: `src/api/api.js`

```javascript
const API = axios.create({
  baseURL: "http://localhost:3000/api", // Update for production
});
```

**For Production:**

```javascript
const API = axios.create({
  baseURL: "https://api.yourdomain.com/api",
});
```

### CORS Configuration

The frontend expects CORS enabled on backend:

- Frontend: `http://localhost:5173` (dev)
- Frontend production URL (production)

Backend should allow these origins.

## 🏗️ Build & Deployment

### Development Build

```bash
npm run dev
```

- Hot module reloading enabled
- Source maps for debugging
- Unminified code

### Production Build

```bash
npm run build
```

Generates optimized files in `dist/` directory

### Production Deployment

**Option 1: Static Hosting (Vercel, Netlify)**

```bash
npm run build
# Deploy dist/ folder
```

**Option 2: Docker**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

**Option 3: Traditional Server**

```bash
npm run build
# Copy dist/ to web server (nginx, apache)
# Configure server to serve index.html for SPA routing
```

### Environment Variables

Create `.env` file:

```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=FinanceHub
```

## 🧪 Testing the Application

### Manual Testing Checklist

#### Authentication

- [ ] Register new account
- [ ] Login with correct credentials
- [ ] Login with wrong credentials shows error
- [ ] Logout clears session
- [ ] Auto-redirect to login when accessing protected routes

#### Records (All Users)

- [ ] Create income record
- [ ] Create expense record
- [ ] Filter by type
- [ ] Filter by category
- [ ] Filter by amount range
- [ ] View record list
- [ ] Button states match user role

#### Dashboard (Analyst+)

- [ ] Dashboard cards show correct totals
- [ ] Monthly trend chart displays
- [ ] Category breakdown shows
- [ ] Recent activity lists transactions
- [ ] Refresh button updates data
- [ ] Viewer users see 401/forbidden

#### User Management (Admin Only)

- [ ] Create new user
- [ ] View user list
- [ ] Edit user role
- [ ] Activate/deactivate user
- [ ] Delete user with confirmation
- [ ] Non-admin users cannot access

#### Role-Based Access

- [ ] VIEWER can only see Records
- [ ] ANALYST can see Dashboard + Records
- [ ] ADMIN can see all pages
- [ ] Correct toolbar buttons visible

## 🐛 Debugging

### Browser DevTools

**Check Token**

```javascript
console.log(localStorage.getItem("token"));
```

**Check User Data**

```javascript
console.log(localStorage.getItem("user"));
```

**Clear All Data**

```javascript
localStorage.clear();
location.reload();
```

### Network Tab

1. Open DevTools → Network
2. Filter by XHR/Fetch
3. Click button to trigger request
4. Check:
   - Request headers (Authorization token)
   - Response status (2xx = success, 4xx = client error, 5xx = server error)
   - Response body (error messages)

### Console Errors

- Check for TypeScript/JavaScript errors
- Look for API call errors
- Check CORS issues

## 📊 Performance Tips

1. **Optimize Filters**
   - Filters auto-apply (no "Search" button needed)
   - Add debouncing for text inputs if needed

2. **Pagination**
   - Users page loads 20 per page
   - More pages available via Next button

3. **Dashboard Data**
   - Four parallel API calls reduce load time
   - Refresh can be clicked to reload

4. **Browser Caching**
   - Static assets cached
   - API calls not cached (fresh data always)

## 🆘 Troubleshooting

### Issue: "Cannot GET /"

**Solution**: Node server isn't running. Use `npm run dev`

### Issue: API 404 errors

**Solution**: Backend not running. Start backend with `npm start` (Backend folder)

### Issue: Login fails with 401

**Solution**:

- Check email/password
- Verify user exists in database
- Check backend is returning token

### Issue: Records not showing

**Solution**:

- Create some records first
- Check user role (VIEWER can only see own records)
- Verify API is returning data

### Issue: Dashboard blank

**Solution**:

- Need ANALYST role or higher
- Check if records exist in database
- Verify API endpoints are working

### Issue: Styles look broken

**Solution**:

- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Rebuild: `npm run build`

## 📞 Support Contacts

For issues:

1. Check error messages in browser console
2. Review backend logs
3. Verify database connections
4. Check API response status codes

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [React Router Guide](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [JWT Authentication](https://jwt.io)

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Ready for Production ✅
