import React from 'react';
import { Compass, Shield, Lock, FileText, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-lg font-bold text-white">FinPilot</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Your money. Your goals. A clearer direction. Full-stack personal finance management with cash flow intelligence, loan amortization, and an AI financial analyst.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Encryption</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-teal-400" /> Private & User Scoped</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#features" className="hover:text-emerald-400">Features</Link></li>
              <li><Link to="/#pricing" className="hover:text-emerald-400">Pricing Plans</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-emerald-400">How it Works</Link></li>
              <li><Link to="/workspace/ai" className="hover:text-emerald-400">AI Financial Analyst</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal & Security</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#privacy" className="hover:text-emerald-400">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-emerald-400">Terms of Service</a></li>
              <li><a href="#disclaimer" className="hover:text-emerald-400">Financial Disclaimers</a></li>
              <li><a href="#contact" className="hover:text-emerald-400">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FinPilot Inc. All rights reserved.</p>
          <p className="text-slate-500">
            *Disclaimer: FinPilot provides educational personal finance tracking and scenario modeling. Not a SEBI registered investment advisor.
          </p>
        </div>
      </div>
    </footer>
  );
}
