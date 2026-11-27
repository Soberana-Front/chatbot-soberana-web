import { z } from 'zod'

/**
 * Schema para cadastro de novo período de custos da clínica.
 * Alinhado com o backend ClinicCosts_Create.ts:
 * - sixMonthFixedCost: custo fixo acumulado nos últimos 6 meses (R$)
 * - sixMonthVariableCost: custo variável acumulado nos últimos 6 meses (R$)
 * - effectiveHoursPerMonth: total de horas de atendimento disponíveis no mês
 */
export const clinicCostsSchema = z.object({
  sixMonthFixedCost: z
    .number({ error: 'Informe o custo fixo acumulado (6 meses)' })
    .min(0, 'O custo fixo não pode ser negativo'),
  sixMonthVariableCost: z
    .number({ error: 'Informe o custo variável acumulado (6 meses)' })
    .min(0, 'O custo variável não pode ser negativo'),
  effectiveHoursPerMonth: z
    .number({ error: 'Informe as horas produtivas por mês' })
    .min(1, 'As horas produtivas devem ser de pelo menos 1 hora'),
})

export type ClinicCostsFormData = z.infer<typeof clinicCostsSchema>
