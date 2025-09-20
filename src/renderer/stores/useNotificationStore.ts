import { create } from 'zustand'
import type { Notification } from '../components/NotificationToast'

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }))
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => {
    set({ notifications: [] })
  },
}))

// Helper function to show notifications from error events
export const showErrorNotification = (error: {
  message: string
  code?: string
  userMessage?: string
  suggestions?: string[]
}) => {
  const { addNotification } = useNotificationStore.getState()

  addNotification({
    type: 'error',
    title: error.code === 'CIRCUIT_OPEN' ? 'Service Temporarily Unavailable' : 'Error',
    message: error.userMessage || error.message,
    suggestions: error.suggestions,
    autoHide: error.code !== 'CIRCUIT_OPEN',
  })
}