import { motion } from 'framer-motion'
import { FileText, Code, Zap, Brain } from 'lucide-react'

export default function ApiDocsView() {
  const endpoints = [
    {
      method: 'POST',
      path: '/v1/chat/completions',
      description: 'Send messages to AI agents with automatic routing',
      example: {
        model: 'auto',
        messages: [{ role: 'user', content: 'Calculate 15% of 200' }],
        temperature: 0.7,
        max_tokens: 1000
      }
    },
    {
      method: 'GET',
      path: '/admin/v1/models',
      description: 'List available AI models and their capabilities',
      example: null
    },
    {
      method: 'POST',
      path: '/admin/v1/generate_key',
      description: 'Generate new API keys for client applications',
      example: {
        name: 'Mobile App Key',
        user_id: 'user-123',
        metadata: { purpose: 'mobile-client' }
      }
    }
  ]

  const agents = [
    {
      name: 'Logic Agent',
      model: 'DeepSeek R1',
      color: 'from-purple-500/20 to-violet-600/20',
      icon: Brain,
      description: 'Advanced reasoning, system design, complex problem solving',
      triggers: ['riddle', 'architecture', 'design', 'complex reasoning']
    },
    {
      name: 'Math Agent',
      model: 'Qwen 2.5 72B',
      color: 'from-blue-500/20 to-cyan-600/20',
      icon: Brain,
      description: 'Mathematical calculations, optimization, business logic',
      triggers: ['calculate', 'math', 'percentage', 'cost', 'optimization']
    },
    {
      name: 'Code Agent',
      model: 'Llama 3.3 70B',
      color: 'from-green-500/20 to-emerald-600/20',
      icon: Code,
      description: 'Code generation, debugging, programming assistance',
      triggers: ['write code', 'function', 'python', 'javascript', 'algorithm']
    },
    {
      name: 'Chat Agent',
      model: 'Llama 3.1 8B',
      color: 'from-gray-500/20 to-slate-600/20',
      icon: Zap,
      description: 'General conversation, quick responses, simple queries',
      triggers: ['hello', 'how are you', 'general questions']
    }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-nav border-b border-white/10 p-4">
        <h1 className="text-xl font-semibold text-white">API Documentation</h1>
        <p className="text-white/60 text-sm">Integration guide for Cortex V2.6 Agentic System</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap size={24} className="text-white" />
            <h2 className="text-lg font-semibold text-white">Quick Start</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Base URL</h3>
              <code className="block bg-black/30 p-3 rounded-lg text-green-400 font-mono text-sm">
                https://cortex-v25-cloud-native.onrender.com
              </code>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Authentication</h3>
              <code className="block bg-black/30 p-3 rounded-lg text-blue-400 font-mono text-sm">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Example Request</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-white font-mono text-sm overflow-x-auto">
{`curl -X POST \\
  https://cortex-v25-cloud-native.onrender.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      {"role": "user", "content": "Calculate 15% of 200"}
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'`}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* AI Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Brain size={24} className="text-white" />
            <h2 className="text-lg font-semibold text-white">AI Agents</h2>
          </div>

          <div className="grid gap-4">
            {agents.map((agent, index) => {
              const Icon = agent.icon
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-panel p-4 bg-gradient-to-r ${agent.color}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={20} className="text-white mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{agent.name}</h3>
                        <span className="text-xs bg-black/20 px-2 py-1 rounded text-white/80">
                          {agent.model}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm mb-3">{agent.description}</p>
                      <div>
                        <span className="text-white/60 text-xs">Triggers: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.triggers.map((trigger) => (
                            <span
                              key={trigger}
                              className="text-xs bg-black/20 px-2 py-1 rounded text-white/70"
                            >
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* API Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText size={24} className="text-white" />
            <h2 className="text-lg font-semibold text-white">API Endpoints</h2>
          </div>

          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                    endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-white font-mono">{endpoint.path}</code>
                </div>
                
                <p className="text-white/80 text-sm mb-3">{endpoint.description}</p>
                
                {endpoint.example && (
                  <div>
                    <h4 className="text-white/90 text-sm font-medium mb-2">Example Request Body:</h4>
                    <pre className="bg-black/30 p-3 rounded text-xs font-mono text-white/90 overflow-x-auto">
                      {JSON.stringify(endpoint.example, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Response Format */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Response Format</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-2">Chat Completion Response</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-white/90 font-mono text-sm overflow-x-auto">
{`{
  "id": "chatcmpl-123",
  "model": "qwen/qwen-2.5-72b-instruct",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "15% of 200 is 30."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Error Response</h3>
              <pre className="bg-black/30 p-4 rounded-lg text-red-400 font-mono text-sm overflow-x-auto">
{`{
  "error": {
    "message": "Invalid API key",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}