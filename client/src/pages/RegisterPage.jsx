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
  PieChart,
  Target,
  Calculator,
  ShieldCheck
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Real password validation rules
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isStrong = hasMinLength && hasLetter && hasNumber;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }
    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
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
      setError(err.message || 'Registration failed. Please verify your details.');
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
          <span>SECURE TLS ENCRYPTED • ZERO THIRD-PARTY AD TRACKING</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
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

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#080D16] border border-white/[0.08] shadow-2xl space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <span>CREATE FREE ACCOUNT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Build your financial <span className="text-[#05DF85]">command center</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Take full control of your cash flow, savings targets, and financial clarity.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Email & Details Form */}
            <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
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
                    placeholder="e.g. Arjun Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-[#0D1422] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#05DF85]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Email Address <span className="text-[#05DF85]">*</span>
                </label>
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

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">
                    Password <span className="text-[#05DF85]">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Minimum 8 characters
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
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

                {/* Real Password Strength Criteria */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-mono">
                  <div>
                    <div className={`h-1 rounded-full ${hasMinLength ? 'bg-[#05DF85]' : 'bg-slate-800'}`}></div>
                    <span className={hasMinLength ? 'text-[#05DF85] mt-1 block' : 'text-slate-500 mt-1 block'}>8+ chars</span>
                  </div>
                  <div>
                    <div className={`h-1 rounded-full ${hasLetter ? 'bg-[#05DF85]' : 'bg-slate-800'}`}></div>
                    <span className={hasLetter ? 'text-[#05DF85] mt-1 block' : 'text-slate-500 mt-1 block'}>Letters</span>
                  </div>
                  <div>
                    <div className={`h-1 rounded-full ${hasNumber ? 'bg-[#05DF85]' : 'bg-slate-800'}`}></div>
                    <span className={hasNumber ? 'text-[#05DF85] mt-1 block' : 'text-slate-500 mt-1 block'}>Numbers</span>
                  </div>
                  <div>
                    <div className={`h-1 rounded-full ${hasSpecial ? 'bg-[#05DF85]' : 'bg-slate-800'}`}></div>
                    <span className={hasSpecial ? 'text-[#05DF85] mt-1 block' : 'text-slate-500 mt-1 block'}>Symbols</span>
                  </div>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded bg-[#0D1422] border-white/[0.2] text-[#05DF85] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-400 leading-relaxed cursor-pointer">
                  I agree to the <span className="text-[#05DF85] hover:underline">Terms of Service</span> and{' '}
                  <span className="text-[#05DF85] hover:underline">Privacy Policy</span>.
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(5,223,133,0.3)] disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Free Account & Continue'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Bottom Form Footer */}
            <div className="pt-2 border-t border-white/[0.06] text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#05DF85] font-semibold hover:underline">
                Sign In →
              </Link>
            </div>
          </div>

          {/* Right Column: Genuine Capabilities Overview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Feature 1: Exact Integer Precision */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#05DF85] flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <span>Exact Integer Paise Arithmetic</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All balances, loans, and transaction records are calculated in minor units (integer paise) to eliminate floating-point rounding errors.
              </p>
            </div>

            {/* Feature 2: Deterministic Financial Engine */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Deterministic AI Financial Analyst</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auditable formulas for purchase affordability, emergency cushions, and loan amortization without hallucinations.
              </p>
            </div>

            {/* Feature 3: Smart Goal Earmarking */}
            <div className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <span>Safe-to-Spend Isolation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically subtracts your upcoming 30-day bills and savings goal allocations to reveal your genuine disposable cash.
              </p>
            </div>

            {/* Security Guarantee */}
            <div className="p-4 rounded-xl bg-[#080D16] border border-white/[0.08] flex items-center gap-3 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-[#05DF85] shrink-0" />
              <span>Passwords securely hashed with salted bcrypt. Sessions secured via HttpOnly JWT tokens.</span>
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
