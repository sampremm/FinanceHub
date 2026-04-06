import { useState, useEffect } from "react";
import { usersAPI } from "../api/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "VIEWER" });
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const inactiveUsers = totalUsers - activeUsers;

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.list(pagination.page, pagination.limit);
      setUsers(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await usersAPI.updateRole(editingId, formData.role);
      } else {
        await usersAPI.create(formData);
      }
      setFormData({ name: "", email: "", password: "", role: "VIEWER" });
      setEditingId(null);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const normalized = String(currentStatus).toUpperCase();
      const newStatus = normalized === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await usersAPI.updateStatus(userId, newStatus);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await usersAPI.delete(id);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-lg border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">Manage account roles, activity, and status.</p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "✕ Close" : "➕ Add User"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-500/10">
            <p className="text-sm uppercase tracking-[0.22em] opacity-90">Total users</p>
            <p className="mt-4 text-3xl font-semibold">{totalUsers}</p>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Active</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-600">{activeUsers}</p>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Inactive</p>
            <p className="mt-4 text-3xl font-semibold text-rose-600">{inactiveUsers}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {showForm && (
          <div className="rounded-[32px] bg-white p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-5">{editingId ? "Edit User" : "Create New User"}</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!editingId && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  {editingId ? "Update" : "Create"} User
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", email: "", password: "", role: "VIEWER" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="rounded-[32px] bg-white p-6 text-center text-slate-500 shadow-lg border border-slate-200">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="rounded-[32px] bg-white p-6 text-center text-slate-500 shadow-lg border border-slate-200">No users found</div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] bg-white shadow-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-semibold tracking-wide">Name</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Email</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Role</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Status</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Created Date</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                          onClick={() => handleEdit(user)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                            user.status === "ACTIVE"
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                          onClick={() => handleStatusToggle(user.id, user.status)}
                        >
                          {user.status === "ACTIVE" ? "🔒 Deactivate" : "🔓 Activate"}
                        </button>
                        <button
                          className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between rounded-[32px] bg-white p-4 shadow-lg border border-slate-200">
            <button
              className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">Page {pagination.page}</span>
            <button
              className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={users.length < pagination.limit}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
