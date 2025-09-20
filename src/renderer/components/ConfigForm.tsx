import { useEffect, useMemo, useState } from 'react'
import type { JSONSchemaType } from 'ajv'
import type { PluginConfigSnapshot } from '@shared/plugins/types'
import './ConfigForm.css'

export interface ConfigFormProps {
  schema?: JSONSchemaType<unknown> | Record<string, unknown>
  initialValues: PluginConfigSnapshot
  onSubmit: (values: PluginConfigSnapshot) => Promise<void> | void
  submitting?: boolean
}

type JsonSchema = JSONSchemaType<unknown> & {
  properties?: Record<string, JsonSchema>
}

const isObjectSchema = (schema?: JsonSchema): schema is JsonSchema => Boolean(schema && schema.type === 'object' && schema.properties)

const coerceValue = (value: string, schema?: JsonSchema) => {
  if (!schema || schema.type === 'string') return value
  if (schema.type === 'integer' || schema.type === 'number') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }
  if (schema.type === 'boolean') {
    return value === 'true'
  }
  return value
}

export const ConfigForm = ({ schema, initialValues, onSubmit, submitting }: ConfigFormProps) => {
  const [draft, setDraft] = useState<PluginConfigSnapshot>(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [jsonFallback, setJsonFallback] = useState<string>('')

  const objectSchema = useMemo(() => (isObjectSchema(schema as JsonSchema) ? (schema as JsonSchema) : undefined), [schema])

  useEffect(() => {
    setDraft(initialValues)
    setJsonFallback(JSON.stringify(initialValues, null, 2))
  }, [initialValues])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      if (!objectSchema) {
        const next = JSON.parse(jsonFallback)
        await onSubmit(next)
        return
      }
      await onSubmit(draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  if (!objectSchema) {
    return (
      <form className="config-form" onSubmit={handleSubmit}>
        <label className="config-form__label" htmlFor="plugin-config-json">
          Configuration (JSON)
        </label>
        <textarea
          id="plugin-config-json"
          className="config-form__textarea"
          value={jsonFallback}
          onChange={(event) => setJsonFallback(event.target.value)}
          spellCheck={false}
        />
        {error ? <p className="config-form__error">{error}</p> : null}
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Configuration'}
        </button>
      </form>
    )
  }

  return (
    <form className="config-form" onSubmit={handleSubmit}>
      <div className="config-form__grid">
        {Object.entries(objectSchema.properties ?? {}).map(([key, fieldSchema]) => {
          const value = draft[key] ?? fieldSchema.default ?? ''
          const label = fieldSchema.title ?? key
          const description = fieldSchema.description
          if (fieldSchema.type === 'boolean') {
            return (
              <label key={key} className="config-form__field checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) =>
                    setDraft((state) => ({
                      ...state,
                      [key]: event.target.checked,
                    }))
                  }
                />
                <div>
                  <span>{label}</span>
                  {description ? <p>{description}</p> : null}
                </div>
              </label>
            )
          }

          const inputType = fieldSchema.type === 'number' || fieldSchema.type === 'integer' ? 'number' : 'text'

          return (
            <label key={key} className="config-form__field">
              <span>{label}</span>
              <input
                type={inputType}
                value={value as string | number | readonly string[] | undefined}
                onChange={(event) =>
                  setDraft((state) => ({
                    ...state,
                    [key]: coerceValue(event.target.value, fieldSchema),
                  }))
                }
              />
              {description ? <p>{description}</p> : null}
            </label>
          )
        })}
      </div>
      {error ? <p className="config-form__error">{error}</p> : null}
      <button type="submit" className="primary-button" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save Configuration'}
      </button>
    </form>
  )
}

export default ConfigForm
