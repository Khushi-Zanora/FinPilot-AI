import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  PieChart,
  Target,
  Landmark,
  TrendingUp,
  ShieldCheck,
  Bot,
  CreditCard,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { isPremium } = useAuth();

  const navItems = [
    { to: '/workspace/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workspace/transactions', label: 'Transactions', icon: ReceiptText },
    { to: '/workspace/accounts', label: 'Accounts', icon: Wallet },
    { to: '/workspace/budgets', label: 'Budgets', icon: PieChart },
    { to: '/workspace/goals', label: 'Savings Goals', icon: Target },
    { to: '/workspace/loans', label: 'Loans & EMI', icon: Landmark, isPro: true },
    { to: '/workspace/investments', label: 'Investments', icon: TrendingUp, isPro: true },
    { to: '/workspace/insurance', label: 'Insurance', icon: ShieldCheck, isPro: true },
    { to: '/workspace/ai', label: 'AI Analyst', icon: Bot, isHighlight: true },
    { to: '/workspace/billing', label: 'Subscription', icon: CreditCard },
    { to: '/workspace/profile', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/95 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                } ${item.isHighlight && !isActive ? 'text-emerald-300' : ''}`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.isHighlight ? 'text-emerald-400' : ''}`} />
                <span>{item.label}</span>
              </div>

              {item.isPro && !isPremium && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  PRO
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Pro Upgrade Banner inside Sidebar if user is Free */}
      {!isPremium && (
        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Unlock Pro Features</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Get Loan Amortization, Portfolio Tracking, and full AI Financial Analyst capabilities for ₹99/mo.
          </p>
          <NavLink
            to="/workspace/billing"
            className="block text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow"
          >
            Upgrade Now
          </NavLink>
        </div>
      )}
    </aside>
  );
}
