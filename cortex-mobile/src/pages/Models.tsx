import { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'
import { listModels } from '../api'
import { Model } from '../types'
import './Models.css'

interface ModelsProps {
  masterKey: string
}

export default function Models({ masterKey }: ModelsProps) {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await listModels(masterKey)
        setModels(data)
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [masterKey])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="models">
      <h1 className="page-title">Available Models</h1>

      <div className="models-grid">
        {models.map((model) => (
          <div key={model.model_name} className="model-card">
            <div className="model-icon">
              <Cpu size={24} />
            </div>
            <div className="model-content">
              <h3 className="model-name">{model.model_name}</h3>
              <p className="model-provider">{model.litellm_params.model}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
