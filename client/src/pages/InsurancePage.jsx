import React, { useState, useEffect } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { apiRequest, formatCurrency } from '../api/client.js';
import {
  ShieldCheck,
  Shield,
  HeartPulse,
  Car,
  Sparkles,
  Plus,
  Calendar,
  Trash2,
  X
} from 'lucide-react';

export default function InsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [polForm, setPolForm] = useState({
    name: '',
    policyNumber: '',
    provider: '',
    type: 'health',
    sumAssured: '',
    premiumAmount: '',
    premiumFrequency: 'annual',
    renewalDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  async function loadPolicies() {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/insurance');
      if (res.success && res.data?.policies) {
        setPolicies(res.data.policies);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load insurance policies.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!polForm.name || !polForm.sumAssured) return;

    setSubmitting(true);
    setError('');

    try {
      const sumAssuredPaise = Math.round(parseFloat(polForm.sumAssured) * 100);
      const premiumAmountPaise = Math.round(parseFloat(polForm.premiumAmount || '0') * 100);

      const res = await apiRequest('/insurance', {
        method: 'POST',
        body: JSON.stringify({
          name: polForm.name.trim(),
          policyNumber: polForm.policyNumber.trim() || `POL-${Date.now().toString().slice(-6)}`,
          provider: polForm.provider.trim() || 'Insurance Provider',
          type: polForm.type,
          sumAssuredPaise,
          premiumAmountPaise,
          premiumFrequency: polForm.premiumFrequency,
          renewalDate: polForm.renewalDate ? new Date(polForm.renewalDate).toISOString() : null
        })
      });

      if (res.success) {
        setShowAddModal(false);
        setPolForm({
          name: '',
          policyNumber: '',
          provider: '',
          type: 'health',
          sumAssured: '',
          premiumAmount: '',
          premiumFrequency: 'annual',
          renewalDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        });
        await loadPolicies();
      }
    } catch (err) {
      setError(err.message || 'Failed to add insurance policy.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePolicy = async (id, name) => {
    if (!window.confirm(`Delete policy "${name}"?`)) return;
    try {
      await apiRequest(`/insurance/${id}`, { method: 'DELETE' });
      await loadPolicies();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    if (activeTab === 'all') return true;
    return p.type === activeTab;
  });

  const totalSumAssuredPaise = policies.reduce((acc, p) => acc + (p.sumAssuredPaise || 0), 0);
  const totalAnnualPremiumPaise = policies.reduce((acc, p) => acc + (p.premiumAmountPaise || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">RISK MITIGATION</span>
              <span className="text-slate-600">//</span>
              <span>INSURANCE POLICIES & COVERAGE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Insurance & Protection Coverage
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Policy</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* 3 Real KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-slate-400 mb-1">TOTAL SUM ASSURED</div>
            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(totalSumAssuredPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {policies.length} active insurance policies
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-[#05DF85] mb-1">ANNUAL COMMITTED PREMIUM</div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">{formatCurrency(totalAnnualPremiumPaise)}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Amortized in your 30-day obligations
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="text-[11px] font-mono uppercase text-cyan-400 mb-1">PROTECTION AUDIT</div>
            <div className="text-2xl font-mono font-bold text-white">
              {policies.length === 0 ? 'Unprotected' : 'Active'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              Life, health, and asset policies
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080D16] border border-white/[0.08] text-xs font-mono w-fit">
          {[
            { id: 'all', label: `All (${policies.length})` },
            { id: 'life', label: 'Life & Term' },
            { id: 'health', label: 'Health Mediclaim' },
            { id: 'vehicle', label: 'Vehicle' },
            { id: 'home', label: 'Home / Property' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Loading policy records...</p>
          </div>
        ) : filteredPolicies.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 rounded-2xl bg-[#080D16] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Insurance Policies Recorded</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Add your term life insurance, health mediclaim, auto policy, or property coverage to monitor renewal dates and premiums.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(5,223,133,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add First Policy</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPolicies.map((pol) => (
              <div
                key={pol._id}
                className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{pol.name}</h4>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">
                        {pol.provider} • {pol.type}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePolicy(pol._id, pol.name)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Sum Assured</span>
                      <strong className="text-white">{formatCurrency(pol.sumAssuredPaise)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Premium</span>
                      <strong className="text-[#05DF85]">{formatCurrency(pol.premiumAmountPaise)}/{pol.premiumFrequency}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Policy #{pol.policyNumber}</span>
                  <span>Due: {pol.renewalDate ? new Date(pol.renewalDate).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#080D16] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#05DF85]" />
                <span>Add Insurance Policy</span>
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Policy Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata AIA Term Life, HDFC ERGO Health"
                  value={polForm.name}
                  onChange={(e) => setPolForm({ ...polForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Provider</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata AIA, HDFC ERGO"
                    value={polForm.provider}
                    onChange={(e) => setPolForm({ ...polForm, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={polForm.type}
                    onChange={(e) => setPolForm({ ...polForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="life">Term Life</option>
                    <option value="health">Health / Mediclaim</option>
                    <option value="vehicle">Vehicle (Auto)</option>
                    <option value="home">Home / Property</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sum Assured (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 5000000.00"
                    value={polForm.sumAssured}
                    onChange={(e) => setPolForm({ ...polForm, sumAssured: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Premium (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 18500.00"
                    value={polForm.premiumAmount}
                    onChange={(e) => setPolForm({ ...polForm, premiumAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Premium Frequency</label>
                  <select
                    value={polForm.premiumFrequency}
                    onChange={(e) => setPolForm({ ...polForm, premiumFrequency: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs"
                  >
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Renewal Date</label>
                  <input
                    type="date"
                    value={polForm.renewalDate}
                    onChange={(e) => setPolForm({ ...polForm, renewalDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
