import { useState, useEffect } from "react";
import { recordsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ type: "", category: "", minAmount: "", maxAmount: "" });
  const [formData, setFormData] = useState({ type: "INCOME", category: "", amount: "", notes: "", date: new Date().toISOString() });
  const [editingId, setEditingId] = useState(null);
  const [categories] = useState(["Groceries", "Transport", "Entertainment", "Utilities", "Healthcare", "Other"]);
  const { user } = useAuth();
  const totalIncome = records.reduce(
    (sum, record) => sum + (record.type === "INCOME" ? Number(record.amount) : 0),
    0
  );
  const totalExpenses = records.reduce(
    (sum, record) => sum + (record.type === "EXPENSE" ? Number(record.amount) : 0),
    0
  );
  const totalRecords = records.length;

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await recordsAPI.list(filters);
      setRecords(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        type: formData.type.toUpperCase(),
      };

      if (editingId) {
        await recordsAPI.update(editingId, payload);
      } else {
        await recordsAPI.create(payload);
      }

      setFormData({ type: "INCOME", category: "", amount: "", notes: "", date: new Date().toISOString() });
      setEditingId(null);
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (record) => {
    setFormData({
      type: record.type,
      category: record.category,
      amount: record.amount,
      notes: record.notes ?? "",
      date: record.date || new Date().toISOString(),
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await recordsAPI.delete(id);
        fetchRecords();
      } catch (err) {
        setError(err.response?.data?.message || "Delete failed");
      }
    }
  };

  const canEdit = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-lg border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Financial Records</h1>
            <p className="text-sm text-slate-500">Add, filter, and manage spending entries.</p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "✕ Close" : "➕ Add Record"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] bg-gradient-to-r from-indigo-500 to-sky-500 p-6 text-white shadow-lg shadow-sky-500/20">
            <p className="text-sm uppercase tracking-[0.22em] opacity-90">Total records</p>
            <p className="mt-4 text-3xl font-semibold">{totalRecords}</p>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Total income</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-600">+${totalIncome.toFixed(2)}</p>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Total expenses</p>
            <p className="mt-4 text-3xl font-semibold text-rose-600">-${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {showForm && (
          <div className="rounded-[32px] bg-white p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-5">{editingId ? "Edit Record" : "New Record"}</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={formData.date.slice(0, 10)}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).toISOString() })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add notes..."
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  {editingId ? "Update" : "Create"} Record
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ type: "INCOME", category: "", amount: "", notes: "", date: new Date().toISOString() });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-[32px] bg-white p-6 shadow-lg border border-slate-200">
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Min Amount</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Max Amount</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                placeholder="999999"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={() => setFilters({ type: "", category: "", minAmount: "", maxAmount: "" })}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[32px] bg-white p-6 text-center text-slate-500 shadow-lg border border-slate-200">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="rounded-[32px] bg-white p-6 text-center text-slate-500 shadow-lg border border-slate-200">No records found</div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] bg-white shadow-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-semibold tracking-wide">Date</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Type</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Category</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Description</th>
                  <th className="px-4 py-4 font-semibold tracking-wide">Amount</th>
                  {canEdit && <th className="px-4 py-4 font-semibold tracking-wide">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-700">{new Date(record.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                        record.type === "INCOME"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {record.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{record.category}</td>
                    <td className="px-4 py-4 text-slate-600">{record.notes}</td>
                    <td className={`px-4 py-4 font-semibold ${record.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                      {record.type === "INCOME" ? "+" : "-"}${record.amount}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            onClick={() => handleEdit(record)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="rounded-2xl border border-slate-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                            onClick={() => handleDelete(record.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
