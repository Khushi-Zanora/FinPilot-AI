import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import {
  Sparkles,
  Bot,
  Send,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Target,
  Repeat,
  DollarSign,
  PieChart,
  Trash2
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    icon: PieChart,
    label: 'Spending This Month',
    prompt: 'How much did I spend this month?'
  },
  {
    icon: TrendingUp,
    label: 'Biggest Expenses',
    prompt: 'What were my biggest expenses?'
  },
  {
    icon: DollarSign,
    label: 'Money Received',
    prompt: 'How much money did I receive this month?'
  },
  {
    icon: Target,
    label: 'Savings Overview',
    prompt: 'How much did I save this month?'
  },
  {
    icon: CreditCard,
    label: 'Budget Limits',
    prompt: 'Am I staying within my budgets?'
  },
  {
    icon: Target,
    label: 'Goal Monthly Targets',
    prompt: 'How much do I need to save each month to reach my goal?'
  },
  {
    icon: Sparkles,
    label: 'Check Affordability',
    prompt: 'Can I afford a purchase of ₹75,000 in three months?'
  },
  {
    icon: Repeat,
    label: 'Upcoming Recurring',
    prompt: 'What recurring income and bills are coming up?'
  },
  {
    icon: HelpCircle,
    label: 'Investment Guide (India)',
    prompt: 'Give me general information about investment options in India.'
  }
];

export default function AiAnalystPage() {
  const { user } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadChatHistory() {
    try {
      const res = await apiRequest('/ai/history');
      if (res.success && res.data?.conversations && res.data.conversations.length > 0) {
        const latestConvId = res.data.conversations[0]._id;
        const msgRes = await apiRequest(`/ai/conversations/${latestConvId}`);
        if (msgRes.success && msgRes.data?.messages) {
          const loaded = msgRes.data.messages.map((m) => ({
            id: m._id || `msg-${Date.now()}`,
            role: m.role,
            text: m.content,
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          }));
          setMessages(loaded);
        }
      }
    } catch (err) {
      // Clean start if no history
    }
  }

  const handleClearHistory = async () => {
    setMessages([]);
  };

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      author: user?.name || 'User',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: q })
      });

      if (res.success && res.data) {
        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: res.data.answer || res.data.response || res.data.assistantMessage?.content || 'Analysis complete.',
          intent: res.data.intent,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(res.error?.message || 'Failed to process financial query.');
      }
    } catch (err) {
      const errMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ ${err.message || 'Unable to analyze query. Please verify your ledger records.'}`,
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080E] text-slate-100 font-sans min-h-screen">
      <WorkspaceHeader onRecordTransaction={() => {}} />

      <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-between">
        {/* Title Bar */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#05DF85] animate-pulse"></span>
              <span className="text-[#05DF85] font-semibold">FINANCIAL ADVISORY & INSIGHTS</span>
              <span className="text-slate-600">//</span>
              <span>LIVE DATABASE CALCULATIONS</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              AI Financial Analyst
            </h1>
            <p className="text-xs text-slate-400">
              Get clear, natural-language answers about your spending, monthly income, savings targets, and purchase affordability.
            </p>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1422] hover:bg-[#121B2B] text-slate-400 hover:text-slate-200 border border-white/[0.08] text-xs transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Session</span>
            </button>
          )}
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 min-h-[420px] rounded-2xl bg-[#080D16] border border-white/[0.08] p-5 overflow-y-auto space-y-4 flex flex-col">
          {messages.length === 0 ? (
            <div className="my-auto space-y-6 max-w-2xl mx-auto py-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#05DF85] flex items-center justify-center mx-auto">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">How can I help with your finances today?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click any question below or type your own. All responses calculate live figures from your recorded accounts, budgets, and transactions.
                </p>
              </div>

              {/* Starter Question Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="p-3 rounded-xl bg-[#0D1422] hover:bg-[#121B2B] hover:border-[#05DF85]/40 border border-white/[0.06] text-left transition-all group flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-white group-hover:text-[#05DF85] transition-colors">
                          {item.label}
                        </span>
                        <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#05DF85] transition-colors" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono line-clamp-2">
                        &ldquo;{item.prompt}&rdquo;
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#05DF85] border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-[#05DF85] text-slate-950 font-medium'
                          : m.isError
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                          : 'bg-[#0D1422] border border-white/[0.08] text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                      <div className={`text-[9px] font-mono text-right ${isUser ? 'text-slate-800' : 'text-slate-500'}`}>
                        {m.time}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-[#05DF85] flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1422] border border-white/[0.08] text-xs font-mono text-slate-400 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#05DF85] border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing your ledger & computing verified totals...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            placeholder="Ask a financial question (e.g. How much did I spend this month? Can I afford ₹50,000?)"
            className="w-full pl-4 pr-12 py-3 bg-[#080D16] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#05DF85] shadow-lg disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="absolute right-2 p-2 rounded-lg bg-[#05DF85] hover:bg-[#04C976] text-slate-950 font-bold disabled:opacity-30 transition-all cursor-pointer"
            title="Send query"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
