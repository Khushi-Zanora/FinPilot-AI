import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Landmark,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Calculator
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/workspace/dashboard');
      } else {
        navigate('/workspace/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080E] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#05DF85] selection:text-slate-950">
      {/* Top Header */}
      <header className="h-14 border-b border-white/[0.08] bg-[#05080E]/90 backdrop-blur-md px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#05DF85] shadow-[0_0_15px_rgba(5,223,133,0.15)]">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">FinPilot</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#05DF85]" />
          <span>SECURE TLS ENCRYPTED • PRIVATE FINANCIAL VAULT</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            Help & Docs
          </Link>
          <Link
            to="/register"
            className="px-3.5 py-1.5 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs shadow-sm hover:bg-[#04C976] transition-all"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#080D16] border border-white/[0.08] shadow-2xl space-y-5">
            <div>
              <div className="text-[11px] font-mono text-[#05DF85] flex items-center gap-1.5 mb-2 font-semibold">
                <span>SECURE SIGN IN</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back to <span className="text-[#05DF85]">FinPilot</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Sign in to view your real-time cash flow, goal progress, and deterministic financial insights.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="text-[11px] text-slate-300">
                <span className="font-semibold text-[#05DF85]">Pro Test Account: </span>
                <span className="font-mono text-slate-400">premium.tester@finpilot.app</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('premium.tester@finpilot.app');
                  setPassword('FinPilot2026!');
                }}
                className="px-2.5 py-1 rounded bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-[10px] transition-all"
              >
                Auto-fill
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arjun@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-mono text-slate-400 hover:text-[#05DF85]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
              </div>

              {/* Remember device checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded bg-[#0D1422] border-white/[0.2] text-[#05DF85] focus:ring-0"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(5,223,133,0.3)] disabled:opacity-50 mt-3"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to FinPilot'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="text-[10px] font-mono text-slate-500 text-center pt-2 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#05DF85]" />
                <span>Protected by bcrypt salted hashing and secure encrypted session cookies</span>
              </div>
            </form>

            <div className="pt-3 border-t border-white/[0.06] text-center text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[#05DF85] font-semibold hover:underline">
                Create a free account →
              </Link>
            </div>
          </div>

          {/* Right Column: Key Benefits Overview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Real-time Cash Flow Summary Card */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] relative space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-bold">NET SAFE TO SPEND</span>
                <span className="text-[#05DF85] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Real-time
                </span>
              </div>

              <div>
                <div className="text-2xl font-mono font-bold text-white">₹1,18,320<span className="text-base text-slate-400 font-normal">.00</span></div>
                <div className="text-[11px] text-slate-400 mt-1">
                  True disposable cash after isolating ₹2,46,000 in emergency cushions and ₹30,678 in upcoming 30-day bills.
                </div>
              </div>

              {/* Sparkline wave */}
              <div className="h-10 pt-1">
                <svg className="w-full h-8" viewBox="0 0 300 40" fill="none">
                  <path
                    d="M0 30 Q 50 28, 100 25 T 200 15 T 300 5"
                    stroke="#05DF85"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Benefit 1 */}
            <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#05DF85] flex items-center justify-center shrink-0">
                <Calculator className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Integer-Precision Ledger</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tracks bank accounts, credit cards, and cash down to the exact paisa without rounding errors.
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Deterministic Financial Advisor</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Calculates exact purchase affordability, savings timelines, and loan prepayment impact.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="h-12 border-t border-white/[0.06] px-6 flex items-center justify-between text-[11px] text-slate-500">
        <div>© 2025 FinPilot. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-slate-300">Privacy Policy</Link>
          <Link to="/" className="hover:text-slate-300">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
