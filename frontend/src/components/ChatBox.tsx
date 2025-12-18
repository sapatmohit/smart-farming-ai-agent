'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, ChatResponse } from '@/lib/api';
import { getTranslations, Locale } from '@/i18n';

interface Message {
  role: 'user' | 'bot';
  content: string;
  sources?: string[];
  confidence?: 'low' | 'medium' | 'high';
}

interface ChatBoxProps {
  locale: Locale;
}

export default function ChatBox({ locale }: ChatBoxProps) {
  const t = getTranslations(locale);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: `**${t.chat.welcomeTitle}**\n\n${t.chat.welcomeMessage}`,
        confidence: 'high'
      }]);
    }
  }, [locale]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response: ChatResponse = await sendChatMessage({
        query: input,
        language: locale,
      });
      
      setMessages((prev) => [...prev, {
        role: 'bot',
        content: response.answer,
        sources: response.sources,
        confidence: response.confidence,
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'bot',
        content: t.chat.error,
        confidence: 'low'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    const styles = {
      high: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    const labels = {
      high: t.common.high,
      medium: t.common.medium,
      low: t.common.low,
    };
    if (!confidence) return null;
    return (
      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-tighter border ${styles[confidence as keyof typeof styles]}`}>
        {labels[confidence as keyof typeof labels]}
      </span>
    );
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <li key={i} className="ml-4 list-disc marker:text-green-500 mb-1" dangerouslySetInnerHTML={{ __html: line.replace(/^[•-]\s*/, '') }} />;
      }
      return <p key={i} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className="flex flex-col h-[650px] w-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-fade-in">
      {/* Header - Minimalist */}
      <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">🤖</div>
          <div>
            <h2 className="font-extrabold text-slate-800 leading-tight">AI Farming Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active & Ready</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 bg-white selection:bg-green-100">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                {msg.role === 'user' ? '👤' : '🌾'}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 text-slate-700 rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none shadow-sm'
                }`}>
                  <div className="prose-sm">
                    {formatMessage(msg.content)}
                  </div>
                </div>
                
                {msg.role === 'bot' && (msg.confidence || msg.sources?.length) && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {getConfidenceBadge(msg.confidence)}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex gap-1">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-0.5">Sources:</span>
                        <span className="text-[10px] font-bold text-slate-500 underline decoration-slate-200">
                          {msg.sources.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center animate-pulse">🌾</div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-none px-5 py-3 border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Floats gracefully */}
      <div className="p-6 bg-white border-t border-slate-50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t.chat.placeholder}
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-100 pl-6 pr-24 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:bg-white focus:border-green-500/20 text-slate-700 font-medium transition-all text-sm disabled:opacity-50"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition-all disabled:opacity-30 disabled:scale-95 font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-200"
          >
            <span>{t.chat.send}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
