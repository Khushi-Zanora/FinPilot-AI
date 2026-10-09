import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { ShieldCheck, Plus, Calendar, AlertTriangle, Trash2, X } from 'lucide-react';

export default function InsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Policy Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState('health');
  const [providerName, setProviderName] = useState('');
  const [policyNumberMasked, setPolicyNumberMasked] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [premiumFrequency, setPremiumFrequency] = useState('yearly');
  const [sumInsured, setSumInsured] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    try {
      setLoading(true);
      const res = await apiRequest('/insurance');
      if (res.success) {
        setPolicies(res.data.policies || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load insurance policies:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPolicy(e) {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const premiumAmountPaise = Math.round(parseFloat(premiumAmount) * 100);
      const sumInsuredPaise = Math.round(parseFloat(sumInsured || '0') * 100);

      await apiRequest('/insurance', {
        method: 'POST',
        body: JSON.stringify({
          policyType,
          providerName,
          policyNumberMasked,
          premiumAmountPaise,
          premiumFrequency,
          sumInsuredPaise,
          renewalDate: new Date(renewalDate).toISOString()
        })
      });

      setIsModalOpen(false);
      setProviderName('');
      setPremiumAmount('');
      setSumInsured('');
      fetchPolicies();
    } catch (err) {
      setModalError(err.message || 'Failed to add policy');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePolicy(id) {
    if (!window.confirm('Delete this insurance policy?')) return;
    try {
      await apiRequest(`/insurance/${id}`, { method: 'DELETE' });
      fetchPolicies();
    } catch (err) {
      alert(err.message || 'Failed to delete policy');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Insurance Policies</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRO
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Keep track of health, term life, and motor insurance renewals and coverages
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Policy</span>
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Sum Insured Coverage
            </span>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrency(summary.totalSumInsuredPaise)}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Annualized Premiums
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalAnnualizedPremiumsPaise)}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Renewals (Next 30 Days)
            </span>
            <div className="text-2xl font-black text-amber-400">
              {summary.upcomingRenewalsCount}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : policies.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Insurance Policies Added</h3>
          <p className="text-sm max-w-sm mx-auto mb-6">
            Log your health and life policies to prevent unexpected coverage lapses.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
          >
            Add Your First Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((p) => (
            <div key={p._id} className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {p.policyType.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleDeletePolicy(p._id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white">{p.providerName}</h3>
                {p.policyNumberMasked && (
                  <p className="text-xs text-slate-400 mt-0.5">Policy: {p.policyNumberMasked}</p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Sum Insured</span>
                    <strong className="text-emerald-400 text-sm font-bold block">
                      {formatCurrency(p.sumInsuredPaise)}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Premium ({p.premiumFrequency})</span>
                    <strong className="text-white text-sm font-bold block">
                      {formatCurrency(p.premiumAmountPaise)}
                    </strong>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Renewal Date: {new Date(p.renewalDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Insurance Policy</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddPolicy} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Policy Type</label>
                <select
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="health">Health Insurance</option>
                  <option value="term_life">Term Life Insurance</option>
                  <option value="motor_vehicle">Motor / Vehicle Insurance</option>
                  <option value="home">Home Insurance</option>
                  <option value="critical_illness">Critical Illness</option>
                  <option value="other">Other Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Insurance Provider</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC ERGO, Star Health, ICICI Lombard"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Premium (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="12000.00"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                  <select
                    value={premiumFrequency}
                    onChange={(e) => setPremiumFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="half_yearly">Half Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sum Insured Coverage (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1000000.00"
                  value={sumInsured}
                  onChange={(e) => setSumInsured(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Next Renewal Date</label>
                <input
                  type="date"
                  required
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
