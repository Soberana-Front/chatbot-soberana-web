export type FieldKind = 'currency' | 'percent' | 'cpf' | 'phone' | 'duration'
export type CanonicalFieldValue = number | string | null

const digitsOnly = (value: string) => value.replace(/\D/g, '')
const decimalFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function parseFieldValue(kind: FieldKind, input: string, percentScale = 100): CanonicalFieldValue {
  if (!input.trim()) return null

  if (kind === 'cpf') return digitsOnly(input).slice(0, 11) || null
  if (kind === 'phone') return digitsOnly(input).slice(0, 11) || null
  if (kind === 'duration') {
    const digits = digitsOnly(input)
    return digits ? Number(digits) : null
  }
  if (kind === 'currency') {
    const numeric = input.replace(/[^\d,.-]/g, '')
    const normalized = numeric.includes(',') ? numeric.replace(/\./g, '').replace(',', '.') : numeric
    const value = Number(normalized)
    return normalized && Number.isFinite(value) ? value : null
  }

  const numeric = input.replace('%', '').trim().replace(',', '.')
  const number = Number(numeric)
  return numeric && Number.isFinite(number) ? number / percentScale : null
}

export function formatFieldValue(kind: FieldKind, value: CanonicalFieldValue, percentScale = 100): string {
  if (value === null || value === '') return ''
  if (kind === 'cpf') {
    const digits = digitsOnly(String(value)).slice(0, 11)
    return digits.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2').replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2')
  }
  if (kind === 'phone') {
    const digits = digitsOnly(String(value)).slice(0, 11)
    const area = digits.slice(0, 2)
    const body = digits.slice(2)
    if (!body) return area.length === 2 ? `(${area})` : area
    const split = body.length > 8 ? 5 : 4
    return `(${area}) ${body.slice(0, split)}${body.length > split ? `-${body.slice(split)}` : ''}`
  }
  if (kind === 'duration') return String(value)
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  if (kind === 'currency') return currencyFormatter.format(number)
  return `${decimalFormatter.format(number * percentScale)}%`
}
