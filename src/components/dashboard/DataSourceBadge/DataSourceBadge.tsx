// ============================================================
// BADGE DE ORIGEM DOS DADOS
// ============================================================

/**
 * Componente que diferencia visualmente a origem dos dados:
 * manual, sugerido pela IA, confirmado ou rejeitado.
 *
 * Issue #50 — FE-037
 */

// ============================================================
// TIPOS
// ============================================================

export type DataSourceType =
  | 'manual'
  | 'suggested'
  | 'confirmed'
  | 'rejected'

// ============================================================
// PROPS
// ============================================================

interface DataSourceBadgeProps {
  /** Tipo da origem dos dados. */
  type: DataSourceType

  /** Texto alternativo do badge. */
  label?: string
}

// ============================================================
// CONFIGURAÇÃO VISUAL
// ============================================================

const BADGE_CONFIG: Record<
  DataSourceType,
  { bg: string; text: string; defaultLabel: string }
> = {
  manual: {
    bg: '#dbeafe',
    text: '#1d4ed8',
    defaultLabel: 'Manual',
  },
  suggested: {
    bg: '#fef3c7',
    text: '#92400e',
    defaultLabel: 'Sugerido pela IA',
  },
  confirmed: {
    bg: '#d1fae5',
    text: '#065f46',
    defaultLabel: 'Confirmado',
  },
  rejected: {
    bg: '#fee2e2',
    text: '#991b1b',
    defaultLabel: 'Rejeitado',
  },
}

// ============================================================
// COMPONENTE
// ============================================================

export default function DataSourceBadge({
  type,
  label,
}: DataSourceBadgeProps) {
  const config = BADGE_CONFIG[type]

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {label || config.defaultLabel}
    </span>
  )
}
