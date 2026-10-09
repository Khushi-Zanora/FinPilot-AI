import React, { useState } from 'react';
import { Search, Plus, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function WorkspaceHeader({ onNewGoal, onRecordTransaction }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = user?.name || 'Arjun Sharma';

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#05080E]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, accounts, rules... ⌘K"
            className="w-full pl-9 pr-8 py-1.5 bg-[#080D16] border border-white/[0.08] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#05DF85]/60 focus:ring-1 focus:ring-[#05DF85]/20 font-mono transition-all"
          />
        </div>
      </div>

      {/* Right Metadata & Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Currency Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#080D16] border border-white/[0.08] text-[11px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
          <span>INR (₹)</span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin-slow" />
          <span>Updated 2m ago</span>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onNewGoal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-200 border border-white/[0.08] text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-slate-400" />
          <span>New Goal</span>
        </button>

        <button
          onClick={onRecordTransaction}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Record Transaction</span>
        </button>

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#05DF85] text-slate-950 text-[9px] font-bold font-mono flex items-center justify-center">
            3
          </span>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-800 p-0.5 ring-1 ring-white/10 shrink-0">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-emerald-300">
            {displayName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
