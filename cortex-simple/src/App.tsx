import { useState, useEffect, useRef } from 'react';
import { Send, Camera, Settings, X, Sparkles } from 'lucide-react';

// --- SELF-CONTAINED STYLES (Guarantees the look works) ---
const nanoStyles = `
body { 
  margin: 0; 
  background: #0f172a; 
  font-family: system-ui, sans-serif; 
  overflow: hidden; 
}

.nano-bg { 
  position: fixed; 
  inset: 0; 
  z-index: 0;
  background: radial-gradient(circle at 50% 0%, #312e81 0%, #0f172a 40%, #000000 100%);
}

.glass-island {
  position: relative; 
  z-index: 10;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  overflow: hidden;
  display: flex; 
  flex-direction: column;
}

.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white; 
  border-radius: 9999px; 
  padding: 14px 24px; 
  width: 100%; 
  outline: none;
}

.glass-input:focus { 
  border-color: #a78bfa; 
  background: rgba(255, 255, 255, 0.1); 
}

.msg-bubble { 
  max-width: 85%; 
  padding: 12px 16px; 
  font-size: 14px; 
  line-height: 1.5; 
}

.msg-user { 
  background: #4f46e5; 
  color: white; 
  border-radius: 18px 18px 4px 18px; 
  align-self: flex-end; 
}

.msg-ai { 
  background: rgba(255,255,255,0.08); 
  color: #e2e8f0; 
  border-radius: 18px 18px 18px 4px; 
  align-self: flex-start; 
}
`;

interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
  model?: string; 
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Cortex OS Online. Nano-Glass Interface Loaded.', model: 'System' }
  ]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(p => [...p, { role: 'assistant', content: "Reasoning...", model: 'Orchestrator' }]);
    }, 600);
  };

  return (
    <>
      <style>{nanoStyles}</style>
      <div className="nano-bg flex items-center justify-center h-screen w-screen p-4 md:p-6">
        {/* The Floating Island */}
        <main className="glass-island w-full max-w-lg h-full md:h-[85vh]">
          {/* Header */}
          <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
              <h1 className="text-sm font-bold tracking-[0.2em] text-white/90 uppercase">Cortex OS</h1>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-full transition text-white">
              <Settings size={18} />
            </button>
          </header>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={m.role === 'user' ? 'msg-bubble msg-user' : 'msg-bubble msg-ai'}>
                  {m.content}
                </div>
                {m.role === 'assistant' && (
                  <span className="text-[10px] text-white/40 mt-1 ml-2 uppercase flex items-center gap-1">
                    <Sparkles size={8} /> {m.model}
                  </span>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Input Dock */}
          <div className="p-4 bg-gradient-to-t from-black/40 to-transparent">
            <div className="flex items-center gap-2 relative">
              <button className="p-3 bg-white/5 rounded-full text-white/60 hover:text-white transition">
                <Camera size={20}/>
              </button>
              <div className="flex-1 relative">
                <input 
                  className="glass-input" 
                  placeholder="Ask Cortex..." 
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full transition shadow-lg shadow-indigo-500/40"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Settings Overlay */}
          {showSettings && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className="w-full max-w-sm p-6 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex justify-between mb-6">
                  <h2 className="text-white font-bold">System</h2>
                  <button onClick={() => setShowSettings(false)} className="text-white">
                    <X size={20}/>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded border border-white/5">
                    <div className="text-xs text-gray-400 mb-1 uppercase">Logic Core</div>
                    <div className="text-purple-300 text-sm font-mono">DeepSeek R1</div>
                  </div>
                  <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide">
                    GENERATE APP KEY
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}