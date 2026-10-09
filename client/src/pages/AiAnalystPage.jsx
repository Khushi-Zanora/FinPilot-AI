import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Bot, Send, Sparkles, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';

export default function AiAnalystPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [starterPrompts, setStarterPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchStarterPrompts();
    // Welcome message
    setMessages([
      {
        role: 'assistant',
        content: `👋 Hello ${user?.name || 'there'}! I am your **FinPilot AI Financial Analyst**.\n\nI can analyze your cash flow, run purchase affordability math (e.g. *“Can I afford a ₹75,000 phone in 3 months?”*), and explore genuine surplus investment options in India (FDs, RDs, Index Funds, SGBs) based on your real tracked balances.\n\nHow can I help you optimize your finances today?`
      }
    ]);
  }, [user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function fetchStarterPrompts() {
    try {
      const res = await apiRequest('/ai/starter-prompts');
      if (res.success) {
        setStarterPrompts(res.data.prompts || []);
      }
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  }

  async function handleSendMessage(promptText) {
    const query = promptText || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: query,
          conversationId
        })
      });

      if (res.success && res.data) {
        if (res.data.conversationId) setConversationId(res.data.conversationId);
        if (res.data.assistantMessage) {
          setMessages((prev) => [...prev, res.data.assistantMessage]);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Unable to process your query at this moment. Please try again.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>AI Financial Analyst</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Deterministic Math
              </span>
            </h1>
            <p className="text-xs text-slate-400">Personalized cashflow insights & surplus investment modeling</p>
          </div>
        </div>

        <button
          onClick={() => {
            setConversationId(null);
            setMessages([
              {
                role: 'assistant',
                content: `New analysis session started. Ask any question about your cash flow or investment options.`
              }
            ]);
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="New Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Starter Prompts Horizontal Bar */}
      {starterPrompts.length > 0 && messages.length <= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
          {starterPrompts.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSendMessage(p.prompt)}
              className="p-3 text-left rounded-xl glass-panel border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all group"
            >
              <div className="font-bold text-emerald-400 mb-1 group-hover:underline flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{p.title}</span>
              </div>
              <div className="text-slate-400 truncate">{p.prompt}</div>
            </button>
          ))}
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => {
          const isAssistant = m.role === 'assistant';

          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isAssistant
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : '👤'}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm'
                    : 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-500/10'
                }`}
              >
                {/* Render Text with Markdown line breaks */}
                <div className="whitespace-pre-wrap font-sans">
                  {m.content.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return <h3 key={lIdx} className="text-base font-bold text-white mt-2 mb-1">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={lIdx} className="ml-4 list-disc text-slate-300">{line.replace('- ', '')}</li>;
                    }
                    if (line.startsWith('> ')) {
                      return (
                        <div key={lIdx} className="my-2 p-2.5 rounded-lg bg-emerald-950/20 border-l-2 border-emerald-400 text-xs text-emerald-300">
                          {line.replace('> ', '')}
                        </div>
                      );
                    }
                    return <p key={lIdx} className={line === '' ? 'h-2' : 'my-1'}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-lg mr-auto">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-400 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing cash flow & computing deterministic models...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3 shrink-0">
        <input
          type="text"
          placeholder="Ask a financial question (e.g. 'Can I afford a ₹75,000 phone in 3 months?' or 'How should I invest ₹75,000?')..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>

      {/* Financial Disclaimer */}
      <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
        <span>FinPilot provides educational financial modeling. Not a SEBI registered investment advisor. Always verify before making major commitments.</span>
      </div>
    </div>
  );
}
