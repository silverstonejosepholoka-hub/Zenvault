import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { getVaultAssistantResponse } from '@/src/services/geminiService';
import { cn } from '@/src/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome back, Joseph. Your vault is currently showing a 12% yield growth. How can I assist your financial journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await getVaultAssistantResponse(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-6 z-[60] w-14 h-14 bg-primary-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border-4 border-white"
      >
        <Sparkles size={24} className="animate-pulse" />
      </button>

      {/* Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10 flex flex-col h-[600px] max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 bg-primary-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} className="text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight">VAULT CONCIERGE</h3>
                    <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest">Neural Intelligence Active</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
              >
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={cn(
                      "flex gap-3",
                      m.role === 'user' ? "flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                      m.role === 'assistant' ? "bg-primary-50 text-primary-600" : "bg-slate-100 text-slate-600"
                    )}>
                      {m.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed",
                      m.role === 'assistant' ? "bg-primary-50 text-slate-800 rounded-tl-none" : "bg-slate-900 text-white rounded-tr-none"
                    )}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mt-1">
                      <Bot size={18} />
                    </div>
                    <div className="bg-primary-50 p-4 rounded-3xl rounded-tl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 pt-0">
                <div className="p-2 bg-slate-50 rounded-[32px] border border-slate-100 flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your vault..."
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-slate-400 font-medium"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-12 h-12 bg-primary-900 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
