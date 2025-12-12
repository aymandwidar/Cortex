import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, Smartphone, Moon, Sun, Download, Trash2, Copy, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAgent } from '../contexts/AgentContext'

export default function SettingsView() {
  const { masterKey, apiKey, logout, generateApiKey } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { clearMessages } = useAgent()
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [qrCodeVisible, setQrCodeVisible] = useState(false)

  const handleGenerateKey = async () => {
    setIsGeneratingKey(true)
    try {
      await generateApiKey()
    } catch (error) {
      console.error('Failed to generate key:', error)
    } finally {
      setIsGeneratingKey(false)
    }
  }

  const handleCopyKey = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const generateQRCode = () => {
    if (!apiKey) return ''
    const connectionData = {
      apiKey,
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://cortex-v25-cloud-native.onrender.com',
      name: 'Cortex OS'
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(connectionData))}`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-nav border-b border-white/10 p-4">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-white/60 text-sm">Configure your Cortex OS experience</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* API Keys Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Key size={24} className="text-white" />
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
          </div>

          <div className="space-y-4">
            {/* Master Key */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Master Key
              </label>
              <div className="glass-input bg-black/20 text-white/60 cursor-not-allowed">
                {masterKey ? '••••••••••••••••' : 'Not set'}
              </div>
              <p className="text-white/50 text-xs mt-1">
                Used for administrative access
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Client API Key
              </label>
              <div className="flex gap-2">
                <div className="flex-1 glass-input bg-black/20 text-white/80 font-mono text-sm">
                  {apiKey ? `${apiKey.substring(0, 20)}...` : 'No key generated'}
                </div>
                <button
                  onClick={handleCopyKey}
                  disabled={!apiKey}
                  className="glass-button px-3 py-2 text-white disabled:opacity-50"
                >
                  {copiedKey ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleGenerateKey}
                  disabled={isGeneratingKey}
                  className="glass-button px-4 py-2 text-white text-sm disabled:opacity-50"
                >
                  {isGeneratingKey ? 'Generating...' : 'Generate New Key'}
                </button>
                <button
                  onClick={() => setQrCodeVisible(!qrCodeVisible)}
                  disabled={!apiKey}
                  className="glass-button px-4 py-2 text-white text-sm disabled:opacity-50"
                >
                  <Smartphone size={16} className="mr-2" />
                  QR Code
                </button>
              </div>
              <p className="text-white/50 text-xs mt-1">
                Used for mobile app connections and API access
              </p>
            </div>

            {/* QR Code */}
            {qrCodeVisible && apiKey && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-4 text-center"
              >
                <h3 className="text-white font-medium mb-3">Mobile Connection</h3>
                <img
                  src={generateQRCode()}
                  alt="Connection QR Code"
                  className="mx-auto rounded-lg"
                />
                <p className="text-white/60 text-xs mt-2">
                  Scan with mobile app to connect
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            {theme === 'dark' ? <Moon size={24} className="text-white" /> : <Sun size={24} className="text-white" />}
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Theme</div>
                <div className="text-white/60 text-sm">Choose your preferred theme</div>
              </div>
              <button
                onClick={toggleTheme}
                className="glass-button px-4 py-2 text-white"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={16} className="mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon size={16} className="mr-2" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Download size={24} className="text-white" />
            <h2 className="text-lg font-semibold text-white">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Clear Chat History</div>
                <div className="text-white/60 text-sm">Remove all conversation data</div>
              </div>
              <button
                onClick={clearMessages}
                className="glass-button px-4 py-2 text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} className="mr-2" />
                Clear All
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Export Data</div>
                <div className="text-white/60 text-sm">Download your conversation history</div>
              </div>
              <button className="glass-button px-4 py-2 text-white">
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Settings size={24} className="text-white" />
            <h2 className="text-lg font-semibold text-white">System Information</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Version</span>
              <span className="text-white">2.6.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Backend</span>
              <span className="text-white">Cortex V2.6 Agentic</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Models</span>
              <span className="text-white">DeepSeek R1, Qwen 2.5, Llama 3.3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">Online</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-8"
        >
          <button
            onClick={logout}
            className="w-full glass-button py-3 text-red-400 hover:text-red-300 border-red-500/30"
          >
            Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  )
}