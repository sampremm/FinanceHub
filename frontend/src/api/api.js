import axios from "axios";

const API = axios.create({
  baseURL: "import.meta.env.VITE_API_URL" || "http://localhost:3000/api",
});

// Auth
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
};

// Users
export const usersAPI = {
  list: (page = 1, limit = 20) => API.get("/users", { params: { page, limit } }),
  get: (id) => API.get(`/users/${id}`),
  create: (data) => API.post("/users", data),
  updateRole: (id, role) => API.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, status) => API.patch(`/users/${id}/status`, { status }),
  delete: (id) => API.delete(`/users/${id}`),
};

// Records
export const recordsAPI = {
  list: (filters = {}) => API.get("/records", { params: filters }),
  get: (id) => API.get(`/records/${id}`),
  create: (data) => API.post("/records", data),
  update: (id, data) => API.patch(`/records/${id}`, data),
  delete: (id) => API.delete(`/records/${id}`),
};

// Dashboard
export const dashboardAPI = {
  overview: () => API.get("/dashboard/overview"),
  categories: () => API.get("/dashboard/categories"),
  monthlyTrends: (months = 6) => API.get("/dashboard/trends/monthly", { params: { months } }),
  weeklyTrends: (weeks = 8) => API.get("/dashboard/trends/weekly", { params: { weeks } }),
  recentActivity: (limit = 10) => API.get("/dashboard/recent", { params: { limit } }),
  userSpending: () => API.get("/dashboard/users"),
};

// Token management
export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete API.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Load token on init
const savedToken = localStorage.getItem("token");
if (savedToken) {
  setToken(savedToken);
}

export default API;