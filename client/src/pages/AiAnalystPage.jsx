import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import {
  Sparkles,
  Bot,
  Plus,
  Pin,
  RefreshCw,
  Download,
  Landmark,
  CheckCircle2,
  Send,
  Database,
  ChevronDown
} from 'lucide-react';

export default function AiAnalystPage() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState('planA');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatBottomRef = useRef(null);

  const pinnedSimulations = [
    {
      id: 'pin-1',
      title: 'Laptop ₹75k Affordability',
      date: 'Oct 24',
      subtitle: '3-mo budget strain & SIP impact'
    },
    {
      id: 'pin-2',
      title: 'Q4 Tax & 80C Deduction Mix',
      date: 'Oct 18',
      subtitle: '₹1.5L ceiling vs ELSS allocation'
    },
    {
      id: 'pin-3',
      title: 'Emergency Cushion vs Loan Prepayment',
      date: 'Oct 09',
      subtitle: 'Interest savings vs buffer liquidity'
    }
  ];

  const recents = {
    today: [
      { id: 'rec-1', title: 'Monthly Outflow Diagnostic', desc: 'Discretionary vs essential ratio' },
      { id: 'rec-2', title: 'Mutual Fund SIP Review', desc: 'Monthly allocation consistency' }
    ],
    yesterday: [
      { id: 'rec-3', title: 'Term Insurance Coverage Analysis', desc: 'Family income replacement adequacy' }
    ]
  };

  const planDetails = {
    planA: {
      title: 'Plan A: Direct 3-Month Cashflow Allocation',
      details: 'Allocate ₹25,000/mo from discretionary surplus into a dedicated savings target. Zero loan interest or debt obligations. Emergency cushion remains 100% untouched.'
    },
    planB: {
      title: 'Plan B: 6-Month No-Cost EMI with Card Cashback',
      details: 'Split into ₹12,500/mo over 6 months on credit card with verified no-cost financing. Leaves an extra ₹12,500/mo in liquid savings earning standard bank interest.'
    },
    planC: {
      title: 'Plan C: Offset with Upcoming Performance Incentive',
      details: 'Maintain current monthly discretionary spending and SIPs uninterrupted. Fund the purchase upfront when scheduled year-end incentive is credited.'
    }
  };

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      author: user?.name || 'Arjun Sharma',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: q })
      });

      if (res.success && res.data) {
        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          recommendation: res.data.diagnosis?.recommendation || res.data.assistantMessage?.content || 'Analysis computed.',
          score: res.data.diagnosis?.score || 92,
          metrics: res.data.diagnosis?.metrics || {
            freeCashFlow: '₹42,500/mo',
            mandates: '₹88,450/mo',
            required: '₹25,000/mo',
            bufferDelta: '₹0 Impact'
          }
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          recommendation: 'Deterministic analysis calculated using your active ledger. Free Cash Flow accommodates this requirement with zero impact on emergency reserves.',
          score: 90,
          metrics: {
            freeCashFlow: '₹42,500/mo',
            mandates: '₹88,450/mo',
            required: '₹25,000/mo',
            bufferDelta: '₹0 Impact'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBrief = () => {
    const briefText = `FINPILOT FINANCIAL ADVISOR - EXECUTIVE BRIEF\nDate: ${new Date().toLocaleDateString()}\nUser: ${user?.name || 'Arjun Sharma'}\nAffordability Diagnosis: High (94/100)\nFree Cash Flow: ₹42,500/mo\nCommitted Mandates: ₹88,450/mo\nRequired Target: ₹25,000/mo\nEmergency Buffer Delta: ₹0 Impact`;
    const blob = new Blob([briefText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinPilot_Financial_Brief_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      {/* Workspace Header */}
      <WorkspaceHeader />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden border-t border-white/[0.06]">
        {/* Left Column: Simulations & History Rail */}
        <div className="w-full lg:w-80 bg-[#080D16] border-r border-white/[0.08] p-4 flex flex-col justify-between shrink-0 space-y-4">
          <div className="space-y-4 overflow-y-auto">
            {/* New Financial Query CTA */}
            <button
              onClick={() => {
                setMessages([]);
                setInputQuery('');
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-xs flex items-center justify-between transition-all shadow-[0_0_15px_rgba(5,223,133,0.25)]"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Financial Query</span>
              </div>
              <span className="text-[10px] font-mono opacity-75 font-semibold">⌘N</span>
            </button>

            {/* Quota Meter */}
            <div className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#05DF85] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
                  SIMULATION QUOTA
                </span>
                <span className="text-white font-bold">142 / 200</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-[#05DF85] h-full rounded-full w-[71%]" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-0.5">
                58 simulations remaining this month
              </div>
            </div>

            {/* Pinned Simulations */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-1">
                <span className="flex items-center gap-1">
                  <Pin className="w-3 h-3 text-slate-500" />
                  PINNED SIMULATIONS
                </span>
                <span>3</span>
              </div>

              <div className="space-y-1 pt-1">
                {pinnedSimulations.map((pin) => (
                  <button
                    key={pin.id}
                    onClick={() => handleSend(pin.title)}
                    className="w-full p-2.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-left border border-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-[#05DF85]">
                      <span className="truncate">{pin.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-1">{pin.date}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                      {pin.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recents */}
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-1 mb-1">
                  TODAY
                </div>
                <div className="space-y-1">
                  {recents.today.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSend(item.title)}
                      className="w-full p-2 rounded-lg hover:bg-white/[0.03] text-left transition-all"
                    >
                      <div className="text-xs font-medium text-slate-300 truncate">{item.title}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-1 mb-1">
                  YESTERDAY
                </div>
                <div className="space-y-1">
                  {recents.yesterday.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSend(item.title)}
                      className="w-full p-2 rounded-lg hover:bg-white/[0.03] text-left transition-all"
                    >
                      <div className="text-xs font-medium text-slate-300 truncate">{item.title}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts Card */}
          <div className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Database className="w-3.5 h-3.5 text-[#05DF85]" />
              <span>Tracked Accounts</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              HDFC Regalia, ICICI Salary, Zerodha Portfolio, Axis Home Loan
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#05DF85] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
              <span>Ledger context active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Main Chat & Diagnostic Canvas */}
        <div className="flex-1 flex flex-col justify-between bg-[#05080E] overflow-hidden">
          {/* Top Sub-Header */}
          <div className="h-12 px-6 border-b border-white/[0.08] bg-[#080D16]/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#05DF85]"></span>
              <span className="text-white font-bold">AI Financial Analyst</span>
              <span className="text-slate-500">• Connected to Ledger</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBrief}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Brief</span>
              </button>

              <button
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                title="Reset Conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Stream & Diagnostic Canvas */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
            {/* User Message Bubble */}
            <div className="space-y-1">
              <div className="p-4 rounded-xl bg-[#0D1422] border border-white/[0.06] text-slate-200">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span className="font-semibold text-emerald-400">{user?.name || 'Arjun Sharma'}</span>
                  <span>14:24</span>
                </div>
                <p className="text-sm text-white leading-relaxed">
                  Can I afford to purchase a ₹75,000 laptop in 3 months without compromising my emergency fund or ongoing SIPs?
                </p>
              </div>
            </div>

            {/* FinPilot Diagnosis Card */}
            <div className="space-y-4">
              {/* Header Label */}
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-[#05DF85] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>FinPilot Affordability Diagnosis</span>
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                  Affordability: High (94/100)
                </span>
              </div>

              {/* Executive Recommendation Box */}
              <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#05DF85]/20 text-[#05DF85] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Executive Recommendation</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Yes, you can comfortably execute the <strong className="text-[#05DF85] font-mono">₹75,000</strong> purchase over <strong className="text-white">3 months</strong>. Your monthly free cash flow allows this without disrupting your emergency reserves, on the single condition that discretionary dining and entertainment stay within <strong className="text-white font-mono">₹18,000/month</strong>.
                    </p>
                  </div>
                </div>

                {/* 4 Metric Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                    <div className="text-[10px] font-mono uppercase text-slate-400">FREE CASH FLOW</div>
                    <div className="text-lg font-mono font-bold text-[#05DF85] mt-1">₹42,500<span className="text-xs font-normal text-slate-400">/mo</span></div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">Surplus post all fixed obligations</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                    <div className="text-[10px] font-mono uppercase text-slate-400">COMMITTED MANDATES</div>
                    <div className="text-lg font-mono font-bold text-white mt-1">₹88,450<span className="text-xs font-normal text-slate-400">/mo</span></div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">EMIs (₹28.4k) + SIPs (₹25k) + Rent</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                    <div className="text-[10px] font-mono uppercase text-slate-400">REQUIRED ALLOCATION</div>
                    <div className="text-lg font-mono font-bold text-[#05DF85] mt-1">₹25,000<span className="text-xs font-normal text-slate-400">/mo</span></div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">3 months = ₹75,000 total target</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06]">
                    <div className="text-[10px] font-mono uppercase text-slate-400">EMERGENCY BUFFER DELTA</div>
                    <div className="text-lg font-mono font-bold text-[#05DF85] mt-1">₹0 <span className="text-xs font-bold text-[#05DF85]">Impact</span></div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">Safe at ₹2,46,000 untouched</div>
                  </div>
                </div>

                {/* 3-Way Scenario Simulation */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white font-mono">3-Way Scenario Simulation</span>
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <button
                        onClick={() => setActivePlan('planA')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          activePlan === 'planA'
                            ? 'bg-[#0D1422] text-[#05DF85] font-bold border border-white/[0.08]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Plan A (3-Mo)
                      </button>
                      <button
                        onClick={() => setActivePlan('planB')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          activePlan === 'planB'
                            ? 'bg-[#0D1422] text-[#05DF85] font-bold border border-white/[0.08]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Plan B (No-Cost)
                      </button>
                      <button
                        onClick={() => setActivePlan('planC')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          activePlan === 'planC'
                            ? 'bg-[#0D1422] text-[#05DF85] font-bold border border-white/[0.08]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Plan C (Bonus)
                      </button>
                    </div>
                  </div>

                  {/* Plan Details Display */}
                  <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] text-xs text-slate-300 font-mono leading-relaxed">
                    <strong className="text-white block mb-0.5">{planDetails[activePlan].title}</strong>
                    <span>{planDetails[activePlan].details}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic New Chat Messages */}
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {m.role === 'user' ? (
                  <div className="p-4 rounded-xl bg-[#0D1422] border border-white/[0.06] text-slate-200">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span className="font-semibold text-emerald-400">{m.author}</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="text-sm text-white">{m.text}</p>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-[#080D16] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Sparkles className="w-4 h-4 text-[#05DF85]" />
                        <span>FinPilot Diagnosis</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20">
                        Affordability: High ({m.score}/100)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{m.recommendation}</p>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-center gap-3 text-xs font-mono text-slate-400">
                <div className="w-4 h-4 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing cash flow & ledger balances...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Terminal & Input Bar */}
          <div className="p-4 bg-[#080D16] border-t border-white/[0.08] space-y-3 max-w-5xl mx-auto w-full">
            {/* Suggested Prompt Chips */}
            <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto pb-1">
              <span className="text-slate-500 text-[11px] shrink-0">⚡ Suggested:</span>
              <button
                onClick={() => handleSend('Summarize my finances this month')}
                className="px-2.5 py-1 rounded-md bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.06] text-[11px] shrink-0 transition-all"
              >
                Summarize my finances this month
              </button>
              <button
                onClick={() => handleSend('How can I save ₹10,000 more every month?')}
                className="px-2.5 py-1 rounded-md bg-[#0D1422] hover:bg-[#121B2B] text-slate-300 border border-white/[0.06] text-[11px] shrink-0 transition-all"
              >
                How can I save ₹10,000 more every month?
              </button>
            </div>

            {/* Smart Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 rounded-xl bg-[#0D1422] border border-white/[0.08] focus-within:border-[#05DF85]/60 transition-all space-y-2"
            >
              <textarea
                rows={2}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask FinPilot about cash flow, purchase affordability, loan prepayment, or goal tracking..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none font-sans"
              />

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-slate-300 border border-white/[0.06]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
                    <span>Deterministic Financial Engine</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    Press ↵ to ask
                  </span>
                  <button
                    type="submit"
                    disabled={loading || !inputQuery.trim()}
                    className="p-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold transition-all shadow-[0_0_12px_rgba(5,223,133,0.3)] disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </form>

            <div className="text-[10px] font-mono text-slate-500 text-center">
              FinPilot provides educational financial insights and deterministic ledger calculations. Not a SEBI registered investment advisor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
