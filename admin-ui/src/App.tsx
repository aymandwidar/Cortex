import React, { useState, useEffect, useRef } from 'react';
import { Send, Camera, Mic, Settings, X } from 'lucide-react';

interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
  model?: string; 
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Cortex OS Online. Ready.', model: 'System' }
  ]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { role: 'user', content: input }]);
    setInput('');
    
    // Simulate Response
    setTimeout(() => {
      setMessages(p => [...p, { 
        role: 'assistant', 
        content: "Processing...", 
        model: 'Orchestrator' 
      }]);
    }, 600);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center p-0 md:p-6 text-white overflow-hidden">
      {/* 1. Main Glass Container */}
      <main className="nano-card w-full max-w-lg h-full md:h-[90vh] flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Header */}
        <header className="p-4 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h1 className="text-sm font-bold tracking-widest uppercase">Cortex OS</h1>
          </div>
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <Settings size={20} className="text-white/70" />
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' 
                  : 'bg-white/10 text-gray-100 rounded-2xl rounded-bl-sm border border-white/5'
              }`}>
                {m.content}
              </div>
              {m.role === 'assistant' && (
                <span className="text-[10px] text-white/30 mt-1 ml-1 uppercase">
                  {m.model}
                </span>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Floating Input Dock */}
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
          <div className="flex items-center gap-2">
            <button className="p-3 bg-white/5 rounded-full text-white/50 hover:text-white">
              <Camera size={20}/>
            </button>
            <div className="flex-1 relative">
              <input 
                className="nano-input" 
                placeholder="Ask anything..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 rounded-full"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="nano-card w-full max-w-sm p-6 bg-slate-900">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">System</h2>
                <button onClick={() => setShowSettings(false)}>
                  <X size={20}/>
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h3 className="text-xs uppercase text-gray-400 mb-2">Active Agents</h3>
                  <div className="flex flex-col gap-2 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>Logic</span> 
                      <span className="text-purple-300">DeepSeek R1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Math</span> 
                      <span className="text-blue-300">Qwen 2.5</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 bg-indigo-600 rounded-xl font-bold text-sm">
                  Generate App Key
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}