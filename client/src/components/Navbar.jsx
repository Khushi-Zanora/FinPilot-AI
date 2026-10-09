import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'AI Analyst', href: '#ai-analyst' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05080E]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-mint shadow-glow-sm group-hover:scale-105 transition-all">
            <Compass className="w-4.5 h-4.5 text-[#05DF85] stroke-[2.4]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            FinPilot
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-300 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Area */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#05DF85] hover:bg-[#04C976] text-slate-950 text-xs font-extrabold uppercase tracking-wide transition-all shadow-glow-mint hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#05DF85] text-slate-950 text-xs font-bold"
          >
            Launch App
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#080D16] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#05DF85] text-slate-950 font-bold rounded-full text-xs uppercase tracking-wide"
            >
              Launch App →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
