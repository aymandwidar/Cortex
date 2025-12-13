import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Copy, RefreshCw, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsView() {
  const { masterKey, apiKey, generateApiKey } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showMasterKey, setShowMasterKey] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const handleGenerateApiKey = async () => {
    setIsGenerating(true)
    try {
      await generateApiKey()
    } catch (error) {
      console.error('Failed to generate API key:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus(type)
      setTimeout(() => setCopyStatus(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <div className="nano-label">System Configuration</div>
        <h1 className="nano-title">Settings & API Keys</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        
        {/* Authentication Status */}
        <div className="nano-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="halo-orb w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Authentication Status</h3>
              <p className="text-white/60 text-sm">System is authenticated and ready</p>
            </div>
          </div>
        </div>

        {/* Master Key Management */}
        <div className="nano-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="halo-orb w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <Key size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Master Key</h3>
              <p className="text-white/60 text-sm">Administrative access credential</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showMasterKey ? 'text' : 'password'}
                value={masterKey || ''}
                readOnly
                className="nano-input w-full pr-20"
                placeholder="No master key set"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                <button
                  onClick={() => setShowMasterKey(!showMasterKey)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {showMasterKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {masterKey && (
                  <button
                    onClick={() => copyToClipboard(masterKey, 'master')}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {copyStatus === 'master' ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* API Key Management */}
        <div className="nano-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="halo-orb w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Key size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">API Key</h3>
                <p className="text-white/60 text-sm">Required for agent routing and chat functionality</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleGenerateApiKey}
              disabled={isGenerating}
              className="nano-button flex items-center gap-2 disabled:opacity-50"
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>{apiKey ? 'Regenerate' : 'Generate'} Key</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="space-y-3">
            {apiKey ? (
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="nano-input w-full pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey, 'api')}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {copyStatus === 'api' ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="nano-panel p-4 bg-yellow-500/10 border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-300">
                  <AlertCircle size={16} />
                  <span className="text-sm">No API key generated. Click "Generate Key" to enable chat functionality.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="nano-panel p-6">
          <h3 className="text-white font-medium mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/60">Backend URL</div>
              <div className="text-white font-mono text-xs">
                {import.meta.env.VITE_API_BASE_URL || 'https://cortex-v25-cloud-native.onrender.com'}
              </div>
            </div>
            <div>
              <div className="text-white/60">Version</div>
              <div className="text-white">Cortex OS v2.6</div>
            </div>
            <div>
              <div className="text-white/60">Authentication</div>
              <div className="text-emerald-400">Active</div>
            </div>
            <div>
              <div className="text-white/60">API Status</div>
              <div className={apiKey ? "text-emerald-400" : "text-yellow-400"}>
                {apiKey ? "Ready" : "Needs Key"}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Configuration */}
        <div className="nano-panel p-6">
          <h3 className="text-white font-medium mb-4">Agent Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="nano-panel p-4 text-center">
              <div className="halo-orb w-4 h-4 bg-purple-400 rounded-full mb-2 mx-auto"></div>
              <div className="text-white font-medium text-sm">Logic Agent</div>
              <div className="text-white/50 text-xs">DeepSeek R1</div>
            </div>
            <div className="nano-panel p-4 text-center">
              <div className="halo-orb w-4 h-4 bg-cyan-400 rounded-full mb-2 mx-auto"></div>
              <div className="text-white font-medium text-sm">Math Agent</div>
              <div className="text-white/50 text-xs">Qwen 2.5 72B</div>
            </div>
            <div className="nano-panel p-4 text-center">
              <div className="halo-orb w-4 h-4 bg-emerald-400 rounded-full mb-2 mx-auto"></div>
              <div className="text-white font-medium text-sm">Code Agent</div>
              <div className="text-white/50 text-xs">Llama 3.3 70B</div>
            </div>
            <div className="nano-panel p-4 text-center">
              <div className="halo-orb w-4 h-4 bg-slate-400 rounded-full mb-2 mx-auto"></div>
              <div className="text-white font-medium text-sm">Chat Agent</div>
              <div className="text-white/50 text-xs">Llama 3.1 8B</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}