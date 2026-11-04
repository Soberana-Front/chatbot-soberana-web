import { useEffect, useId, useState } from 'react'
import { Label } from './Label'
import { formatFieldValue, parseFieldValue } from '../../utils/formattedFields'
import type { CanonicalFieldValue, FieldKind } from '../../utils/formattedFields'

export type FormattedFieldProps = {
  kind: FieldKind
  label: string
  value: CanonicalFieldValue
  onValueChange: (value: CanonicalFieldValue) => void
  onBlur?: () => void
  /** Use 100 for API fractions in the 0–1 range; use 1 for API values in the 0–100 range. */
  percentScale?: 1 | 100
  id?: string
  name?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

export function FormattedField({
  kind, label, value, onValueChange, onBlur, percentScale = 100, id, name, error, required, disabled,
}: FormattedFieldProps) {
  const generatedId = useId()
  const inputId = id ?? `formatted-${generatedId}`
  const errorId = `${inputId}-error`
  const [draft, setDraft] = useState(() => formatFieldValue(kind, value, percentScale))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!editing) setDraft(formatFieldValue(kind, value, percentScale))
  }, [kind, value, percentScale, editing])

  return (
    <div className="input-wrapper">
      <Label htmlFor={inputId} required={required}>{label}</Label>
      <input
        id={inputId}
        name={name}
        type="text"
        className={`input-field input-size-md ${error ? 'input-error' : ''}`}
        inputMode={kind === 'percent' || kind === 'currency' ? 'decimal' : 'numeric'}
        autoComplete="off"
        value={draft}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onFocus={() => {
          setEditing(true)
          if (kind === 'currency' || kind === 'percent') {
            setDraft(value === null || value === '' ? '' : String(Number(value) * (kind === 'percent' ? percentScale : 1)).replace('.', ','))
          }
        }}
        onBlur={() => {
          setEditing(false)
          setDraft(formatFieldValue(kind, value, percentScale))
          onBlur?.()
        }}
        onChange={(event) => {
          const parsed = parseFieldValue(kind, event.target.value, percentScale)
          onValueChange(parsed)
          setDraft(kind === 'cpf' || kind === 'phone'
            ? formatFieldValue(kind, parsed, percentScale)
            : event.target.value)
        }}
      />
      {error && <p id={errorId} className="input-error-text">{error}</p>}
    </div>
  )
}
