import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 mb-6">
              <span className="text-sm uppercase tracking-wider text-cyan-300 font-semibold">FinanceHub</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Get started with FinanceHub
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Create your workspace in minutes.
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
                <label htmlFor="name" className="block text-sm font-semibold text-slate-200">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition duration-200 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20"
                />
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-200">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition duration-200 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-700/50 pt-6">
              <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 transition hover:text-indigo-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Simple setup</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <span>Instant access</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-fuchsia-500" />
              <span>Team ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
