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
      high: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-red-100 text-red-800 border-red-300',
    };
    const labels = {
      high: t.common.high,
      medium: t.common.medium,
      low: t.common.low,
    };
    if (!confidence) return null;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[confidence as keyof typeof styles]}`}>
        {labels[confidence as keyof typeof labels]}
      </span>
    );
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content.split('\n').map((line, i) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: line.replace(/^[•-]\s*/, '') }} />;
      }
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="font-bold text-lg">{t.app.title}</h2>
            <p className="text-xs text-green-100">Powered by IBM Granite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
          <span className="text-xs">Online</span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Avatar */}
              <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {msg.role === 'user' ? '👤' : '🌾'}
                </div>
                <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-md' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                  
                  {/* Confidence & Sources for bot messages */}
                  {msg.role === 'bot' && (msg.confidence || msg.sources?.length) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {getConfidenceBadge(msg.confidence)}
                      {msg.sources && msg.sources.length > 0 && (
                        <span className="text-gray-500">
                          {t.common.sources}: {msg.sources.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">🌾</div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t.chat.placeholder}
            disabled={loading}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm disabled:bg-gray-50"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
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
