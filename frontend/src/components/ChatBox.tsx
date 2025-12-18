'use client';

import { useState } from 'react';
import { chat } from '@/lib/api';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // In a real app, you'd get the language from context
      const res = await chat(userMsg.content, 'en');
      setMessages((prev) => [...prev, { role: 'bot', content: res.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', content: "Sorry, I couldn't connect to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-green-600 p-4 text-white font-bold text-lg flex justify-between items-center">
        <span>🤖 Smart Farming Assistant</span>
        <span className="text-xs bg-green-700 px-2 py-1 rounded">IBM Granite Powered</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-green-500 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm italic p-2">Thinking...</div>}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about crops, weather, pest control..."
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-black" 
        />
        <button 
          onClick={sendMessage} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
