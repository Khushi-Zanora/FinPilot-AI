import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../api/client.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setStatus({ state: 'loading', message: 'Sending request...' });
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setStatus({
        state: 'success',
        message: res.message || 'If an account exists, a password reset link has been dispatched.'
      });
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Failed to submit request.' });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Compass className="w-6 h-6 text-slate-950 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">FinPilot</span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset your password</h2>
        <p className="text-sm text-slate-400 mt-1">We'll send you instructions to reset your account password</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {status.message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                status.state === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="khushi@finpilot.app"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status.state === 'loading'}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <span>{status.state === 'loading' ? 'Sending link...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
