export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  user_id: string | null
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export interface Model {
  model_name: string
  litellm_params: {
    model: string
    api_key: string
  }
}

export interface HealthStatus {
  status: string
  timestamp: string
  dependencies?: {
    database: string
    redis: string
    qdrant: string
  }
}
