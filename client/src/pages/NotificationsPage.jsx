import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest } from '../api/client.js';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  CreditCard,
  Shield,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/notifications');
      if (res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Title Bar */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
            <span className="text-[#05DF85] font-semibold">SYSTEM TELEMETRY</span>
            <span className="text-slate-600">//</span>
            <span>NOTIFICATIONS & FINANCIAL ALERTS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-400">
            Real-time reminders for scheduled loan EMIs, insurance renewals, and spending budget thresholds.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Checking system telemetry...</p>
          </div>
        ) : notifications.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">All Caught Up!</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You have no pending financial alerts or scheduled due dates.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isWarning = n.type === 'warning' || n.type === 'alert';
              const isReminder = n.type === 'reminder';

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isWarning
                      ? 'bg-rose-500/[0.03] border-rose-500/20'
                      : isReminder
                      ? 'bg-cyan-500/[0.03] border-cyan-500/20'
                      : 'bg-[#080D16] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isWarning
                          ? 'bg-rose-500/10 text-rose-400'
                          : isReminder
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'bg-emerald-500/10 text-[#05DF85]'
                      }`}
                    >
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isReminder ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">{n.title}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  </div>

                  {n.actionLink && (
                    <Link
                      to={n.actionLink}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 self-start sm:self-center"
                    >
                      <span>{n.actionLabel || 'View Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
