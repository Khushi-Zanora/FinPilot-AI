import React, { useEffect, useState } from 'react';
import { apiRequest, formatCurrency } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CreditCard, CheckCircle2, Sparkles, Shield, AlertCircle } from 'lucide-react';

export default function BillingPage() {
  const { user, isPremium, checkCurrentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  async function fetchBillingInfo() {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        apiRequest('/billing/plans'),
        apiRequest('/billing/subscription')
      ]);

      if (plansRes.success) setPlans(plansRes.data.plans || []);
      if (subRes.success) setSubscription(subRes.data.subscription || null);
    } catch (err) {
      console.error('Failed to load billing info:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId) {
    setMessage('');
    setProcessingPlan(planId);

    try {
      // 1. Create order
      const orderRes = await apiRequest('/billing/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId })
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error('Failed to create billing order');
      }

      const orderData = orderRes.data;

      // 2. In Test Mode / Mock payments, simulate instant verification
      const verifyRes = await apiRequest('/billing/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature',
          planId
        })
      });

      if (verifyRes.success) {
        setMessage('🎉 Congratulations! Your FinPilot Premium subscription has been successfully activated.');
        await checkCurrentUser();
        fetchBillingInfo();
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message || 'Payment processing failed.'}`);
    } finally {
      setProcessingPlan(null);
    }
  }

  async function handleCancelSubscription() {
    if (!window.confirm('Cancel auto-renewal for your subscription? You will retain access until the end of the billing period.')) return;
    try {
      const res = await apiRequest('/billing/cancel', { method: 'POST' });
      alert(res.message);
      fetchBillingInfo();
    } catch (err) {
      alert(err.message || 'Failed to cancel subscription');
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-slate-400">
          Manage your FinPilot plan, entitlements, and test payment simulations
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {message}
        </div>
      )}

      {/* Current Plan Status Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Current Active Plan
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white capitalize">
              {isPremium ? 'FinPilot Premium' : 'FinPilot Free'}
            </h2>
            {isPremium && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                ACTIVE PRO
              </span>
            )}
          </div>
          {subscription && (
            <p className="text-xs text-slate-400 mt-2">
              Current Period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} to {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              {subscription.cancelAtPeriodEnd && <span className="text-amber-400 ml-2">(Will not renew)</span>}
            </p>
          )}
        </div>

        {isPremium && subscription && !subscription.cancelAtPeriodEnd && (
          <button
            onClick={handleCancelSubscription}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Cancel Auto-Renewal
          </button>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = (p.id === 'free' && !isPremium) || (p.id.includes('premium') && isPremium);

          return (
            <div
              key={p.id}
              className={`glass-panel p-6 rounded-2xl border ${
                p.id === 'premium_monthly'
                  ? 'border-emerald-500/50 relative shadow-xl shadow-emerald-500/10'
                  : 'border-slate-800'
              } flex flex-col justify-between`}
            >
              <div>
                <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                <div className="text-2xl font-black text-white mt-3 mb-4">
                  {formatCurrency(p.pricePaise)}
                  <span className="text-xs font-normal text-slate-400"> / {p.interval}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  {p.features?.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isCurrent ? (
                <div className="py-2.5 px-4 rounded-xl bg-slate-800/80 text-center text-xs font-bold text-slate-400 border border-slate-700">
                  Current Plan
                </div>
              ) : (
                <button
                  disabled={p.id === 'free' || processingPlan === p.id}
                  onClick={() => handleSubscribe(p.id)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow disabled:opacity-50"
                >
                  {processingPlan === p.id ? 'Processing...' : 'Upgrade (Test Mode)'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Shield className="w-4 h-4 text-slate-600 shrink-0" />
        <span>Development Mode: Payments are simulated using Razorpay Test Mode with mock billing adapters. No actual charges occur.</span>
      </div>
    </div>
  );
}
