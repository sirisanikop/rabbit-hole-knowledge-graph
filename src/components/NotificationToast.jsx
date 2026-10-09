import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function NotificationToast({
  notification,
  onDismiss,
}) {
  useEffect(() => {
    if (notification && notification.type === 'success') {
      const timer = setTimeout(() => {
        onDismiss()
      }, 4500)
      return () => clearTimeout(timer)
    }
  }, [notification, onDismiss])

  if (!notification) return null

  const { type = 'info', title, message } = notification

  const typeConfig = {
    success: {
      border: 'border-emerald-500/50 bg-zinc-900/95',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      titleColor: 'text-emerald-300',
    },
    error: {
      border: 'border-rose-500/50 bg-zinc-900/95',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
      titleColor: 'text-rose-300',
    },
    info: {
      border: 'border-indigo-500/50 bg-zinc-900/95',
      icon: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
      titleColor: 'text-indigo-300',
    },
  }[type] || {
    border: 'border-zinc-700 bg-zinc-900/95',
    icon: <Info className="w-4 h-4 text-zinc-400 shrink-0" />,
    titleColor: 'text-zinc-200',
  }

  return (
    <div className="fixed top-16 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-3 duration-200">
      <div
        className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${typeConfig.border}`}
      >
        <div className="pt-0.5">{typeConfig.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-xs font-semibold ${typeConfig.titleColor}`}>
              {title}
            </h4>
          )}
          <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed break-words">
            {message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
