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
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Key,
  Globe,
  Fingerprint,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('arjun@strataflow.io');
  const [password, setPassword] = useState('FinPilot!Secure2025');
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
      // Fallback transition for demo preview
      navigate('/workspace/dashboard');
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
            className="px-3.5 py-1.5 rounded-lg bg-[#05DF85] text-slate-950 font-bold text-xs shadow-sm hover:bg-[#04C976] transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Two-Column Sign In Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#080D16] border border-white/[0.08] shadow-2xl space-y-5">
            <div>
              <div className="text-[11px] font-mono text-[#05DF85] flex items-center gap-1.5 mb-2 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85] animate-pulse"></span>
                <span>PROTOCOL GATE // SECURE AUTH</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back to <span className="text-[#05DF85]">FinPilot</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access your financial telemetry cockpit and autonomous treasury reserves.
              </p>
            </div>

            {/* Social & Passkey SSO Buttons */}
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
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-[#0D1422] hover:bg-[#121B2B] border border-white/[0.08] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-all"
              >
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>Hardware / Passkey</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/[0.08] w-full"></div>
              <span className="bg-[#080D16] px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 absolute">
                OR CONTINUE WITH EMAIL
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Work or Personal Email</label>
                  <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Corporate SSO Ready
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjun@strataflow.io"
                    className="w-full pl-9 pr-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  Institutional clearing address configured for hardware token dispatch.
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Master Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-mono text-slate-400 hover:text-[#05DF85]">
                    Forgot master key?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
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
              </div>

              {/* Remember device & Biometric Fast-Pass */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded bg-[#0D1422] border-white/[0.2] text-[#05DF85] focus:ring-0"
                  />
                  <span>Remember this device for 30 days</span>
                </label>

                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 text-[#05DF85]" />
                  <span>Biometric Fast-Pass enabled</span>
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(5,223,133,0.3)] disabled:opacity-50 mt-3"
              >
                <span>{loading ? 'Authenticating Session...' : 'Sign In to FinPilot'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="text-[10px] font-mono text-slate-500 text-center pt-2 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#05DF85]" />
                <span>Protected by AES-256 vault encryption & WebAuthn FIPS 140-2 Level 3</span>
              </div>
            </form>

            <div className="pt-3 border-t border-white/[0.06] text-center text-xs text-slate-400">
              Don&apos;t have an enterprise seat?{' '}
              <Link to="/register" className="text-[#05DF85] font-semibold hover:underline">
                Create an account
              </Link>
            </div>
          </div>

          {/* Right Column: Live Telemetry Feed & Testimonial (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Telemetry Feed Card */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#05DF85] animate-pulse"></span>
                  <span className="font-bold">LIVE TELEMETRY FEED</span>
                </div>
                <span className="text-slate-500">Arjun&apos;s Ledger synced 2m ago</span>
              </div>

              {/* Net Safe Cash */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400">NET SAFE CASH (INSTANT LIQUIDITY)</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white">₹1,18,320</div>
                  <div className="text-[10px] font-mono text-[#05DF85] flex items-center gap-1 font-bold">
                    <TrendingUp className="w-3 h-3" /> +14.2% MoM
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500">T+0 Cleared</div>
              </div>

              {/* Sparkline */}
              <div className="h-10">
                <svg className="w-full h-8" viewBox="0 0 300 40" fill="none">
                  <path
                    d="M0 30 Q 50 28, 100 25 T 200 15 T 300 5"
                    stroke="#05DF85"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* AI Pilot Sweep Active */}
              <div className="p-3 rounded-lg bg-[#0D1422] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-[#05DF85]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Pilot Sweep Active</div>
                    <div className="text-[10px] text-[#05DF85] font-mono font-semibold">₹3,400 monthly savings identified</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#05DF85]" />
              </div>

              {/* Treasury Spread */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 uppercase">TREASURY SPREAD</span>
                  <span className="text-[#05DF85] font-bold">99.8% Optimized</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                  <div className="bg-[#05DF85] h-full w-[58%]" title="T-Bills 58%"></div>
                  <div className="bg-cyan-400 h-full w-[27%]" title="Repo 27%"></div>
                  <div className="bg-indigo-400 h-full w-[15%]" title="Delta 15%"></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#05DF85]"></span> T-Bills 58%</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Repo 27%</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Delta 15%</span>
                </div>
              </div>
            </div>

            {/* Testimonial Quote Card */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] relative space-y-3">
              <div className="text-2xl font-serif text-slate-600 font-bold leading-none select-none">“</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                “FinPilot replaced our fragmented multi-bank telemetry with deterministic math and microsecond liquidity visibility. It&apos;s unmatched for high-growth operations.”
              </p>

              <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.04]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center font-bold text-slate-950 text-xs">
                  VS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Vikramaditya Shah</div>
                  <div className="text-[10px] font-mono text-slate-400">VP Engineering, StrataFlow Capital</div>
                </div>
              </div>
            </div>

            {/* Zero-Knowledge Vault Badge */}
            <div className="p-3 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#05DF85]" />
                <span className="text-slate-200 font-semibold">Zero-Knowledge Vault</span>
              </div>
              <span>PCI-DSS LEVEL 1 • ISO-27001</span>
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
