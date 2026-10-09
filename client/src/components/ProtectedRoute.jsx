import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';

export function ProtectedRoute({ requirePro = false }) {
  const { user, loading, isPremium } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-400">Synchronizing FinPilot Telemetry...</span>
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
    <div className="min-h-screen bg-[#05080E] text-slate-100 flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}
