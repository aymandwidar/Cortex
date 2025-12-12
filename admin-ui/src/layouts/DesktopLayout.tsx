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
import { cn } from '../utils/cn'

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
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Left Sidebar */}
      <div className="w-80 glass-nav border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            CORTEX OS
          </motion.h1>
          <p className="text-white/60 text-sm mt-1">Intelligence Operating System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                  isActive 
                    ? "bg-white/20 text-white shadow-lg" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="font-medium">{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="desktop-tab-indicator"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Primary Panel (65%) */}
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

        {/* Right Panel (35%) - Memory Stream */}
        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-96 border-l border-white/10"
          >
            <MemoryStream />
          </motion.div>
        )}
      </div>
    </div>
  )
}