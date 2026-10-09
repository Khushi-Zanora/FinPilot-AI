import React, { useState } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Layers,
  CheckCircle2,
  Sparkles,
  Download,
  CreditCard,
  Tv,
  Cloud,
  Zap,
  ShieldCheck,
  Building,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Sliders,
  X
} from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tier');
  const [autoRenew, setAutoRenew] = useState(true);

  // 3rd Party Subscriptions Tracker Data
  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub-1', name: 'Netflix 4K UHD', category: 'Streaming', cost: 649, billing: 'Monthly', nextDue: '18 Nov 2024', card: 'HDFC Regalia ••4912', overlap: false },
    { id: 'sub-2', name: 'Apple One Premier', category: 'Cloud & Music', cost: 365, billing: 'Monthly', nextDue: '22 Nov 2024', card: 'HDFC Regalia ••4912', overlap: true, overlapNote: 'Duplicate 200GB iCloud with AWS Sandbox' },
    { id: 'sub-3', name: 'AWS Personal Sandbox', category: 'Cloud Dev', cost: 1250, billing: 'Monthly', nextDue: '01 Dec 2024', card: 'ICICI CC ••0188', overlap: true, overlapNote: 'Underutilized dev instance' },
    { id: 'sub-4', name: 'Spotify Individual', category: 'Audio', cost: 119, billing: 'Monthly', nextDue: '14 Nov 2024', card: 'HDFC Regalia ••4912', overlap: false },
    { id: 'sub-5', name: 'GitHub Copilot Pro', category: 'Developer Tool', cost: 830, billing: 'Monthly', nextDue: '28 Nov 2024', card: 'HDFC Diners ••4921', overlap: false },
    { id: 'sub-6', name: 'Cult.Fit Elite Gym', category: 'Fitness', cost: 1499, billing: 'Monthly', nextDue: '10 Dec 2024', card: 'ICICI Salary ••8188', overlap: false },
    { id: 'sub-7', name: 'ACT Fibernet 1Gbps', category: 'Utilities', cost: 1179, billing: 'Monthly', nextDue: '14 Nov 2024', card: 'Auto-Debit', overlap: false },
    { id: 'sub-8', name: 'Google One 2TB', category: 'Cloud Storage', cost: 650, billing: 'Monthly', nextDue: '05 Dec 2024', card: 'ICICI CC ••0188', overlap: false },
    { id: 'sub-9', name: 'ChatGPT Plus', category: 'AI Tools', cost: 1999, billing: 'Monthly', nextDue: '19 Nov 2024', card: 'HDFC Diners ••4921', overlap: false }
  ]);

  const totalMonthlySubBurn = subscriptions.reduce((acc, s) => acc + s.cost, 0);

  const downloadInvoicesZIP = () => {
    const invoiceSummary = `FINPILOT PRO GST TAX INVOICES\nAccount: ${user?.email || 'arjun@finpilot.io'}\nGSTIN: 27AABCF1234F1Z5\nPlan: FinPilot Pro Annual (₹4,999 + 18% GST)\nDate: 14 Nov 2024\nStatus: PAID`;
    const blob = new Blob([invoiceSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinPilot_GST_Invoices_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Title Bar & Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">MEMBERSHIP & ACCOUNT CONTROLS</span>
              <span className="text-slate-600">//</span>
              <span>GST COMPLIANT (IN)</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Subscriptions, Billing & Settings
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadInvoicesZIP}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-300 border border-white/[0.08] text-xs font-mono transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download GST Invoices</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080D16] border border-white/[0.08] text-xs font-mono overflow-x-auto">
          {[
            { id: 'tier', label: '1. Subscriptions & FinPilot Pro Tier' },
            { id: 'tracker', label: `2. Third-Party Subscriptions Tracker (${subscriptions.length})` },
            { id: 'invoices', label: '3. Payment Methods & Invoices' },
            { id: 'profile', label: '4. Profile & Preferences' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#05DF85] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Subscriptions & FinPilot Pro Tier */}
        {activeTab === 'tier' && (
          <div className="space-y-6">
            {/* Active Plan Hero Card */}
            <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                    ACTIVE VAULT TIER • 35% ANNUAL SAVINGS APPLIED
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  FinPilot Pro (Annual Executive Plan)
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Multi-broker sync, unlimited AI Copilot queries, loan prepayment engine, and automated sinking pool cushions.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                  <span>Next Billing: <strong className="text-white">14 Nov 2025</strong></span>
                  <span>•</span>
                  <span>Charged to: <strong className="text-white">HDFC Diners Club ••4921</strong></span>
                  <span>•</span>
                  <span className="text-[#05DF85] font-bold">Status: Active</span>
                </div>
              </div>

              {/* Price & Auto-renew Box */}
              <div className="p-5 rounded-xl bg-[#0D1422] border border-white/[0.06] text-right shrink-0 space-y-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">BILLED ANNUALLY</div>
                  <div className="text-3xl font-mono font-bold text-white">₹4,999<span className="text-sm font-normal text-slate-400"> / year</span></div>
                  <div className="text-[11px] font-mono text-[#05DF85] mt-0.5">₹416.58 / mo effective rate</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04] text-xs font-mono text-slate-300">
                  <span>Auto-renew</span>
                  <button
                    onClick={() => setAutoRenew(!autoRenew)}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${autoRenew ? 'bg-[#05DF85]' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${autoRenew ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Membership Tiers Comparison Grid */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-slate-400">
                FINPILOT MEMBERSHIP TIERS (PRICES EXCLUDE 18% INDIAN GST)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Free Tier */}
                <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>TIER 01</span>
                      <span>BASE LEVEL</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">FinPilot Free</h3>
                    <p className="text-xs text-slate-400">Essential personal ledger for individuals tracking accounts manually.</p>

                    <div className="text-3xl font-mono font-bold text-white">
                      ₹0<span className="text-xs font-normal text-slate-500"> / lifetime</span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs text-slate-300">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-500" /><span>1 Bank Account Sync</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-500" /><span>30-Day Historical Transactions</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-500" /><span>Basic Net Worth Snapshot</span></div>
                      <div className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4" /><span>No AI Financial Copilot</span></div>
                    </div>
                  </div>

                  <button disabled className="w-full py-2.5 rounded-xl bg-[#0D1422] text-slate-500 font-bold text-xs cursor-not-allowed">
                    Default Tier
                  </button>
                </div>

                {/* Pro Tier (Active) */}
                <div className="p-6 rounded-2xl bg-[#080D16] border-2 border-[#05DF85] shadow-[0_0_30px_rgba(5,223,133,0.15)] flex flex-col justify-between space-y-5 relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#05DF85] font-bold">TIER 02 • RECOMMENDED</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#05DF85] font-bold">ACTIVE PLAN</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">FinPilot Pro</h3>
                    <p className="text-xs text-slate-400">Autonomous personal intelligence and multi-asset wealth tracking.</p>

                    <div className="text-3xl font-mono font-bold text-[#05DF85]">
                      ₹4,999<span className="text-xs font-normal text-slate-400"> / year (or ₹599/mo)</span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs text-slate-200">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#05DF85]" /><span>Multi-Bank & Demat Portfolio Sync</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#05DF85]" /><span>Unlimited FinPilot AI Financial Copilot</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#05DF85]" /><span>Debt & Home Loan Prepayment Engine</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#05DF85]" /><span>Automated Sinking Pool Allocations</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#05DF85]" /><span>GST Tax Invoices & Section 80C Audits</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Manage Pro Plan subscription')}
                    className="w-full py-2.5 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md"
                  >
                    Manage Pro Renewal
                  </button>
                </div>

                {/* Family Tier */}
                <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>TIER 03 • EXPANSION</span>
                      <span className="text-cyan-400 font-bold">UPGRADE</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">Family & Wealth Office</h3>
                    <p className="text-xs text-slate-400">Multi-PAN family control, legal nominee dispatch & CA tax portal.</p>

                    <div className="text-3xl font-mono font-bold text-white">
                      ₹8,999<span className="text-xs font-normal text-slate-500"> / year</span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs text-slate-300">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span>Multi-PAN Consolidation (Up to 4 Members)</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span>Estate & Nominee Legal Vault Dispatch</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span>Dedicated CA (Chartered Accountant) Portal</span></div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span>Priority Concierge Support</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Upgrade to Family Plan initiated')}
                    className="w-full py-2.5 rounded-xl bg-[#0D1422] hover:bg-[#121B2B] text-white border border-white/[0.08] font-bold text-xs"
                  >
                    Upgrade to Family Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Third-Party Subscriptions Tracker */}
        {activeTab === 'tracker' && (
          <div className="space-y-5">
            {/* Summary Bar */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Third-Party Subscriptions Tracker</h3>
                <p className="text-xs text-slate-400">Identifies active recurring SaaS, streaming, and gym memberships across cards.</p>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="text-xs text-slate-400">TOTAL RECURRING MONTHLY BURN</div>
                <div className="text-2xl font-bold text-[#05DF85]">₹{totalMonthlySubBurn.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400"> / mo</span></div>
              </div>
            </div>

            {/* Overlap / Leakage Alert */}
            <div className="p-4 rounded-xl bg-[#0D1422] border border-amber-500/30 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Recurring Leakage Detected (₹1,615/mo Potential Savings)</strong>
                <span>Overlapping cloud storage detected between Apple One Premier (200GB iCloud) and AWS Personal Sandbox. Canceling unused cloud sandbox saves ₹15,000 annually.</span>
              </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptions.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    s.overlap ? 'bg-[#080D16] border-amber-500/30' : 'bg-[#080D16] border-white/[0.08]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{s.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400">
                        {s.category}
                      </span>
                    </div>

                    <div className="text-xl font-mono font-bold text-white mb-2">
                      ₹{s.cost}<span className="text-xs font-normal text-slate-400"> / mo</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                      <div>Card: {s.card}</div>
                      <div>Next Due: <strong className="text-slate-300">{s.nextDue}</strong></div>
                    </div>

                    {s.overlap && (
                      <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-500/10 p-1.5 rounded">
                        ⚠️ {s.overlapNote}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#05DF85]">Active</span>
                    <button
                      onClick={() => alert(`Review subscription: ${s.name}`)}
                      className="text-slate-400 hover:text-white"
                    >
                      Manage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Payment Methods & Invoices */}
        {activeTab === 'invoices' && (
          <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4 font-mono text-xs">
            <h3 className="text-base font-bold text-white font-sans">Payment Methods & Invoices</h3>
            <div className="p-4 rounded-xl bg-[#0D1422] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#05DF85]" />
                <div>
                  <div className="font-bold text-white">HDFC Diners Club Black ••4921</div>
                  <div className="text-[10px] text-slate-400">Expires 08/28 • Primary Card</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold">DEFAULT</span>
            </div>

            <div className="pt-2">
              <div className="text-xs text-slate-400 mb-2 font-bold uppercase">PAST INVOICES</div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.04] flex items-center justify-between">
                  <span>14 Nov 2024 • FinPilot Pro Annual</span>
                  <span className="text-white font-bold">₹4,999 + 18% GST (₹5,898.82)</span>
                  <button onClick={downloadInvoicesZIP} className="text-[#05DF85] hover:underline">Download PDF</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Profile & Preferences */}
        {activeTab === 'profile' && (
          <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4 text-xs font-sans">
            <h3 className="text-base font-bold text-white">Profile & Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">ACCOUNT NAME</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || 'Arjun Sharma'}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">EMAIL ADDRESS</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'arjun@finpilot.io'}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
