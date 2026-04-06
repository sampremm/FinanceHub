import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../api/api";

export default function Dashboard() {
  const { isAnalyst } = useAuth();
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [userSpending, setUserSpending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const requests = [
        dashboardAPI.overview(),
        dashboardAPI.categories(),
        dashboardAPI.monthlyTrends(6),
        dashboardAPI.recentActivity(10),
      ];

      if (isAnalyst) {
        requests.push(dashboardAPI.userSpending());
      }

      const responses = await Promise.all(requests);
      const [overviewRes, categoriesRes, trendsRes, activityRes] = responses;
      const userSpendingRes = isAnalyst ? responses[4] : null;

      setOverview(overviewRes.data.data);
      setCategories(categoriesRes.data.data);
      setMonthlyTrends(trendsRes.data.data);
      setRecentActivity(activityRes.data.data);
      if (isAnalyst && userSpendingRes) {
        setUserSpending(userSpendingRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="rounded-3xl bg-white/90 px-8 py-10 shadow-2xl shadow-slate-400/10 text-slate-700">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="rounded-3xl bg-red-50 border border-red-200 px-8 py-10 text-red-700 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="flex flex-col gap-6 rounded-[32px] bg-white/95 border border-slate-200 p-6 shadow-2xl shadow-slate-400/5 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">Workspace analytics</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Finance Dashboard
              </h1>
              <p className="mt-4 text-sm text-slate-500">Monitor revenue, expense, and team spend performance with a polished product experience.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">Workspace: FinanceHub</div>
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 to-sky-500 p-6 text-white shadow-lg shadow-sky-500/20">
              <p className="text-sm uppercase tracking-[0.25em] opacity-90">Total Income</p>
              <p className="mt-5 text-3xl font-bold">${overview?.totalIncome || 0}</p>
            </div>
            <div className="rounded-[28px] bg-gradient-to-br from-pink-500 to-rose-400 p-6 text-white shadow-lg shadow-rose-500/20">
              <p className="text-sm uppercase tracking-[0.25em] opacity-90">Total Expenses</p>
              <p className="mt-5 text-3xl font-bold">${overview?.totalExpenses || 0}</p>
            </div>
            <div className="rounded-[28px] bg-gradient-to-br from-cyan-500 to-emerald-400 p-6 text-white shadow-lg shadow-cyan-500/20">
              <p className="text-sm uppercase tracking-[0.25em] opacity-90">Net Balance</p>
              <p className="mt-5 text-3xl font-bold">${overview?.netBalance || 0}</p>
            </div>
            <div className="rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg shadow-slate-900/20">
              <p className="text-sm uppercase tracking-[0.25em] opacity-90">Total Records</p>
              <p className="mt-5 text-3xl font-bold">{overview?.totalRecords || 0}</p>
            </div>
          </div>
        </div>

        {isAnalyst && (
          <div className="rounded-[32px] bg-white/95 border border-slate-200 p-6 shadow-2xl shadow-slate-400/5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">User Spend Breakdown</h2>
                <p className="text-sm text-slate-500">Analyze spending performance by user.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Total Income</th>
                    <th className="px-4 py-3">Total Expenses</th>
                    <th className="px-4 py-3">Net</th>
                    <th className="px-4 py-3">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {userSpending.length > 0 ? (
                    userSpending.map((user) => (
                      <tr key={user.userId} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{user.userName}</td>
                        <td className="px-4 py-4">${user.totalIncome.toFixed(2)}</td>
                        <td className="px-4 py-4">${user.totalExpenses.toFixed(2)}</td>
                        <td className={`px-4 py-4 font-semibold ${user.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          ${user.netBalance.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">{user.recordCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                        No user spending data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[32px] bg-white/95 border border-slate-200 p-6 shadow-2xl shadow-slate-400/5">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Category Breakdown</h2>
                <p className="text-sm text-slate-500">See which categories are driving revenue and spend.</p>
              </div>
            </div>
            <div className="space-y-5">
              {categories && categories.length > 0 ? (
                categories.map((cat, index) => (
                  <div key={cat.category} className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{cat.category}</p>
                        <p className="text-sm text-slate-500">{cat.count} records</p>
                      </div>
                      <p className="font-semibold text-slate-900">${cat.total}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        style={{ width: `${(cat.total / (categories[0]?.total || 1)) * 100}%` }}
                        className={`h-full rounded-full ${index % 2 === 0 ? "bg-gradient-to-r from-indigo-500 to-sky-400" : "bg-gradient-to-r from-fuchsia-500 to-rose-400"}`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No categories found</p>
              )}
            </div>
          </div>

          <div className="rounded-[32px] bg-white/95 border border-slate-200 p-6 shadow-2xl shadow-slate-400/5">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Monthly Trends (6 Months)</h2>
                <p className="text-sm text-slate-500">Visual trends for income and expense.</p>
              </div>
            </div>
            <div className="min-h-[240px] overflow-hidden rounded-3xl bg-slate-50 p-4">
              <div className="flex h-full items-end gap-4">
                {monthlyTrends && monthlyTrends.length > 0 ? (
                  monthlyTrends.map((trend) => (
                    <div key={trend.month} className="flex w-full flex-col items-center gap-3">
                      <div className="flex h-[140px] w-full items-end gap-2">
                        <div
                          className="h-full flex-1 rounded-t-3xl bg-gradient-to-b from-emerald-500 to-emerald-300"
                          style={{ height: `${Math.min(100, (trend.income / 20000) * 100)}%` }}
                          title={`Income: $${trend.income}`}
                        />
                        <div
                          className="h-full flex-1 rounded-t-3xl bg-gradient-to-b from-rose-500 to-rose-300"
                          style={{ height: `${Math.min(100, (trend.expenses / 20000) * 100)}%` }}
                          title={`Expense: $${trend.expenses}`}
                        />
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {trend.month.slice(0, 3)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No trends data</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white/95 border border-slate-200 p-6 shadow-2xl shadow-slate-400/5">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
              <p className="text-sm text-slate-500">Recent financial records across the app.</p>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex flex-col gap-3 rounded-3xl bg-slate-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                      {activity.type.toUpperCase()}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{activity.notes || activity.category}</p>
                    <span className="text-sm text-slate-500">{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${activity.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                      {activity.type === "INCOME" ? "+" : "-"}${activity.amount}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
