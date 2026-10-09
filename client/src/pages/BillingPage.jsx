import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  Layers,
  CheckCircle2,
  Sparkles,
  Download,
  CreditCard,
  Zap,
  ShieldCheck,
  Building,
  Plus,
  Trash2,
  ArrowRight,
  X
} from 'lucide-react';

export default function BillingPage() {
  const { user, setUser, isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState('tier');
  const [billingCycle, setBillingCycle] = useState('annual');
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState('');

  // 3rd party subscriptions / recurring bills
  const [recurringBills, setRecurringBills] = useState([]);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [subForm, setSubForm] = useState({
    name: '',
    category: 'Entertainment',
    amount: '',
    frequency: 'monthly'
  });

  const handleUpgrade = async (planId) => {
    setUpgrading(true);
    setMessage('');

    try {
      const selectedPlanId = planId || (billingCycle === 'annual' ? 'premium_yearly' : 'premium_monthly');

      // 1. Create order
      const orderRes = await apiRequest('/billing/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlanId })
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error('Failed to create subscription order.');
      }

      const { orderId } = orderRes.data;

      // 2. Verify payment (in mock/test mode this executes instantaneously)
      const verifyRes = await apiRequest('/billing/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature_valid',
          planId: selectedPlanId
        })
      });

      if (verifyRes.success && verifyRes.data?.user) {
        setUser(verifyRes.data.user);
        setMessage('🎉 Congratulations! You have successfully upgraded to FinPilot Premium.');
      }
    } catch (err) {
      setMessage(`❌ Upgrade failed: ${err.message}`);
    } finally {
      setUpgrading(false);
    }
  };

  const handleAddRecurringBill = (e) => {
    e.preventDefault();
    if (!subForm.name || !subForm.amount) return;

    const amt = parseFloat(subForm.amount);
    const newBill = {
      id: `rec-${Date.now()}`,
      name: subForm.name,
      category: subForm.category,
      amount: amt,
      frequency: subForm.frequency
    };

    setRecurringBills([...recurringBills, newBill]);
    setShowAddSubModal(false);
    setSubForm({ name: '', category: 'Entertainment', amount: '', frequency: 'monthly' });
  };

  const handleDeleteRecurring = (id) => {
    setRecurringBills(recurringBills.filter((b) => b.id !== id));
  };

  const totalMonthlySub = recurringBills.reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Title Bar */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
            <span className="text-[#05DF85] font-semibold">ACCOUNT & ENTITLEMENTS</span>
            <span className="text-slate-600">//</span>
            <span>MEMBERSHIP TIERS & RECURRING BILLS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Subscriptions & Billing
          </h1>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* 2 Main Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080D16] border border-white/[0.08] text-xs font-mono w-fit">
          <button
            onClick={() => setActiveTab('tier')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'tier' ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. FinPilot Membership Tier
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'tracker' ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Recurring Subscriptions Tracker ({recurringBills.length})
          </button>
        </div>

        {activeTab === 'tier' ? (
          <div className="space-y-6">
            {/* Current Status Card */}
            <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase text-slate-400">YOUR CURRENT PLAN</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{isPremium ? 'FinPilot Pro Active' : 'Free Standard Tier'}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isPremium ? 'bg-emerald-500/20 text-[#05DF85] border-emerald-500/30' : 'bg-white/[0.05] text-slate-400 border-white/[0.08]'}`}>
                    {isPremium ? 'PRO' : 'FREE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isPremium
                    ? 'Full access to AI Financial Analyst, loan debt prepayment schedules, and unlimited accounts.'
                    : 'Core integer-paise accounting ledger and manual transaction tracking.'}
                </p>
              </div>

              {!isPremium && (
                <button
                  onClick={() => handleUpgrade('premium_yearly')}
                  disabled={upgrading}
                  className="px-5 py-2.5 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)] shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade to Pro →'}
                </button>
              )}
            </div>

            {/* Plan Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Free Tier */}
              <div className="p-6 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Free Standard Tier</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Essential personal accounting</p>
                  </div>

                  <div className="text-2xl font-mono font-bold text-white">₹0<span className="text-sm text-slate-400 font-normal"> / forever</span></div>

                  <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>Integer minor-unit paise arithmetic (0 rounding errors)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>Tracked bank accounts and manual cash vaults</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>Transactions ledger with income and expense categorization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>Basic savings targets and monthly category caps</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.04] text-center text-xs text-slate-400">
                  {user?.plan === 'free' ? 'Currently Active Plan' : 'Free Tier'}
                </div>
              </div>

              {/* Pro Tier */}
              <div className="p-6 rounded-2xl bg-[#080D16] border border-emerald-500/30 space-y-5 flex flex-col justify-between relative shadow-[0_0_30px_rgba(5,223,133,0.08)]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">FinPilot Pro</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Complete intelligence & liability planning</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-[#05DF85] border border-emerald-500/30">
                      RECOMMENDED
                    </span>
                  </div>

                  <div className="text-2xl font-mono font-bold text-white">
                    ₹499<span className="text-sm text-slate-400 font-normal"> / month (or ₹4,999/year)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>Deterministic AI Financial Analyst with auditable formulas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>Loan prepayment schedule & interest savings calculator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>Safe-to-Spend multi-obligation isolation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#05DF85] shrink-0" />
                      <span>CSV ledger exports and full reporting analytics</span>
                    </li>
                  </ul>
                </div>

                {isPremium ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-[#05DF85]">
                    ✓ Pro Membership Active
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade('premium_yearly')}
                    disabled={upgrading}
                    className="w-full py-3 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)] disabled:opacity-50 cursor-pointer"
                  >
                    {upgrading ? 'Upgrading...' : 'Upgrade to FinPilot Pro'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Recurring Subscriptions Tracker Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Recurring Subscriptions & Bills</h3>
                <p className="text-xs text-slate-400">Track third-party monthly services (Netflix, Spotify, Gym, Broadband)</p>
              </div>

              <button
                onClick={() => setShowAddSubModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Subscription</span>
              </button>
            </div>

            {recurringBills.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">No Recurring Bills Tracked Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Add streaming services, gym memberships, or broadband bills to monitor recurring monthly outflows.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSubModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#05DF85] text-slate-950 font-bold text-xs"
                >
                  + Add First Bill
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">Total Monthly Subscriptions Outflow:</span>
                  <span className="text-xl font-bold text-rose-400">₹{totalMonthlySub.toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recurringBills.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{b.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">{b.category} • {b.frequency}</div>
                        <div className="text-sm font-mono font-bold text-white pt-1">₹{b.amount.toLocaleString('en-IN')}</div>
                      </div>

                      <button
                        onClick={() => handleDeleteRecurring(b.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddSubModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white">Add Recurring Subscription</h3>
              <button onClick={() => setShowAddSubModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddRecurringBill} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Service / Bill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, Gym, ACT Fibernet"
                  value={subForm.name}
                  onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monthly Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 649.00"
                    value={subForm.amount}
                    onChange={(e) => setSubForm({ ...subForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={subForm.category}
                    onChange={(e) => setSubForm({ ...subForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="Entertainment">Entertainment</option>
                    <option value="Streaming">Streaming</option>
                    <option value="Cloud Storage">Cloud Storage</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Software">Software & AI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
