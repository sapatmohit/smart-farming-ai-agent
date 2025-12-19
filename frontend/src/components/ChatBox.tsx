'use client';

import { getTranslations, Locale } from '@/i18n';
import { ChatResponse, sendChatMessage } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';

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

  const suggestions = [
    { title: 'Check Market Prices', subtitle: 'Get latest mandi rates' },
    { title: 'Crop Advisory', subtitle: 'Best crops for current weather' },
    { title: 'Government Schemes', subtitle: 'Find subsidies & loans' },
    { title: 'Weather Forecast', subtitle: 'Next 7 days prediction' },
  ];

  return (
    <div className="flex flex-col h-[70vh] lg:h-[650px] w-full max-w-5xl mx-auto relative">
      
      {/* Zero State / Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-20 py-8 scroll-smooth scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center mt-20 lg:mt-0">
            {/* Glowing Orb */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 mb-8 shadow-2xl shadow-green-500/50 animate-pulse"></div>
            
            <h2 className="text-3xl lg:text-4xl font-semibold text-slate-800 tracking-tight mb-2">
              Good evening, Milovan
            </h2>
            <h3 className="text-xl lg:text-2xl text-slate-400 font-medium mb-12">
              Can I help you with anything?
            </h3>

            {/* Suggestion Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInput(s.title)}
                  className="suggestion-card text-left p-4 rounded-xl flex flex-col gap-1 group"
                >
                  <span className="font-semibold text-slate-700 group-hover:text-green-600 transition-colors text-sm">{s.title}</span>
                  <span className="text-slate-400 text-xs">{s.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                <div className={`max-w-[85%] lg:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Avatar & Name */}
                  <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'
                    }`}>
                      {msg.role === 'user' ? 'M' : 'AI'}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'KisanAI'}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`text-[15px] leading-relaxed text-slate-700 ${
                    msg.role === 'user' ? 'bg-slate-50 px-5 py-3 rounded-2xl rounded-tr-sm' : ''
                  }`}>
                     <div className="prose-sm" dangerouslySetInnerHTML={{ 
                       __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                     }} />
                  </div>
                  
                  {msg.role === 'bot' && (msg.confidence || msg.sources?.length > 0) && (
                    <div className="mt-3 flex gap-2">
                       {getConfidenceBadge(msg.confidence)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">AI</div>
                 <div className="flex gap-1 items-center h-6">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-0 mt-auto">
         <div className="relative group max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 focus-within:shadow-md focus-within:border-green-500/50 transition-all p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t.chat.placeholder || "How can KisanAI help you today?"}
              disabled={loading}
              className="w-full bg-transparent border-none px-4 py-3 focus:ring-0 text-slate-700 placeholder:text-slate-400 font-medium text-base resize-none" 
            />
            <div className="flex justify-between items-center px-2 pb-1 mt-2">
               <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-green-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </button>
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-green-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </button>
               </div>
               <div className="flex items-center gap-3">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-1 cursor-pointer hover:bg-slate-200">
                    <span>KisanAI Pro</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <button 
                    onClick={sendMessage} 
                    disabled={!input.trim()}
                    className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
               </div>
            </div>
         </div>
         <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">KisanAI can make mistakes. Please double-check responses.</p>
      </div>
    </div>
  );
}
