import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Landmark,
  ReceiptText,
  PieChart,
  Target,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Bot,
  BarChart3,
  Bell,
  Layers,
  Settings,
  LogOut,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { user, isPremium, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'CORE',
      items: [
        { to: '/workspace/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/workspace/accounts', label: 'Accounts', icon: Landmark },
        { to: '/workspace/transactions', label: 'Transactions', icon: ReceiptText },
        { to: '/workspace/budgets', label: 'Budgets & Spending', icon: PieChart },
        { to: '/workspace/goals', label: 'Savings Goals', icon: Target },
      ]
    },
    {
      title: 'WEALTH & PROTECTION',
      badge: 'PRO',
      items: [
        { to: '/workspace/loans', label: 'Loans & EMIs', icon: CreditCard },
        { to: '/workspace/investments', label: 'Investments', icon: TrendingUp },
        { to: '/workspace/insurance', label: 'Insurance', icon: ShieldCheck },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { to: '/workspace/ai', label: 'AI Analyst', icon: Bot, pill: 'Smart' },
        { to: '/workspace/reports', label: 'Reports & Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { to: '/workspace/notifications', label: 'Notifications', icon: Bell },
        { to: '/workspace/billing', label: 'Subscriptions & Billing', icon: Layers },
        { to: '/workspace/profile', label: 'Settings', icon: Settings },
      ]
    }
  ];

  // Live burn meter calculation (₹48,250 of ₹65,000 = 74.2%)
  const currentBurn = 48250;
  const burnCap = 65000;
  const burnPercent = 74.2;

  const displayName = user?.name || 'Arjun Sharma';
  const displayEmail = user?.email || 'arjun@finpilot.io';

  return (
    <aside className="w-64 bg-[#05080E] border-r border-white/[0.08] flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto select-none font-sans z-30">
      {/* Brand Header */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-white/[0.06]">
        <NavLink to="/workspace/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(5,223,133,0.15)]">
            <Landmark className="w-4 h-4 text-[#05DF85]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-white text-base">FinPilot</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#05DF85] border border-emerald-500/30">
              PRO
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-5 flex-1">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between font-semibold">
              <span>{section.title}</span>
              {section.badge && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                  {section.badge}
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#05DF85] text-slate-950 font-bold shadow-[0_0_20px_rgba(5,223,133,0.25)]'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>

                        {item.pill && (
                          <span
                            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                              isActive
                                ? 'bg-slate-950/20 text-slate-950'
                                : 'bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20'
                            }`}
                          >
                            {item.pill}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Burn Gauge Card */}
      <div className="p-3 border-t border-white/[0.06] bg-[#080D16]">
        <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Monthly Burn</span>
            <span className="font-mono text-[#05DF85] font-bold">{burnPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-[#05DF85] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(5,223,133,0.5)]"
              style={{ width: `${Math.min(burnPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <span>₹{currentBurn.toLocaleString('en-IN')}</span>
            <span className="text-slate-500">₹{burnCap.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Arjun Sharma / User Card */}
        <div className="mt-2.5 p-2 rounded-lg bg-[#0D1422] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center text-slate-950 font-bold text-xs ring-1 ring-white/10 shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] font-mono text-slate-500 truncate leading-tight">
                {displayEmail}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/workspace/profile"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/[0.05] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
