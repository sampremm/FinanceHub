import { useAuth } from "../context/AuthContext";
import { useNavigate, NavLink, Link } from "react-router-dom";

const navButton = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-slate-100 text-slate-950" : "text-slate-200 hover:bg-slate-800 hover:text-white"
  }`;

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/10 border-b border-slate-800/80">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-500 px-4 py-2 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-95">
            FinanceHub
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Finance operations for fast teams</span>
        </div>

        <ul className="flex flex-wrap items-center gap-3">
          <li>
            <NavLink to="/" end className={navButton}>
              📈 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/records" className={navButton}>
              📊 Records
            </NavLink>
          </li>
          {user?.role === "ADMIN" && (
            <li>
              <NavLink to="/users" className={navButton}>
                👥 Users
              </NavLink>
            </li>
          )}
        </ul>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm">
            <span className="font-semibold">{user?.name}</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase tracking-[0.22em] text-slate-100">
              {user?.role}
            </span>
          </div>
          <button
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
