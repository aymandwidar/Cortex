import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Image as ImageIcon, X, Loader, Settings as SettingsIcon } from 'lucide-react'
import './Playground.css'

interface PlaygroundProps {
  masterKey: string
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model?: string
  image?: string
}

interface ModelConfig {
  name: string
  description: string
  category: string
}

const AVAILABLE_MODELS: ModelConfig[] = [
  { name: 'reflex-model', description: 'Fast responses - Groq Llama 3.1 8B (FREE)', category: 'Quick Chat' },
  { name: 'analyst-model', description: 'Code & Analysis - Groq Llama 3.1 70B (FREE)', category: 'Code Generation' },
  { name: 'genius-model', description: 'Complex Reasoning - Google Gemini Pro (FREE)', category: 'Complex Tasks' },
  { name: 'groq/llama-3.1-8b-instant', description: 'Groq Llama 3.1 8B (Direct)', category: 'Groq' },
  { name: 'groq/llama-3.1-70b-versatile', description: 'Groq Llama 3.1 70B (Direct)', category: 'Groq' },
  { name: 'gemini/gemini-pro', description: 'Google Gemini Pro (Direct)', category: 'Google' },
  { name: 'gemini/gemini-pro-vision', description: 'Gemini Pro Vision (Images)', category: 'Google' },
]

export default function Playground({ masterKey }: PlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('reflex-model')
  const [useSemanticRouting, setUseSemanticRouting] = useState(false)
  const [userId, setUserId] = useState('playground-user')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  // Image upload
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Settings panel
  const [showSettings, setShowSettings] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize API key on mount
  useEffect(() => {
    initializeApiKey()
  }, [masterKey])

  const initializeApiKey = async () => {
    try {
      // Check if we have a playground API key in localStorage
      const storedKey = localStorage.getItem('playground_api_key')
      if (storedKey) {
        setApiKey(storedKey)
        return
      }

      // Create a new API key for the playground
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/admin/v1/generate_key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${masterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Playground Test Key',
          user_id: 'playground-user',
          metadata: { purpose: 'playground-testing' }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create API key')
      }

      const data = await response.json()
      const newKey = data.key
      
      // Store for future use
      localStorage.setItem('playground_api_key', newKey)
      setApiKey(newKey)
    } catch (error) {
      console.error('Failed to initialize API key:', error)
      setInitError('Failed to initialize playground. Please check your master key and try refreshing.')
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      image: selectedImage || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Build request payload
      const payload: any = {
        model: useSemanticRouting ? 'auto' : selectedModel,
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: input }
        ],
        temperature,
        max_tokens: maxTokens,
        user: userId
      }

      // Add image if present (for multimodal models)
      if (selectedImage) {
        payload.messages[payload.messages.length - 1].content = [
          { type: 'text', text: input },
          { type: 'image_url', image_url: { url: selectedImage } }
        ]
      }

      if (!apiKey) {
        throw new Error('API key not initialized. Please refresh the page.')
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
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
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
        model: data.model
      }

      setMessages(prev => [...prev, assistantMessage])
      setSelectedImage(null)
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      audioChunksRef.current = []
      
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Call Whisper API for transcription
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.webm')
      formData.append('model', 'whisper-1')
      
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = async () => {
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        const response = await fetch(`${API_BASE_URL}/v1/audio/transcriptions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${masterKey}`
          },
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          setInput(data.text)
        } else {
          console.error('Transcription failed:', response.statusText)
          alert('Voice transcription failed. Please try typing instead.')
        }
      }
    } catch (error) {
      console.error('Failed to transcribe audio:', error)
      alert('Voice transcription failed. Please try typing instead.')
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearConversation = () => {
    if (confirm('Clear all messages?')) {
      setMessages([])
    }
  }

  // Show loading or error state during initialization
  if (!apiKey && !initError) {
    return (
      <div className="playground-container">
        <div className="playground-header">
          <h1>AI Playground</h1>
          <p>Initializing...</p>
        </div>
        <div className="messages-container">
          <div className="empty-state">
            <Loader className="spinner" size={48} />
            <h2>Setting up playground...</h2>
            <p>Creating test API key for you</p>
          </div>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="playground-container">
        <div className="playground-header">
          <h1>AI Playground</h1>
          <p>Initialization Error</p>
        </div>
        <div className="messages-container">
          <div className="empty-state">
            <h2>Failed to Initialize</h2>
            <p>{initError}</p>
            <button onClick={initializeApiKey} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="playground-container">
      <div className="playground-header">
        <div>
          <h1>AI Playground</h1>
          <p>Test different models with text, voice, and images</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
            <SettingsIcon size={20} />
            Settings
          </button>
          <button onClick={clearConversation} className="clear-btn">
            Clear Chat
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-group">
            <label>Model Selection</label>
            <div className="model-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={useSemanticRouting}
                  onChange={(e) => setUseSemanticRouting(e.target.checked)}
                />
                Use Semantic Routing (Auto-select model)
              </label>
            </div>
            {!useSemanticRouting && (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
              >
                {AVAILABLE_MODELS.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="setting-group">
            <label>User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="user-123"
              className="setting-input"
            />
            <small>Used for memory and personalization</small>
          </div>

          <div className="setting-group">
            <label>Temperature: {temperature}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="setting-slider"
            />
            <small>Higher = more creative, Lower = more focused</small>
          </div>

          <div className="setting-group">
            <label>Max Tokens: {maxTokens}</label>
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="setting-slider"
            />
            <small>Maximum response length</small>
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <h2>Welcome to the AI Playground!</h2>
            <p>Start a conversation, use voice input, or upload an image to test the system.</p>
            <div className="feature-grid">
              <div className="feature-card">
                <Send size={24} />
                <h3>Text Chat</h3>
                <p>Type messages and get AI responses</p>
              </div>
              <div className="feature-card">
                <Mic size={24} />
                <h3>Voice Input</h3>
                <p>Speak your message using voice recognition</p>
              </div>
              <div className="feature-card">
                <ImageIcon size={24} />
                <h3>Image Analysis</h3>
                <p>Upload images for multimodal AI analysis</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message message-${message.role}`}>
            <div className="message-header">
              <span className="message-role">{message.role}</span>
              {message.model && <span className="message-model">{message.model}</span>}
              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {message.image && (
              <img src={message.image} alt="Uploaded" className="message-image" />
            )}
            <div className="message-content">{message.content}</div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-header">
              <span className="message-role">assistant</span>
            </div>
            <div className="message-content">
              <Loader className="spinner" size={20} />
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        {selectedImage && (
          <div className="image-preview">
            <img src={selectedImage} alt="Preview" />
            <button onClick={() => setSelectedImage(null)} className="remove-image">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="input-row">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="input-action-btn"
            title="Upload image"
          >
            <ImageIcon size={20} />
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`input-action-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            placeholder="Type a message or use voice input..."
            className="message-input"
            disabled={loading}
          />

          <button
            onClick={handleSendMessage}
            disabled={loading || (!input.trim() && !selectedImage)}
            className="send-btn"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
