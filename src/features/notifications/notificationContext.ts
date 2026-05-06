import { createContext, useContext } from 'react'

export type NotificationType = 'error' | 'success' | 'info'

export type NotifyOptions = {
  title?: string
  duration?: number
}

export type NotificationContextValue = {
  notify: (type: NotificationType, message: string, options?: NotifyOptions) => void
  notifyError: (message: string, options?: NotifyOptions) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
