import React, { createContext, useContext, useState } from 'react'

export type AgentType = 'auto' | 'logic' | 'math' | 'code' | 'chat'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agent?: AgentType
  model?: string
  thinking?: string
  image?: string
}

export interface AgentContextType {
  messages: Message[]
  isThinking: boolean
  currentAgent: AgentType | null
  thinkingStartTime: Date | null
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setThinking: (thinking: boolean, agent?: AgentType) => void
  sendMessage: (content: string, forceAgent?: AgentType, image?: string, temperature?: number) => Promise<void>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null)
  const [thinkingStartTime, setThinkingStartTime] = useState<Date | null>(null)

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const setThinking = (thinking: boolean, agent?: AgentType) => {
    setIsThinking(thinking)
    setCurrentAgent(agent || null)
    setThinkingStartTime(thinking ? new Date() : null)
  }

  const sendMessage = async (content: string, forceAgent?: AgentType, image?: string, temperature: number = 0.7) => {
    // Add user message
    addMessage({
      role: 'user',
      content,
      image
    })

    // Start thinking
    setThinking(true, forceAgent || 'auto')

    try {
      const apiKey = localStorage.getItem('cortex-api-key')
      if (!apiKey) {
        throw new Error('No API key available')
      }

      // Build request payload
      const payload: any = {
        model: forceAgent || 'auto',
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content }
        ],
        temperature: temperature,
        max_tokens: 2000,
        user: 'cortex-os-user'
      }

      // Add image if present
      if (image) {
        payload.messages[payload.messages.length - 1].content = [
          { type: 'text', text: content },
          { type: 'image_url', image_url: { url: image } }
        ]
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://cortex-v25-cloud-native.onrender.com'}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      const responseContent = data.choices[0].message.content
      const modelUsed = data.model

      // Determine agent type from model
      let agentType: AgentType = 'chat'
      if (modelUsed.includes('qwen')) agentType = 'math'
      else if (modelUsed.includes('deepseek')) agentType = 'logic'
      else if (modelUsed.includes('llama-3.3') || modelUsed.includes('versatile')) agentType = 'code'

      // Extract thinking process if present
      let thinking: string | undefined
      let cleanContent = responseContent
      
      const thinkMatch = responseContent.match(/<think>(.*?)<\/think>/s)
      if (thinkMatch) {
        thinking = thinkMatch[1].trim()
        cleanContent = responseContent.replace(/<think>.*?<\/think>/s, '').trim()
      }

      // Add assistant message
      addMessage({
        role: 'assistant',
        content: cleanContent,
        agent: agentType,
        model: modelUsed,
        thinking
      })

    } catch (error) {
      console.error('Failed to send message:', error)
      addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        agent: 'chat'
      })
    } finally {
      setThinking(false)
    }
  }

  return (
    <AgentContext.Provider value={{
      messages,
      isThinking,
      currentAgent,
      thinkingStartTime,
      addMessage,
      clearMessages,
      setThinking,
      sendMessage
    }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}