// ============================================================
// CONFIRMAÇÃO DE DADOS EXTRAÍDOS PELA IA
// ============================================================

/**
 * Componente que apresenta dados extraídos pela IA para
 * confirmação, edição ou rejeição explícita pelo usuário.
 *
 * Issue #51 — FE-038
 */

import { useState } from 'react'
import DataSourceBadge from '../DataSourceBadge/DataSourceBadge'
import type { DataSourceType } from '../DataSourceBadge/DataSourceBadge'

// ============================================================
// TIPOS
// ============================================================

export interface ExtractedDataItem {
  id: string
  label: string
  value: string | number
  unit?: string
  status: 'pending' | 'confirmed' | 'rejected' | 'edited'
}

// ============================================================
// PROPS
// ============================================================

interface ExtractedDataConfirmationProps {
  /** Lista de itens extraídos. */
  items: ExtractedDataItem[]

  /** Confirma todos os itens de uma vez. */
  onConfirmAll: (items: ExtractedDataItem[]) => void

  /** Rejeita um item individual. */
  onRejectItem: (id: string) => void

  /** Edita o valor de um item. */
  onEditItem: (id: string, newValue: string | number) => void

  /** Confirma um item individual. */
  onConfirmItem: (id: string) => void

  /** Desabilita todas as interações. */
  disabled?: boolean
}

// ============================================================
// MAPEAMENTO DE STATUS → BADGE
// ============================================================

const STATUS_TO_BADGE: Record<
  ExtractedDataItem['status'],
  DataSourceType
> = {
  pending: 'suggested',
  confirmed: 'confirmed',
  rejected: 'rejected',
  edited: 'manual',
}

// ============================================================
// COMPONENTE
// ============================================================

export default function ExtractedDataConfirmation({
  items,
  onConfirmAll,
  onRejectItem,
  onEditItem,
  onConfirmItem,
  disabled = false,
}: ExtractedDataConfirmationProps) {
  // Estado de edição: qual item está sendo editado
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Inicia a edição de um item
  const startEditing = (item: ExtractedDataItem) => {
    if (disabled) return
    setEditingId(item.id)
    setEditValue(String(item.value))
  }

  // Salva a edição
  const saveEdit = (id: string) => {
    const numericValue = Number(editValue.replace(',', '.'))
    const finalValue = Number.isNaN(numericValue)
      ? editValue
      : numericValue
    onEditItem(id, finalValue)
    setEditingId(null)
    setEditValue('')
  }

  // Cancela a edição
  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  // Verifica se todos os itens foram resolvidos
  const allResolved = items.every(
    (item) => item.status !== 'pending',
  )

  return (
    <div
      style={{
        border: '1px solid var(--color-gray-200, #e5e7eb)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}
    >
      {/* ====================================
       * CABEÇALHO
       * ==================================== */}

      <div
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--color-gray-50, #f9fafb)',
          borderBottom: '1px solid var(--color-gray-200, #e5e7eb)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-gray-900, #111827)',
          }}
        >
          Dados extraídos pela IA
        </h3>
        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.8125rem',
            color: 'var(--color-gray-500, #6b7280)',
          }}
        >
          Confirme, edite ou rejeite cada item antes de prosseguir.
        </p>
      </div>

      {/* ====================================
       * LISTA DE ITENS
       * ==================================== */}

      <div style={{ padding: '0.5rem 0' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              borderBottom:
                '1px solid var(--color-gray-100, #f3f4f6)',
            }}
          >
            {/* Label e valor */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-gray-500, #6b7280)',
                }}
              >
                {item.label}
              </span>

              {editingId === item.id ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="adicionar-item__input"
                    style={{
                      flex: 1,
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem',
                    }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(item.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(item.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'transparent',
                      color: 'var(--color-gray-500, #6b7280)',
                      border: '1px solid var(--color-gray-300, #d1d5db)',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--color-gray-900, #111827)',
                    marginTop: '0.125rem',
                  }}
                >
                  {item.value}
                  {item.unit ? ` ${item.unit}` : ''}
                </div>
              )}
            </div>

            {/* Badge de status */}
            <DataSourceBadge type={STATUS_TO_BADGE[item.status]} />

            {/* Ações */}
            {editingId !== item.id && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                }}
              >
                {item.status !== 'confirmed' && (
                  <button
                    type="button"
                    title="Confirmar"
                    disabled={disabled}
                    onClick={() => onConfirmItem(item.id)}
                    style={{
                      padding: '0.25rem',
                      border: 'none',
                      background: 'none',
                      cursor: disabled ? 'default' : 'pointer',
                      fontSize: '1rem',
                      opacity: disabled ? 0.5 : 1,
                    }}
                    aria-label={`Confirmar ${item.label}`}
                  >
                    ✓
                  </button>
                )}

                {item.status !== 'rejected' && (
                  <button
                    type="button"
                    title="Rejeitar"
                    disabled={disabled}
                    onClick={() => onRejectItem(item.id)}
                    style={{
                      padding: '0.25rem',
                      border: 'none',
                      background: 'none',
                      cursor: disabled ? 'default' : 'pointer',
                      fontSize: '1rem',
                      color: '#dc2626',
                      opacity: disabled ? 0.5 : 1,
                    }}
                    aria-label={`Rejeitar ${item.label}`}
                  >
                    ✕
                  </button>
                )}

                <button
                  type="button"
                  title="Editar"
                  disabled={disabled}
                  onClick={() => startEditing(item)}
                  style={{
                    padding: '0.25rem',
                    border: 'none',
                    background: 'none',
                    cursor: disabled ? 'default' : 'pointer',
                    fontSize: '1rem',
                    opacity: disabled ? 0.5 : 1,
                  }}
                  aria-label={`Editar ${item.label}`}
                >
                  ✎
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ====================================
       * CONFIRMAR TODOS
       * ==================================== */}

      <div
        style={{
          padding: '1rem 1.5rem',
          borderTop:
            '1px solid var(--color-gray-200, #e5e7eb)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          className="adicionar-item__submit"
          disabled={disabled || allResolved}
          onClick={() => onConfirmAll(items)}
        >
          Confirmar todos
        </button>
      </div>
    </div>
  )
}
