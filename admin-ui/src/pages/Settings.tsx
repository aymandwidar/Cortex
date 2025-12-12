import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import './Settings.css'

interface SettingsProps {
  masterKey: string
}

interface Provider {
  provider_name: string
  api_key_preview: string
  provider_config: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function Settings({ masterKey }: SettingsProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    provider_name: '',
    api_key: '',
    is_active: true
  })

  useEffect(() => {
    fetchProviders()
  }, [masterKey])

  const fetchProviders = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/admin/v1/settings/providers`, {
        headers: { 'Authorization': `Bearer ${masterKey}` }
      })
      if (response.ok) {
        const data = await response.json()
        setProviders(data)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/admin/v1/settings/providers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${masterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchProviders()
        setShowAddModal(false)
        setFormData({ provider_name: '', api_key: '', is_active: true })
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to add provider')
      }
    } catch (error) {
      console.error('Failed to add provider:', error)
      alert('Failed to add provider')
    }
  }

  const handleUpdateProvider = async (providerName: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/admin/v1/settings/providers/${providerName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${masterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: formData.api_key || undefined,
          is_active: formData.is_active
        })
      })

      if (response.ok) {
        await fetchProviders()
        setEditingProvider(null)
        setFormData({ provider_name: '', api_key: '', is_active: true })
      } else {
        alert('Failed to update provider')
      }
    } catch (error) {
      console.error('Failed to update provider:', error)
      alert('Failed to update provider')
    }
  }

  const handleDeleteProvider = async (providerName: string) => {
    if (!confirm(`Are you sure you want to delete ${providerName}?`)) return

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/admin/v1/settings/providers/${providerName}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${masterKey}` }
      })

      if (response.ok) {
        await fetchProviders()
      } else {
        alert('Failed to delete provider')
      }
    } catch (error) {
      console.error('Failed to delete provider:', error)
      alert('Failed to delete provider')
    }
  }

  const startEdit = (provider: Provider) => {
    setEditingProvider(provider.provider_name)
    setFormData({
      provider_name: provider.provider_name,
      api_key: '',
      is_active: provider.is_active
    })
  }

  const cancelEdit = () => {
    setEditingProvider(null)
    setFormData({ provider_name: '', api_key: '', is_active: true })
  }

  if (loading) {
    return <div className="loading">Loading settings...</div>
  }

  return (
    <div className="settings">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage AI provider API keys and configurations</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Add Provider
        </button>
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <div className="notice-icon">🔒</div>
        <div>
          <h3>Secure Storage</h3>
          <p>API keys are encrypted at rest using Fernet encryption. Only the last 4 characters are displayed.</p>
        </div>
      </div>

      {/* Providers List */}
      <div className="providers-grid">
        {providers.length === 0 ? (
          <div className="empty-state">
            <p>No providers configured yet.</p>
            <p>Click "Add Provider" to get started.</p>
          </div>
        ) : (
          providers.map((provider) => (
            <div key={provider.provider_name} className="provider-card">
              {editingProvider === provider.provider_name ? (
                // Edit Mode
                <div className="provider-edit">
                  <h3>{provider.provider_name}</h3>
                  <div className="form-group">
                    <label>New API Key (leave empty to keep current)</label>
                    <input
                      type="password"
                      value={formData.api_key}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      placeholder="Enter new API key"
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="provider-actions">
                    <button className="btn-icon" onClick={() => handleUpdateProvider(provider.provider_name)}>
                      <Save size={16} />
                    </button>
                    <button className="btn-icon" onClick={cancelEdit}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="provider-header">
                    <h3>{provider.provider_name}</h3>
                    <span className={`status-badge ${provider.is_active ? 'active' : 'inactive'}`}>
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="provider-info">
                    <div className="info-row">
                      <span className="info-label">API Key:</span>
                      <span className="info-value font-mono">{provider.api_key_preview}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Created:</span>
                      <span className="info-value">{new Date(provider.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Updated:</span>
                      <span className="info-value">{new Date(provider.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="provider-actions">
                    <button className="btn-icon" onClick={() => startEdit(provider)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => handleDeleteProvider(provider.provider_name)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add AI Provider</h2>
            <form onSubmit={handleAddProvider}>
              <div className="form-group">
                <label>Provider Name *</label>
                <select
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  required
                >
                  <option value="">Select provider...</option>
                  <option value="openai">OpenAI</option>
                  <option value="groq">Groq (Free)</option>
                  <option value="openrouter">OpenRouter (Many Free Models)</option>
                  <option value="google">Google Gemini (Free Tier)</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="together">Together AI</option>
                  <option value="huggingface">Hugging Face (Free)</option>
                  <option value="cohere">Cohere</option>
                  <option value="mistral">Mistral</option>
                  <option value="perplexity">Perplexity</option>
                </select>
              </div>
              <div className="form-group">
                <label>API Key *</label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="Enter API key"
                  required
                />
                <small>Your API key will be encrypted and stored securely</small>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
