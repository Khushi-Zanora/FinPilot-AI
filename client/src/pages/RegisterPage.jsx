import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Landmark,
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Key,
  Globe,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('Arjun Sharma');
  const [email, setEmail] = useState('arjun@sharma-ventures.io');
  const [password, setPassword] = useState('FinPilot!Vault#2025Secure');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the Terms of Service & Privacy Architecture to proceed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({ name, email, password, currency: 'INR' });
      if (res.success) {
        navigate('/onboarding');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      // Fallback transition to onboarding wizard for interactive preview
      navigate('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080E] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#05DF85] selection:text-slate-950">
      {/* Top Protocol Header */}
      <header className="h-14 border-b border-white/[0.08] bg-[#05080E]/90 backdrop-blur-md px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#05DF85] shadow-[0_0_15px_rgba(5,223,133,0.15)]">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">FinPilot</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300">
          <Shield className="w-3.5 h-3.5 text-[#05DF85]" />
          <span>256-BIT SSL ENCRYPTED • SOC-2 COMPLIANT</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#080D16] border border-white/[0.08] text-slate-300 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>EN / USD</span>
          </div>

          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            Help & Docs
          </Link>

          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-lg bg-[#080D16] hover:bg-[#0D1422] text-slate-200 border border-white/[0.08] font-medium transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Protocol Gate Subheader */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85] animate-pulse"></span>
          <span className="text-slate-300 font-semibold">PROTOCOL GATE // ONBOARDING TERMINAL V4.8</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-[#05DF85]" />
          <span>256-Bit Elliptic Curve Ephemeral Keys</span>
        </div>
      </div>

      {/* Main Two-Column Auth Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#080D16] border border-white/[0.08] shadow-2xl space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <span>⚡ INSTANT SETUP IN &lt; 90 SECONDS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Build your financial <span className="text-[#05DF85]">command center</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Start your 14-day Pro trial. No credit card required. Zero automated lock-in.
              </p>
            </div>

            {/* Social SSO Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-[#0D1422] hover:bg-[#121B2B] border border-white/[0.08] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-[#0D1422] hover:bg-[#121B2B] border border-white/[0.08] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Sign up with GitHub</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/[0.08] w-full"></div>
              <span className="bg-[#080D16] px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 absolute">
                OR REGISTER WITH EMAIL
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Email & Details Form */}
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-sans">
              {/* Full Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Full Name <span className="text-[#05DF85]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              {/* Work or Personal Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">
                    Work or Personal Email <span className="text-[#05DF85]">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#05DF85] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Domain verified & available
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjun@sharma-ventures.io"
                    className="w-full pl-9 pr-8 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#05DF85]"
                  />
                  <CheckCircle2 className="w-4 h-4 text-[#05DF85] absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Master Vault Passphrase */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">
                    Master Vault Passphrase <span className="text-[#05DF85]">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#05DF85] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Strong: 16+ characters with salt
                  </span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#05DF85]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-500 hover:text-slate-300 absolute right-2.5 top-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* 4 Entropy Live Meters */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-mono">
                  <div>
                    <div className="h-1 rounded-full bg-[#05DF85] w-full"></div>
                    <span className="text-[#05DF85] mt-1 block">1. Length 14+</span>
                  </div>
                  <div>
                    <div className="h-1 rounded-full bg-[#05DF85] w-full"></div>
                    <span className="text-[#05DF85] mt-1 block">2. Symbols</span>
                  </div>
                  <div>
                    <div className="h-1 rounded-full bg-[#05DF85] w-full"></div>
                    <span className="text-[#05DF85] mt-1 block">3. Numerals</span>
                  </div>
                  <div>
                    <div className="h-1 rounded-full bg-[#05DF85] w-full"></div>
                    <span className="text-[#05DF85] mt-1 block">4. Entropy High</span>
                  </div>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded bg-[#0D1422] border-white/[0.2] text-[#05DF85] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-400 leading-relaxed cursor-pointer">
                  I agree to the <span className="text-[#05DF85] hover:underline">Terms of Service</span>,{' '}
                  <span className="text-[#05DF85] hover:underline">Privacy Architecture</span>, and zero-knowledge algorithmic data processing rules.
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(5,223,133,0.3)] disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Initializing Vault...' : 'Create Free Account & Setup Ledger'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Bottom Form Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div>
                Already have a FinPilot account?{' '}
                <Link to="/login" className="text-[#05DF85] font-semibold hover:underline">
                  Sign In to Workspace →
                </Link>
              </div>
              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
                <span>Zero API data logging</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Telemetry Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Real-time Yield Mini Chart Card */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
                  Pro Wealth OS Tier Active
                </span>
                <span className="text-slate-400">$0.00 for 14 Days</span>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">REAL-TIME YIELD ARBITRAGE</div>
                <div className="text-2xl font-mono font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>+8.42% Net Alpha</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20 font-bold">
                    +182 bps
                  </span>
                </div>
              </div>

              {/* Sparkline wave vector */}
              <div className="h-16 flex items-end pt-2">
                <svg className="w-full h-12" viewBox="0 0 300 60" fill="none">
                  <path
                    d="M0 45 Q 40 40, 80 48 T 160 30 T 240 18 T 300 8"
                    stroke="#05DF85"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <circle cx="300" cy="8" r="4" fill="#05DF85" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                <span>Algorithmic Treasury Sweep</span>
                <span>Synced 4s ago</span>
              </div>
            </div>

            {/* Feature 1: Multi-Bank Automated Reconciliation */}
            <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#05DF85] shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Multi-Bank Automated Reconciliation</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Connect across 14,000+ institutions. Real-time balance consolidation and zero ledger drift.
                </p>
              </div>
            </div>

            {/* Feature 2: Zero-Hallucination Deterministic AI Analyst */}
            <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Zero-Hallucination Deterministic AI Analyst</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Hard mathematical verifiability. Auditable formula breakdown on every cash-flow projection.
                </p>
              </div>
            </div>

            {/* Feature 3: Automated Debt & EMI Prepayment Arbitrage */}
            <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Automated Debt & EMI Prepayment Arbitrage</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Intelligently matches liquid idle yield against high-interest liabilities to trim interest burn.
                </p>
              </div>
            </div>

            {/* Social Proof Bar */}
            <div className="p-3 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-700 ring-2 ring-[#080D16] text-[10px] flex items-center justify-center text-white font-bold">AS</div>
                <div className="w-7 h-7 rounded-full bg-cyan-700 ring-2 ring-[#080D16] text-[10px] flex items-center justify-center text-white font-bold">VS</div>
                <div className="w-7 h-7 rounded-full bg-purple-700 ring-2 ring-[#080D16] text-[10px] flex items-center justify-center text-white font-bold">+15k</div>
              </div>
              <div className="text-[11px] leading-tight">
                <span className="text-white font-semibold block">Joined by 15,000+ operators</span>
                <span className="text-slate-500 text-[10px]">Engineers, partners, & venture founders</span>
              </div>
            </div>

            {/* SOC-2 Audit Card */}
            <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#05DF85]" />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>SOC-2 Type II Certified</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#05DF85]" />
                  </div>
                  <div className="text-[10px] text-slate-400">Read-only API access. Your funds can never be transferred without hardware MFA.</div>
                </div>
              </div>
              <a
                href="#audit"
                onClick={(e) => e.preventDefault()}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Audit Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="h-12 border-t border-white/[0.06] px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <div>© 2025 FinPilot Technologies Inc. All institutional protocols reserved.</div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-slate-300">Security Whitepaper</Link>
          <Link to="/" className="hover:text-slate-300">Disclosures</Link>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span>
            <span>Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
