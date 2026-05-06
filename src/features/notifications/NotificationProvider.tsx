import { useCallback, useMemo, useState, type ReactNode } from 'react'

import {
  NotificationContext,
  type NotificationContextValue,
  type NotificationType,
  type NotifyOptions,
} from './notificationContext'


type Notification = {
  id: number
  type: NotificationType
  title: string
  message: string
}

const notificationStyles: Record<NotificationType, { border: string; icon: string; title: string }> = {
  error: {
    border: 'border-red-200 bg-red-50 text-red-900',
    icon: 'bg-red-500 text-white',
    title: 'Error',
  },
  success: {
    border: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: 'bg-emerald-500 text-white',
    title: 'Success',
  },
  info: {
    border: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: 'bg-sky-500 text-white',
    title: 'Notice',
  },
}

const DEFAULT_DURATION = 6000

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  const notify = useCallback(
    (type: NotificationType, message: string, options?: NotifyOptions) => {
      const id = Date.now() + Math.random()
      const style = notificationStyles[type]
      const nextNotification: Notification = {
        id,
        type,
        title: options?.title ?? style.title,
        message,
      }

      setNotifications((current) => [nextNotification, ...current].slice(0, 4))
      window.setTimeout(() => dismiss(id), options?.duration ?? DEFAULT_DURATION)
    },
    [dismiss],
  )

  const notifyError = useCallback(
    (message: string, options?: NotifyOptions) => notify('error', message, options),
    [notify],
  )

  const value = useMemo<NotificationContextValue>(() => ({ notify, notifyError }), [notify, notifyError])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md flex-col gap-3 sm:right-6 sm:top-6 sm:w-full"
      >
        {notifications.map((notification) => {
          const style = notificationStyles[notification.type]
          return (
            <section
              key={notification.id}
              role={notification.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto rounded-2xl border p-4 shadow-playful ${style.border}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black ${style.icon}`}>
                  {notification.type === 'error' ? '!' : '✓'}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-black">{notification.title}</h2>
                  <p className="mt-1 text-sm leading-5">{notification.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(notification.id)}
                  className="rounded-full px-2 text-lg font-black leading-6 text-current opacity-60 transition hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            </section>
          )
        })}
      </div>
    </NotificationContext.Provider>
  )
}
