import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 mb-6">
              <span className="text-sm uppercase tracking-wider text-cyan-300 font-semibold">FinanceHub</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Sign in to your workspace
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Fast financial operations for modern teams.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition duration-200 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition duration-200 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-700/50 pt-6">
              <p className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 transition hover:text-indigo-300">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <span>Secure</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Fast</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-fuchsia-500" />
              <span>Modern</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
