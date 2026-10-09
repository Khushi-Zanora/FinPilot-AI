import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../api/client.js';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Bot,
  Target,
  PieChart,
  Landmark,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Mail,
  Send,
  Lock,
  ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState({ state: 'idle', message: '' });

  async function handleContactSubmit(e) {
    e.preventDefault();
    try {
      setContactStatus({ state: 'loading', message: 'Sending message...' });
      const res = await apiRequest('/public/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });
      setContactStatus({ state: 'success', message: res.message || 'Message sent successfully!' });
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      setContactStatus({ state: 'error', message: err.message || 'Failed to send message.' });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Financial Intelligence & Cashflow Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Your money. Your goals.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              A clearer direction.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FinPilot gives you total clarity over your tracked cash flow, loan amortizations, goal forecasts, and investable surplus with an intelligent AI financial analyst.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 transition-colors"
            >
              Sign In to Workspace
            </Link>
          </div>

          {/* Interactive Feature Highlights Strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-bold text-lg">0% Float Error</div>
              <div className="text-xs text-slate-400">Strict integer minor-unit paise precision</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold text-lg">AI Analyst</div>
              <div className="text-xs text-slate-400">Affordability math & surplus suggestions</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-indigo-400 font-bold text-lg">Amortization</div>
              <div className="text-xs text-slate-400">Full principal/interest loan schedules</div>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <div className="text-amber-400 font-bold text-lg">Zero Leakage</div>
              <div className="text-xs text-slate-400">Transfer isolation & double-count safety</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need to master your wealth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Tracked Cash & Net Cash Flow</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Derive accurate balances across bank accounts, cash, and digital wallets with safe internal transfer handling that prevents double-counting.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI Financial Analyst</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ask questions like <em>“Can I afford a ₹75,000 phone in 3 months?”</em> or discover how to allocate your investable surplus into FDs, RDs, or Index Funds.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Loan & EMI Amortization</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Complete mathematical schedules splitting principal and interest components, tracking remaining principal and future due dates with precision.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Savings Goals & Earmarks</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Set targets for emergency funds, travel, or gadgets. Real-time contribution tracking and deterministic monthly savings requirements.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Budgets & Threshold Alerts</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Category spending limits with automatic calculation of consumed percentages and proactive alerts when spending crosses 80% or 100%.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Investments & Insurance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Portfolio asset allocation across mutual funds, stocks, and deposits alongside insurance policy tracking and renewal alarms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Simple Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">How FinPilot Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-lg font-bold">
                1
              </div>
              <h3 className="text-lg font-bold">Record Your Ledger</h3>
              <p className="text-sm text-slate-400">
                Add your bank, cash, or digital accounts. Log income, expenses, and internal transfers with zero double-counting.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto text-lg font-bold">
                2
              </div>
              <h3 className="text-lg font-bold">Define Goals & Commitments</h3>
              <p className="text-sm text-slate-400">
                Track EMIs, insurance renewals, and savings earmarks. The calculation engine isolates available uncommitted cash.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto text-lg font-bold">
                3
              </div>
              <h3 className="text-lg font-bold">Consult Your AI Analyst</h3>
              <p className="text-sm text-slate-400">
                Ask about upcoming purchase affordability and explore tailored investment instruments for your genuine surplus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Transparent Pricing</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Choose the plan that matches your goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Free Tier</h3>
                <p className="text-xs text-slate-400 mb-6">Essential personal money tracking</p>
                <div className="text-3xl font-extrabold mb-6">₹0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>

                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Core income & expense tracking</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Tracked cash & net cashflow</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 3 active savings goals</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 5 category budgets</li>
                </ul>
              </div>
              <Link to="/register" className="block text-center py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Premium Monthly */}
            <div className="glass-panel p-8 rounded-2xl border-2 border-emerald-500 relative flex flex-col justify-between shadow-2xl shadow-emerald-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Premium Monthly</h3>
                <p className="text-xs text-slate-400 mb-6">Complete financial management & AI</p>
                <div className="text-3xl font-extrabold mb-6">₹99 <span className="text-xs font-normal text-slate-400">/ month</span></div>

                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited savings goals & forecasts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Full Loan & EMI Amortization engine</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Investment portfolio & allocation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Insurance policies & renewal alarms</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> AI Financial Analyst & surplus guidance</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> CSV exports with formula injection safety</li>
                </ul>
              </div>
              <Link to="/register" className="block text-center py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20">
                Upgrade to Pro
              </Link>
            </div>

            {/* Premium Yearly */}
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Premium Yearly</h3>
                <p className="text-xs text-slate-400 mb-6">Best value — Save over 33%</p>
                <div className="text-3xl font-extrabold mb-6">₹799 <span className="text-xs font-normal text-slate-400">/ year</span></div>

                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Everything in Premium Monthly</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Equivalent to ₹66.50/month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Priority feature updates & AI models</li>
                </ul>
              </div>
              <Link to="/register" className="block text-center py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm transition-colors">
                Get Annual Pass
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">FAQ</h2>
            <p className="text-3xl font-extrabold">Frequently Asked Questions</p>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800">
              <h4 className="font-bold text-base mb-2">Does FinPilot connect directly to my bank accounts?</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                No. FinPilot is designed with user privacy and safety first. Balances are derived from user-recorded ledger accounts and transactions, not automated third-party bank credentials.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800">
              <h4 className="font-bold text-base mb-2">How does the AI Financial Analyst calculate suggestions?</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                All numerical computations (cash flow, shortfall, emergency buffer, and loan schedules) are executed deterministically by our mathematical backend engine in integer paise. The AI provides context, explanations, and Indian investment instrument scenarios without inventing figures.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-slate-800">
              <h4 className="font-bold text-base mb-2">Is payment billing live or test mode?</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                During development, all payments run safely in Razorpay Test Mode with mock billing adapters. No real financial cards are charged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Get in Touch</h2>
            <p className="text-3xl font-extrabold">Contact the FinPilot Team</p>
            <p className="text-sm text-slate-400 mt-2">Have a question or feedback? Send us a message.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
            {contactStatus.message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  contactStatus.state === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {contactStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Khushi Zanora"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="khushi@example.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="Product Inquiry / Feature Request"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="How can we assist you?"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={contactStatus.state === 'loading'}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{contactStatus.state === 'loading' ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
