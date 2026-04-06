import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import Users from "./pages/Users";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute role="ADMIN"><Users /></ProtectedRoute>} />
          <Route
            path="/unauthorized"
            element={
              <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
                {/* Gradient orbs */}
                <div className="absolute -right-20 top-10 size-96 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 size-96 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 opacity-20 blur-3xl"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center">
                  {/* Icon */}
                  <div className="flex size-16 items-center justify-center rounded-full bg-rose-500/10 backdrop-blur-xl">
                    <svg className="size-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M12 3c-6.627 0-10 3-10 9s3.373 9 10 9 10-3 10-9-3.373-9-10-9z" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-4xl font-bold text-white">Access Denied</h2>
                    <p className="mt-2 text-slate-400">You don&apos;t have permission to access this page</p>
                  </div>

                  <p className="max-w-md text-sm text-slate-500">
                    This resource requires special permissions. Please contact your administrator if you believe this is an error.
                  </p>

                  <a
                    href="/"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-8 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-indigo-500/50"
                  >
                    <span>← Go Back Home</span>
                  </a>
                </div>
              </div>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
