import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Zap, Brain } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to Cortex AI. How can I help you today?', agent: 'System' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const bottomRef = useRef(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    
    const userMessage = { role: 'user', content: input, agent: 'You' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I understand your request. Let me process that for you...',
        agent: 'Cortex AI'
      }]);
      setIsThinking(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Floating Island Container */}
      <div className="nano-card w-full max-w-4xl h-[80vh] flex flex-col p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-light text-white">Cortex AI</h1>
              <p className="text-sm text-white/60">Intelligent Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/60">Online</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                  : 'bg-white/5 border border-white/10'
              } rounded-2xl p-4 backdrop-blur-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  {message.role === 'assistant' && (
                    <Sparkles size={14} className="text-purple-400" />
                  )}
                  <span className="text-xs text-white/60 font-medium">
                    {message.agent}
                  </span>
                </div>
                <p className="text-white/90 leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-blue-400 animate-pulse" />
                  <span className="text-xs text-white/60 font-medium">Cortex AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/60">Thinking</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            className="nano-input resize-none pr-12"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        
      </div>
    </div>
  );
}