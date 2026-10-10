import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatStatus, setChatApiKey } from '../services/api';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  Key, 
  Check, 
  X, 
  ShieldCheck, 
  Database,
  ArrowRight
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Who are the top 5 employees at highest attrition risk?",
  "Tell me about EMP-622",
  "Which department has the most at-risk employees?",
  "What is the recommended action for employees working overtime?",
  "How many employees are high risk vs medium risk?",
  "Explain the main risk factors driving attrition at TechNova",
  "What retention actions work best for Sales Representatives?",
  "Explain the ML model performance and metrics",
];

// Robust Markdown Parser for Chat Messages (Handles Tables, Blockquotes, Headers, Lists, Code)
const parseMarkdown = (markdown) => {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const html = [];
  let inTable = false;
  let tableHeaders = [];
  let inList = false;
  let inOrderedList = false;

  const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const formatInline = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 text-xs font-mono border border-slate-200">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check if table row
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      
      // Separator row (e.g., |:---|:---:|)
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!inTable) {
        if (inList) { html.push('</ul>'); inList = false; }
        if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
        inTable = true;
        tableHeaders = cells;
        html.push('<div class="overflow-x-auto my-3 rounded-lg border border-slate-200 shadow-sm"><table class="w-full text-left text-xs border-collapse bg-white">');
        html.push('<thead class="bg-slate-50 border-b border-slate-200"><tr>');
        cells.forEach(cell => {
          html.push(`<th class="px-3 py-2 font-semibold text-slate-700">${formatInline(cell)}</th>`);
        });
        html.push('</tr></thead><tbody class="divide-y divide-slate-100">');
      } else {
        html.push('<tr class="hover:bg-slate-50 transition-colors">');
        cells.forEach(cell => {
          html.push(`<td class="px-3 py-2 text-slate-600">${formatInline(cell)}</td>`);
        });
        html.push('</tr>');
      }
      continue;
    } else if (inTable) {
      html.push('</tbody></table></div>');
      inTable = false;
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
        html.push('<ul class="space-y-1.5 my-2 list-disc list-inside text-slate-700">');
        inList = true;
      }
      const itemContent = line.slice(2);
      html.push(`<li class="leading-relaxed">${formatInline(itemContent)}</li>`);
      continue;
    } else if (inList) {
      html.push('</ul>');
      inList = false;
    }

    // Ordered List
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (!inOrderedList) {
        if (inList) { html.push('</ul>'); inList = false; }
        html.push('<ol class="space-y-1.5 my-2 list-decimal list-inside text-slate-700">');
        inOrderedList = true;
      }
      html.push(`<li class="leading-relaxed">${formatInline(orderedMatch[2])}</li>`);
      continue;
    } else if (inOrderedList) {
      html.push('</ol>');
      inOrderedList = false;
    }

    // Headers
    if (line.startsWith('### ')) {
      html.push(`<h3 class="text-sm font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5">${formatInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      html.push(`<h2 class="text-base font-bold text-slate-900 mt-3 mb-2">${formatInline(line.slice(3))}</h2>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      html.push(`<blockquote class="border-l-2 border-indigo-500 bg-indigo-50/50 px-3 py-1.5 my-2 text-xs text-indigo-900 rounded-r">${formatInline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Empty line
    if (!line) {
      continue;
    }

    // Paragraph
    html.push(`<p class="leading-relaxed mb-1.5 text-slate-800">${formatInline(line)}</p>`);
  }

  if (inTable) html.push('</tbody></table></div>');
  if (inList) html.push('</ul>');
  if (inOrderedList) html.push('</ol>');

  return html.join('');
};

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} fade-in`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
        isUser 
          ? 'bg-indigo-600 text-white' 
          : 'bg-white border border-slate-200 text-indigo-600'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[85%] px-4 py-3 text-sm rounded-2xl ${
        isUser 
          ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div
            className="prose-like text-xs sm:text-sm"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
          />
        )}
        <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isUser ? 'text-indigo-200 justify-end' : 'text-slate-400'}`}>
          <span>{msg.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 fade-in">
    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
      <Bot className="w-4 h-4 text-indigo-600" />
    </div>
    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-xs">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-400"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <span className="text-xs text-slate-400 ml-2">Analyzing attrition data...</span>
    </div>
  </div>
);

export const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am **TalentGuard AI**, your strategic HR Analytics Assistant for TechNova Solutions.\n\n" +
               "I have real-time access to the **Top-50 Attrition Watchlist**, calibrated risk probabilities, and individual **SHAP risk drivers**.\n\n" +
               "You can ask me questions such as:\n" +
               "- *Who are the top 5 employees at highest attrition risk?*\n" +
               "- *Tell me about EMP-622*\n" +
               "- *Which department has the most at-risk employees?*\n" +
               "- *What is the recommended action for employees working overtime?*\n\n" +
               "How can I assist your retention planning today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ has_gemini: false, engine: 'Loading...' });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keyMessage, setKeyMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getChatStatus();
      setStatus(res);
    } catch (err) {
      setStatus({ has_gemini: false, engine: 'TalentGuard Local Engine' });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const userMsg = {
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = [...messages.slice(-6), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await sendChatMessage(userText, history);
      const aiMsg = {
        role: 'assistant',
        content: res.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Unable to connect to backend service. Please verify that the FastAPI backend server is running on port 8000.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: "Conversation history cleared. Feel free to ask about any employee, department, or retention policy!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setKeySaving(true);
    setKeyMessage(null);
    try {
      const res = await setChatApiKey(apiKeyInput.trim());
      if (res.success) {
        setKeyMessage({ type: 'success', text: 'Gemini API key verified & active!' });
        fetchStatus();
        setTimeout(() => {
          setShowKeyModal(false);
          setApiKeyInput('');
          setKeyMessage(null);
        }, 1200);
      } else {
        setKeyMessage({ type: 'error', text: res.message || 'Verification failed.' });
      }
    } catch (err) {
      setKeyMessage({ type: 'error', text: 'Failed to configure API key.' });
    } finally {
      setKeySaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full fade-in" style={{ height: 'calc(100vh - 3.5rem - 3rem)' }}>
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            AI HR Retention Copilot
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time conversational intelligence over TechNova's attrition queue and SHAP attributions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Engine Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white shadow-xs text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status.has_gemini ? 'bg-emerald-400' : 'bg-indigo-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                status.has_gemini ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}></span>
            </span>
            <span className="font-semibold text-slate-700">
              {status.has_gemini ? 'Gemini 1.5 Flash' : 'Local Analytics Engine'}
            </span>
            <button
              onClick={() => setShowKeyModal(true)}
              className="ml-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              title="Configure Google Gemini API Key"
            >
              <Key className="w-3 h-3" />
              {status.has_gemini ? 'Change Key' : 'Connect Gemini'}
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 bg-white shadow-xs"
            title="Clear conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Layout: Chat Stream (Left) + Intelligence Hub (Right) ── */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Chat Window */}
        <div className="flex-1 flex flex-col glass-panel overflow-hidden bg-slate-50/50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-slate-100 p-4 bg-white">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                id="chat-input"
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about high-risk employees (e.g., 'Tell me about EMP-622'), department trends, or retention actions..."
                className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-500 transition outline-none"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                disabled={loading}
              />
              <button
                id="btn-send-chat"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`p-3 rounded-xl transition-all shadow-sm ${
                  input.trim() && !loading
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Press <strong className="font-semibold text-slate-600">Enter</strong> to send · <strong className="font-semibold text-slate-600">Shift+Enter</strong> for newline</span>
              <span>Grounded on 50 High-Priority Candidates</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Suggestions & Data Context */}
        <div className="w-72 shrink-0 space-y-4 flex flex-col overflow-y-auto">
          {/* Suggested Questions */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Suggested Queries
            </h3>
            <div className="space-y-1.5">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="w-full text-left text-xs text-slate-600 px-3 py-2 rounded-lg border border-slate-100 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all leading-snug shadow-2xs group flex items-start justify-between gap-1"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Context Details Card */}
          <div className="glass-panel p-4 text-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              Live Context Grounding
            </h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span className="text-slate-400">Total Workforce</span>
                <strong className="text-slate-800 font-semibold">1,470 employees</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span className="text-slate-400">Triage Queue</span>
                <strong className="text-slate-800 font-semibold">Top 50 Monitored</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span className="text-slate-400">Model Algorithm</span>
                <strong className="text-slate-800 font-semibold">Random Forest</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span className="text-slate-400">Precision@50</span>
                <strong className="text-emerald-600 font-semibold">46.0% (~2.85× lift)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Explainability</span>
                <strong className="text-indigo-600 font-semibold">Tree SHAP Approximations</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── API Key Configuration Modal ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Gemini API Key</h3>
                  <p className="text-[11px] text-slate-400">Optional · Powers live cloud generative reasoning</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              TalentGuard automatically includes an offline, rule-grounded intelligence engine. 
              Adding your Google Gemini API key enables full multi-turn conversational synthesis and customized email generation.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            {keyMessage && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                keyMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {keyMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>{keyMessage.text}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim() || keySaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {keySaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Verify & Activate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bounce keyframe */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1.0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
