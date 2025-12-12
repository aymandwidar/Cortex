import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check } from 'lucide-react'
import { listApiKeys, generateApiKey, revokeApiKey } from '../api'
import { ApiKey } from '../types'
import { formatDistanceToNow } from 'date-fns'
import './ApiKeys.css'

interface ApiKeysProps {
  masterKey: string
}

export default function ApiKeys({ masterKey }: ApiKeysProps) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyUserId, setNewKeyUserId] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const fetchKeys = async () => {
    try {
      const data = await listApiKeys(masterKey)
      setKeys(data)
    } catch (error) {
      console.error('Failed to fetch keys:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [masterKey])

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await generateApiKey(masterKey, newKeyName, newKeyUserId || undefined)
      setGeneratedKey(result.key)
      setNewKeyName('')
      setNewKeyUserId('')
      await fetchKeys()
    } catch (error) {
      console.error('Failed to generate key:', error)
      alert('Failed to generate API key')
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this key?')) return
    
    try {
      await revokeApiKey(masterKey, keyId)
      await fetchKeys()
    } catch (error) {
      console.error('Failed to revoke key:', error)
      alert('Failed to revoke API key')
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const closeModal = () => {
    setShowModal(false)
    setGeneratedKey(null)
    setNewKeyName('')
    setNewKeyUserId('')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="api-keys">
      <div className="page-header">
        <h1 className="page-title">API Keys</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Generate Key
        </button>
      </div>

      <div className="keys-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Key Prefix</th>
              <th>User ID</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="font-medium">{key.name}</td>
                <td className="font-mono">{key.key_prefix}</td>
                <td>{key.user_id || '-'}</td>
                <td>{formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}</td>
                <td>
                  {key.last_used_at
                    ? formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })
                    : 'Never'}
                </td>
                <td>
                  <span className={`status-badge ${key.is_active ? 'active' : 'inactive'}`}>
                    {key.is_active ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td>
                  {key.is_active && (
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleRevokeKey(key.id)}
                      title="Revoke key"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{generatedKey ? 'API Key Generated' : 'Generate New API Key'}</h2>
            
            {generatedKey ? (
              <div className="generated-key-container">
                <p className="warning-text">
                  Save this key now. You won't be able to see it again!
                </p>
                <div className="key-display">
                  <code>{generatedKey}</code>
                  <button
                    className="btn-icon"
                    onClick={() => handleCopyKey(generatedKey)}
                  >
                    {copiedKey === generatedKey ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <button className="btn-primary" onClick={closeModal}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey}>
                <div className="form-group">
                  <label>Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>User ID (optional)</label>
                  <input
                    type="text"
                    value={newKeyUserId}
                    onChange={(e) => setNewKeyUserId(e.target.value)}
                    placeholder="e.g., user123"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Generate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
