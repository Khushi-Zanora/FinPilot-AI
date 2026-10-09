import React, { useState } from 'react';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import {
  ShieldCheck,
  Shield,
  HeartPulse,
  Car,
  Sparkles,
  Plus,
  Download,
  Calendar,
  Phone,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export default function InsurancePage() {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const policies = [
    {
      id: 'pol-1',
      name: 'Tata AIA Sampoorna Raksha Supreme',
      policyNumber: 'Policy # 0798438251',
      category: 'life',
      typeBadge: 'PURE TERM',
      typeStyle: 'bg-emerald-500/10 text-[#05DF85] border-emerald-500/20',
      sumAssured: 30000000,
      premium: 28500,
      dueDate: '28 Nov 2024',
      coverageTerm: 'Covered Till Age 65 (2054)',
      tags: ['Level Cover Shield', 'Terminal Illness Included', 'Sec 80C Compliant', 'Auto-Debit: Sinking Fund']
    },
    {
      id: 'pol-2',
      name: 'Tech Corp India Group Term Life (GTL)',
      policyNumber: 'Policy # GT-CORP-8841',
      category: 'life',
      typeBadge: 'EMPLOYER SPONSORED',
      typeStyle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      sumAssured: 5000000,
      premium: 0,
      dueDate: 'Auto Renewed',
      coverageTerm: 'Continuous Active Employment',
      tags: ['Employment Dependent', 'HR Portability Available']
    },
    {
      id: 'pol-3',
      name: 'HDFC ERGO Optima Secure',
      policyNumber: 'Policy # 2810/0061837/00',
      category: 'health',
      typeBadge: 'BASE MEDICLAIM',
      typeStyle: 'bg-emerald-500/10 text-[#05DF85] border-emerald-500/20',
      sumAssured: 1000000,
      premium: 22100,
      dueDate: '14 May 2025',
      coverageTerm: 'Zone 1 Tier • 0% Co-Payment',
      tags: ['Cashless TPA: HDFC In-house', 'Restoration Benefit 100%', 'Sec 80D: Self & Spouse']
    },
    {
      id: 'pol-4',
      name: 'Care Health Enhance Super Top-Up',
      policyNumber: 'Policy # CH-SUP-994102',
      category: 'health',
      typeBadge: 'CATASTROPHIC SHIELD',
      typeStyle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      sumAssured: 9000000,
      premium: 17800,
      dueDate: '14 May 2025',
      coverageTerm: 'Deductible: ₹10,00,000 (Matched to Base)',
      tags: ['Seamless Super Top-up Bridge', 'Worldwide Emergency Included', 'Zero Co-Pay']
    },
    {
      id: 'pol-5',
      name: 'Tata AIG Comprehensive EV Auto',
      policyNumber: 'Vehicle: Tata Nexon EV Max (MH-02-FE-4921)',
      category: 'asset',
      typeBadge: 'ASSET PROTECTION',
      typeStyle: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      sumAssured: 1540000,
      premium: 14200,
      dueDate: '10 Jul 2025',
      coverageTerm: 'Zero Depreciation + Battery Lock',
      tags: ['Engine & High-Voltage Battery Shield', '24x7 Roadside Assist']
    }
  ];

  const [newPol, setNewPol] = useState({ name: '', category: 'life', sumAssured: '', premium: '', dueDate: '' });

  const handleAddPolicy = (e) => {
    e.preventDefault();
    if (!newPol.name || !newPol.sumAssured) return;
    const polObj = {
      id: `pol-${Date.now()}`,
      name: newPol.name,
      policyNumber: `Policy # FP-${Date.now().toString().slice(-6)}`,
      category: newPol.category,
      typeBadge: newPol.category.toUpperCase(),
      typeStyle: 'bg-emerald-500/10 text-[#05DF85] border-emerald-500/20',
      sumAssured: parseFloat(newPol.sumAssured),
      premium: parseFloat(newPol.premium) || 0,
      dueDate: newPol.dueDate || 'Annual',
      coverageTerm: 'Active Policy',
      tags: ['User Endorsed']
    };
    policies.push(polObj);
    setShowAddModal(false);
    setNewPol({ name: '', category: 'life', sumAssured: '', premium: '', dueDate: '' });
  };

  const filteredPolicies = policies.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  const downloadEmergencyKit = () => {
    const kitText = `FINPILOT EMERGENCY INSURANCE DISPATCH KIT\nPrimary Nominee: Priya Sharma (Spouse)\nEmergency Helpline: 1800-266-1400\nLife Cover: ₹3.50 Cr\nHealth Shield: ₹1.00 Cr\nPolicy Documents Vault: 4/4 Verified on eIA/CKYC`;
    const blob = new Blob([kitText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinPilot_Emergency_Dispatch_Kit_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">HEALTH & PROTECTION</span>
              <span className="text-slate-600">//</span>
              <span>ACTUARIAL RISK & MORTALITY AUDIT ENGINE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Insurance & Risk Coverage
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-[#080D16] border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#05DF85]" />
              <span>Family Safety Net: <strong className="text-[#05DF85]">Fortified (92/100)</strong></span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(5,223,133,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Policy / Endorsement</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>TOTAL LIFE UNDERWRITTEN</span>
              <span className="text-[#05DF85] text-[10px] font-bold">14.6x Income</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">₹3,50,00,000</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>Pure Term: ₹3.00 Cr</span>
              <span className="text-slate-500">Corp GTL: ₹50.0L</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#05DF85] mb-1">
              <span>HEALTH & MEDICLAIM SHIELD</span>
              <span className="text-cyan-400 text-[10px] font-bold">Base + Top-up</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#05DF85]">₹1,00,00,000</div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center justify-between">
              <span>HDFC Base: ₹10.0L</span>
              <span className="text-slate-500">Care Top-up: ₹90.0L</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
              <span>ANNUALIZED PREMIUM</span>
              <span className="text-slate-400 text-[10px]">2.3% Inflow</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">₹68,400<span className="text-base text-slate-400 font-normal"> / yr</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Sec 80C & 80D Deductions: <strong className="text-[#05DF85]">₹58,400 Maxed</strong>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#05DF85] mb-1">
              <span>CATASTROPHIC CUSHION SCORE</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#05DF85] text-[10px] font-bold">FORTIFIED</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">92<span className="text-sm text-slate-500 font-normal"> / 100</span></div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Inpatient exposure: <strong className="text-[#05DF85]">₹0 Out-of-pocket</strong>
            </div>
          </div>
        </div>

        {/* Human Life Value & Liabilities Radar */}
        <div className="p-6 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Human Life Value (HLV) & Liabilities Coverage Radar</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                  117.4% Funded Protection
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stress test factoring mortgage principal (₹48.75L), 20-yr family sustenance, and children&apos;s higher education.
              </p>
            </div>

            <div className="text-right shrink-0 font-mono">
              <div className="text-xs text-slate-400">TOTAL SHIELD CAPITAL</div>
              <div className="text-xl font-bold text-[#05DF85]">₹3.50 Cr In-force</div>
            </div>
          </div>

          {/* Segmented Bar */}
          <div className="space-y-2 pt-1">
            <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
              <div className="bg-rose-500 h-full w-[16.4%]" title="Mortgage 16.4%"></div>
              <div className="bg-[#05DF85] h-full w-[53.7%]" title="Family Sustenance 53.7%"></div>
              <div className="bg-cyan-400 h-full w-[21.8%]" title="Education 21.8%"></div>
              <div className="bg-purple-400 h-full w-[8.1%]" title="Medical Buffer 8.1%"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-400 pt-1">
              <div><span className="text-rose-400 font-semibold block">• Mortgage Principal</span><span>₹48.75L (16.4%)</span></div>
              <div><span className="text-[#05DF85] font-semibold block">• 20-Yr Sustenance</span><span>₹1.60 Cr (53.7%)</span></div>
              <div><span className="text-cyan-400 font-semibold block">• Higher Education</span><span>₹65.00L (21.8%)</span></div>
              <div><span className="text-purple-400 font-semibold block">• Medical Emergency</span><span>₹24.00L (8.1%)</span></div>
            </div>
          </div>
        </div>

        {/* Main Grid: Policy Vault (8 cols) + Right Risk Copilot & Emergency Kit (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Policy Vault (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-mono text-xs">
                {[
                  { id: 'all', label: `All (${policies.length})` },
                  { id: 'life', label: 'Life' },
                  { id: 'health', label: 'Health' },
                  { id: 'asset', label: 'Asset' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      filter === t.id ? 'bg-[#05DF85] text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-[#080D16]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Policy Cards */}
            <div className="space-y-3">
              {filteredPolicies.map((pol) => (
                <div
                  key={pol.id}
                  className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pol.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${pol.typeStyle}`}>
                          {pol.typeBadge}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{pol.policyNumber} • {pol.coverageTerm}</div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="text-lg font-bold text-white">
                        ₹{pol.sumAssured.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#05DF85]">
                        {pol.premium === 0 ? 'Employer Funded' : `Premium: ₹${pol.premium.toLocaleString('en-IN')}/yr`}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pol.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Due: <strong className="text-white">{pol.dueDate}</strong></span>
                    <button className="text-[#05DF85] hover:underline">View Policy Document →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panels: Risk Copilot, Emergency Dispatch Kit & Disbursals (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Risk Copilot Intelligence */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#05DF85]" />
                <h3 className="text-xs font-bold text-white">Risk Copilot Intelligence</h3>
              </div>

              <div className="p-3 rounded-lg bg-[#0D1422] border border-amber-500/20 text-xs space-y-1">
                <div className="font-bold text-amber-400 flex items-center justify-between">
                  <span>Critical Illness Rider Gap</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20">HIGH PRIORITY</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Recommend a ₹25.0L standalone rider to buffer income loss during prolonged recovery for major ailments.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0D1422] border border-emerald-500/20 text-xs space-y-1">
                <div className="font-bold text-[#05DF85]">Section 80D Tax Optimization Maxed</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Full ₹25,000 health deduction utilized under Sec 80D across self and spouse policies.
                </p>
              </div>
            </div>

            {/* Emergency Dispatch Kit Card */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                  <Shield className="w-3.5 h-3.5 text-[#05DF85]" />
                  <span>Emergency Dispatch Kit</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#05DF85]"></span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between"><span>Primary Nominee:</span><span className="text-white font-bold">Priya Sharma (Spouse)</span></div>
                <div className="flex justify-between"><span>24x7 Priority Line:</span><span className="text-[#05DF85]">1800-266-1400</span></div>
                <div className="flex justify-between"><span>Digital Vault:</span><span>4/4 Verified on eIA</span></div>
              </div>

              <button
                onClick={downloadEmergencyKit}
                className="w-full py-2.5 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download Emergency Kit (PDF)</span>
              </button>
            </div>

            {/* Upcoming Disbursals */}
            <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Upcoming Disbursals</h3>
                <span className="text-[10px] font-mono text-slate-500">12-MONTH SINKING</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">Tata AIA Term Life</div>
                    <div className="text-[10px] text-slate-500">28 Nov • Sinking Pool Funded</div>
                  </div>
                  <div className="text-white font-bold">₹28,500</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0D1422] border border-white/[0.04] flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">HDFC ERGO Health</div>
                    <div className="text-[10px] text-slate-500">14 May 2025 • Auto-Disbursal</div>
                  </div>
                  <div className="text-white font-bold">₹22,100</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D16] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#05DF85]" />
                <span>Add Insurance Policy</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">POLICY / INSURER NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Life Click 2 Protect"
                  value={newPol.name}
                  onChange={(e) => setNewPol({ ...newPol, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">CATEGORY</label>
                <select
                  value={newPol.category}
                  onChange={(e) => setNewPol({ ...newPol, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#05DF85]"
                >
                  <option value="life">Term Life Insurance</option>
                  <option value="health">Health / Mediclaim</option>
                  <option value="asset">Vehicle / Asset Protection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">SUM ASSURED (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 10000000"
                    value={newPol.sumAssured}
                    onChange={(e) => setNewPol({ ...newPol, sumAssured: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">ANNUAL PREMIUM (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 24000"
                    value={newPol.premium}
                    onChange={(e) => setNewPol({ ...newPol, premium: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0D1422] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
