import React from 'react';
import { Compass, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05080E] text-slate-400 text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#05DF85]">
                <Compass className="w-4.5 h-4.5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">FinPilot</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Autonomous personal finance management for forward-looking individuals. Track multi-account cashflow, run automated simulations, and build lasting net worth.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
                <span>FINPILOT CORE v2.4 OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Personal Cashflow</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Debt Amortization</a></li>
              <li><a href="#ai-analyst" className="hover:text-white transition-colors">Intelligence Engine</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Architecture</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Membership Plans</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#faq" className="hover:text-white transition-colors">Knowledge Base & FAQ</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Security Architecture</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Workspace Access</Link></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#faq" className="hover:text-white transition-colors">Privacy Architecture</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Zero-Trust Security</a></li>
              <li><a href="#disclaimer" className="hover:text-white transition-colors">Regulatory Disclaimers</a></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer Box */}
        <div id="disclaimer" className="p-5 rounded-2xl bg-[#080D16] border border-white/[0.06] text-xs text-slate-400 leading-relaxed space-y-2 mb-10">
          <p className="font-semibold text-slate-300">
            Financial Advice and Regulatory Disclaimer:
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            FinPilot is an autonomous software tool for personal financial organization, ledger tracking, mathematical amortization calculations, and scenario simulation. FinPilot is not a SEBI-registered investment advisor, portfolio manager, or financial broker. All simulations, projections, and suggested options are for educational and informational purposes only and are derived strictly from user-entered accounts, records, and deterministic mathematical formulas. Users should perform independent due diligence or consult licensed financial professionals before executing material financial transactions.
          </p>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FinPilot Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#faq" className="hover:text-slate-300 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#faq" className="hover:text-slate-300 transition-colors">Security</a>
            <span>•</span>
            <a href="#disclaimer" className="hover:text-slate-300 transition-colors">SEBI/Financial Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
