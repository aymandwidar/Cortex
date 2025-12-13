import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Brain, Settings, FileText, Activity } from 'lucide-react'
import ChatView from '../views/ChatView'
import MemoryView from '../views/MemoryView'
import SettingsView from '../views/SettingsView'
import ApiDocsView from '../views/ApiDocsView'
import SystemLogsView from '../views/SystemLogsView'
import LoginView from '../views/LoginView'
import MemoryStream from '../components/MemoryStream'
import { useAuth } from '../contexts/AuthContext'

type DesktopTab = 'chat' | 'memory' | 'settings' | 'docs' | 'logs'

export default function DesktopLayout() {
  const [activeTab, setActiveTab] = useState<DesktopTab>('chat')
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginView />
  }

  const tabs = [
    { id: 'chat' as const, icon: MessageCircle, label: 'Chat' },
    { id: 'memory' as const, icon: Brain, label: 'Memory' },
    { id: 'docs' as const, icon: FileText, label: 'API Docs' },
    { id: 'logs' as const, icon: Activity, label: 'System Logs' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Island Container - Floating in Center */}
      <div className="island-container">
        <div className="island-chat flex">
          {/* Left Sidebar - Nano Style */}
          <div className="w-80 flex flex-col border-r border-white/5 pr-6">
            {/* Logo - Nano Style */}
            <div className="pb-6 border-b border-white/5">
              <div className="nano-label">Intelligence OS</div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="nano-title"
              >
                CORTEX
              </motion.h1>
            </div>

            {/* Navigation - Nano Style */}
            <nav className="flex-1 py-6 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left ${
                      isActive 
                        ? "bg-white/10 text-white backdrop-blur-sm border border-white/10" 
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="font-medium tracking-wide">{tab.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="desktop-tab-indicator"
                        className="ml-auto w-2 h-2 bg-violet-400 rounded-full"
                      />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Status - Nano Style */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <div className="halo-orb w-3 h-3 bg-emerald-400 rounded-full" />
                <span className="tracking-wide">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>

          {/* Main Content Area - Island Style */}
          <div className="flex-1 flex pl-6">
            {/* Primary Panel */}
            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeTab === 'chat' && <ChatView />}
                  {activeTab === 'memory' && <MemoryView />}
                  {activeTab === 'settings' && <SettingsView />}
                  {activeTab === 'docs' && <ApiDocsView />}
                  {activeTab === 'logs' && <SystemLogsView />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Panel - Memory Stream */}
            {activeTab === 'chat' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 border-l border-white/5 pl-6"
              >
                <MemoryStream />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}