// Importa o Zod para validação de schema
import { z } from 'zod'

// Lista de UFs para o select de Estado
export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

// Tipo de clínica conforme o contrato real do backend (Clinic_Create)
export const CLINIC_TYPES = ['OWN', 'OUTSOURCED'] as const

// Rótulos amigáveis para exibição (usado na ClinicTable e ClinicForm)
export const CLINIC_TYPE_LABELS: Record<string, string> = {
  OWN: 'Própria',
  OUTSOURCED: 'Terceirizada',
}

// Fornecedor de materiais conforme o contrato real do backend
export const MATERIAL_SUPPLIER_OPTIONS = ['DENTIST', 'CLINIC'] as const
export const MATERIAL_SUPPLIER_LABELS: Record<string, string> = {
  DENTIST: 'Dentista fornece',
  CLINIC: 'Clínica fornece',
}

// Método de pagamento conforme o contrato real do backend
export const PAYMENT_METHOD_OPTIONS = ['COMMISSION', 'MONTHLY_RENT', 'FIXED_VALUE'] as const
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COMMISSION: 'Comissão (%)',
  MONTHLY_RENT: 'Aluguel mensal',
  FIXED_VALUE: 'Valor fixo',
}

/**
 * Schema de validação do formulário de clínica alinhado com o contrato real
 * do backend (src/functions/Clinic_Create.ts).
 *
 * Campos alterados em relação à versão anterior:
 * - `type` → `clinicType` (enum OWN | OUTSOURCED)
 * - `commission` → `commissionPercentage` (0–100% no form, convertido para 0–1 no serviço)
 * - `rent` → `rentAmount` (number direto, sem máscara de moeda)
 * - `costs` → `otherExpenses` (number direto)
 * - Adicionados: `materialSupplier`, `paymentMethod`, `address` (opcional), `notes` (opcional)
 */
export const clinicSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  city: z.string().min(2, 'A cidade deve ter pelo menos 2 caracteres'),
  state: z.enum(BRAZILIAN_STATES, {
    error: 'Selecione um estado',
  }),
  address: z.string().optional(),
  clinicType: z.enum(CLINIC_TYPES, {
    error: 'Selecione o tipo da clínica',
  }),
  materialSupplier: z.enum(MATERIAL_SUPPLIER_OPTIONS, {
    error: 'Informe quem fornece os materiais',
  }),
  paymentMethod: z.enum(PAYMENT_METHOD_OPTIONS, {
    error: 'Selecione o método de pagamento',
  }),
  // Comissão em % (0-100), convertida para fração (0-1) ao enviar para a API
  commissionPercentage: z
    .number({ error: 'Informe a comissão (%)' })
    .min(0, 'A comissão não pode ser negativa')
    .max(100, 'A comissão não pode ultrapassar 100%')
    .optional(),
  rentAmount: z
    .number({ error: 'Informe o valor do aluguel' })
    .min(0, 'O aluguel não pode ser negativo')
    .optional(),
  otherExpenses: z
    .number({ error: 'Informe o valor das despesas' })
    .min(0, 'As despesas não podem ser negativas')
    .optional(),
  notes: z.string().optional(),
})

// Tipo dos dados manipulados pelo formulário
export type ClinicFormData = z.infer<typeof clinicSchema>

// Mantido para compatibilidade (usado em ClinicModal e ClinicTable)
export type ClinicFormInput = ClinicFormData
export type ClinicFormOutput = ClinicFormData

// Tipos derivados das listas, usados também pelo clinicService.ts
export type BrazilianState = (typeof BRAZILIAN_STATES)[number]
export type ClinicType = (typeof CLINIC_TYPES)[number]
export type MaterialSupplier = (typeof MATERIAL_SUPPLIER_OPTIONS)[number]
export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number]
