import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export function ProtectedRoute({ requirePro = false }) {
  const { user, loading, isPremium } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading FinPilot session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requirePro && !isPremium) {
    return <Navigate to="/workspace/billing" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
