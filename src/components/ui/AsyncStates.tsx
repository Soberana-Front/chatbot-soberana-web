import { AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { Spinner } from './Spinner'

export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3" role="status" aria-live="polite">
      <Spinner aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
      <div className="flex items-center gap-2">
        <AlertCircle aria-hidden="true" size={20} />
        <p>{message}</p>
      </div>
      {onRetry && <Button type="button" variant="outline" onClick={onRetry}>Tentar novamente</Button>}
    </div>
  )
}
