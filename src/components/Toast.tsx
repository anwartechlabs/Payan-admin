import { AlertCircle, CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  message: string
  tone: 'success' | 'error'
  onDismiss: () => void
}

export function Toast({ message, tone, onDismiss }: ToastProps) {
  return (
    <div className={`toast toast-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {tone === 'success' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message"><X size={16} /></button>
    </div>
  )
}
