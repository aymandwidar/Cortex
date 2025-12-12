import { ApiKey, Model, HealthStatus } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cortex-v25-cloud-native.onrender.com'

export async function generateApiKey(
  masterKey: string,
  name: string,
  userId?: string
): Promise<{ key: string; key_id: string }> {
  const response = await fetch(`${API_BASE}/admin/v1/generate_key`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${masterKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, user_id: userId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate API key')
  }

  return response.json()
}

export async function listApiKeys(masterKey: string): Promise<ApiKey[]> {
  const response = await fetch(`${API_BASE}/admin/v1/keys`, {
    headers: {
      'Authorization': `Bearer ${masterKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch API keys')
  }

  const data = await response.json()
  return data.keys
}

export async function revokeApiKey(masterKey: string, keyId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/v1/revoke_key`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${masterKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key_id: keyId }),
  })

  if (!response.ok) {
    throw new Error('Failed to revoke API key')
  }
}

export async function listModels(masterKey: string): Promise<Model[]> {
  const response = await fetch(`${API_BASE}/admin/v1/models`, {
    headers: {
      'Authorization': `Bearer ${masterKey}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }

  const data = await response.json()
  return data.models
}

export async function getHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE}/health`)
  return response.json()
}

export async function getHealthReady(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE}/health/ready`)
  return response.json()
}

export async function getMetrics(): Promise<string> {
  const response = await fetch(`${API_BASE}/metrics`)
  return response.text()
}
