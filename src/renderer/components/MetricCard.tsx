import type { ReactNode } from 'react'
import './MetricCard.css'

interface MetricCardProps {
  label: string
  value: ReactNode
  description?: ReactNode
}

export const MetricCard = ({ label, value, description }: MetricCardProps) => (
  <div className="metric-card">
    <p className="metric-label">{label}</p>
    <div className="metric-value">{value}</div>
    {description ? <p className="metric-description">{description}</p> : null}
  </div>
)

export default MetricCard
