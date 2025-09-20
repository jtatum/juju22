import { useEffect, useState } from 'react'
import './NotificationToast.css'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  suggestions?: string[]
  autoHide?: boolean
  duration?: number
}

interface NotificationToastProps {
  notification: Notification
  onDismiss: (id: string) => void
}

export const NotificationToast = ({ notification, onDismiss }: NotificationToastProps) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (notification.autoHide !== false) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration ?? 5000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(notification.id), 300)
  }

  return (
    <div className={`notification-toast notification-toast--${notification.type} ${isExiting ? 'notification-toast--exiting' : ''}`}>
      <div className="notification-toast__header">
        <h4>{notification.title}</h4>
        <button
          type="button"
          className="notification-toast__close"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
      <p className="notification-toast__message">{notification.message}</p>
      {notification.suggestions && notification.suggestions.length > 0 && (
        <ul className="notification-toast__suggestions">
          {notification.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export const NotificationContainer = ({ notifications, onDismiss }: NotificationContainerProps) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}