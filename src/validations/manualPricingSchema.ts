// ============================================================
// SCHEMA DE VALIDAÇÃO — PREENCHIMENTO MANUAL DA PRECIFICAÇÃO
// ============================================================

/**
 * Schema utilizado pelo ManualPricingForm como alternativa
 * ao fluxo de conversa com a IA.
 *
 * Issue #52 — FE-039
 */

import { z } from 'zod'

export const manualPricingSchema = z.object({
  materialCost: z
    .number({ error: 'Informe o custo de materiais' })
    .min(0, 'O valor não pode ser negativo'),

  fixedCosts: z
    .number({ error: 'Informe os custos fixos' })
    .min(0, 'O valor não pode ser negativo'),

  variableCosts: z
    .number({ error: 'Informe os custos variáveis' })
    .min(0, 'O valor não pode ser negativo'),

  hourCost: z
    .number({ error: 'Informe o custo por hora' })
    .min(0, 'O valor não pode ser negativo'),

  commission: z
    .number({ error: 'Informe a comissão' })
    .min(0, 'O valor não pode ser negativo')
    .max(100, 'A comissão não pode ser maior que 100%'),

  taxes: z
    .number({ error: 'Informe os impostos' })
    .min(0, 'O valor não pode ser negativo')
    .max(100, 'Os impostos não podem ser maiores que 100%'),

  margin: z
    .number({ error: 'Informe a margem de lucro' })
    .min(0, 'O valor não pode ser negativo')
    .max(100, 'A margem não pode ser maior que 100%'),

  notes: z.string().optional(),
})

export type ManualPricingFormData = z.infer<typeof manualPricingSchema>
