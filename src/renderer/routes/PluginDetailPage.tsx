import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { JSONSchemaType } from 'ajv'
import type { ActionDefinition, TriggerDefinition } from '@shared/plugins/types'
import ConfigForm from '../components/ConfigForm'
import StatusBadge from '../components/StatusBadge'
import { usePluginStore } from '../stores/usePluginStore'
import './PluginDetailPage.css'

interface PluginDetailsResponse {
  manifest: {
    id: string
    name: string
    version: string
    author: string
    description?: string
    homepage?: string
  }
  triggers: TriggerDefinition[]
  actions: ActionDefinition[]
  configSchema?: JSONSchemaType<unknown> | Record<string, unknown>
}

export const PluginDetailPage = () => {
  const { pluginId } = useParams<{ pluginId: string }>()
  const navigate = useNavigate()
  const [details, setDetails] = useState<PluginDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fetchConfig = usePluginStore((state) => state.fetchConfig)
  const saveConfig = usePluginStore((state) => state.saveConfig)
  const status = usePluginStore((state) => (pluginId ? state.statuses[pluginId] : undefined))
  const [config, setConfig] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!pluginId) {
      navigate('/plugins')
      return
    }

    const fetchDetails = async () => {
      setLoading(true)
      try {
        const pluginDetails = await window.juju22.plugins.get(pluginId)
        if (!pluginDetails) {
          navigate('/plugins')
          return
        }
        setDetails(pluginDetails)
        const existingConfig = await fetchConfig(pluginId)
        setConfig(existingConfig)
      } finally {
        setLoading(false)
      }
    }

    void fetchDetails()
  }, [pluginId, navigate, fetchConfig])

  if (loading) {
    return <p>Loading plugin…</p>
  }

  if (!details || !pluginId) {
    return <p>Plugin not found.</p>
  }

  const handleSave = async (nextConfig: Record<string, unknown>) => {
    setSaving(true)
    try {
      const saved = await saveConfig(pluginId, nextConfig)
      setConfig(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="plugin-detail">
      <header>
        <div>
          <button type="button" className="ghost-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2>{details.manifest.name}</h2>
          <p>{details.manifest.description ?? 'No description provided.'}</p>
          <p className="plugin-meta">
            {details.manifest.author} • v{details.manifest.version}
            {details.manifest.homepage ? (
              <>
                {' '}
                •{' '}
                <a href={details.manifest.homepage} target="_blank" rel="noreferrer">
                  Documentation
                </a>
              </>
            ) : null}
          </p>
        </div>
        <StatusBadge status={status} />
      </header>

      <section>
        <h3>Configuration</h3>
        <ConfigForm
          schema={details.configSchema}
          initialValues={config}
          onSubmit={handleSave}
          submitting={saving}
        />
      </section>

      <section className="plugin-detail__grid">
        <div>
          <h3>Triggers</h3>
          <ul>
            {details.triggers.map((trigger) => (
              <li key={trigger.id}>
                <strong>{trigger.name}</strong>
                <span>{trigger.id}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Actions</h3>
          <ul>
            {details.actions.map((action) => (
              <li key={action.id}>
                <strong>{action.name}</strong>
                <span>{action.id}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

export default PluginDetailPage
