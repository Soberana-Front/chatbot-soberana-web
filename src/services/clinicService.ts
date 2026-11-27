// Importa a instância do Axios já configurada (baseURL + interceptor de token)
import { api } from './api'
// Importa os tipos do schema de validação
import type { BrazilianState, ClinicType, MaterialSupplier, PaymentMethod } from '../validations/clinicSchema'

// ============================================================
// TIPOS
// ============================================================

/**
 * Formato de uma clínica retornada pelo GET /clinics (listagem resumida).
 * O backend retorna apenas id, name, city, state na listagem geral.
 */
export interface ClinicSummary {
  id: string
  name: string
  city: string
  state: BrazilianState
}

/**
 * Formato completo de uma clínica retornada pelo GET /clinics/:id.
 * Alinhado com o contrato real do backend (Clinic_Create / Clinic_Get_Details).
 */
export interface Clinic {
  id: string
  name: string
  city: string
  state: BrazilianState
  address?: string
  clinicType: ClinicType
  materialSupplier: MaterialSupplier
  paymentMethod: PaymentMethod
  commissionPercentage?: number   // fração 0.0–1.0 (vinda do backend)
  rentAmount?: number             // R$
  otherExpenses?: number          // R$
  notes?: string
}

/**
 * Payload enviado ao criar/editar uma clínica (sem o id, gerado pelo backend).
 * commissionPercentage é enviado como fração (0.0–1.0).
 */
export type ClinicPayload = Omit<Clinic, 'id'>

/**
 * Estrutura de custos de uma clínica (vigente e histórico).
 * Alinhado com ClinicCosts_Create e ClinicCosts_GetCurrent no backend.
 */
export interface ClinicCosts {
  id: string
  clinicId: string
  sixMonthFixedCost: number
  sixMonthVariableCost: number
  monthlyFixedCost: number
  monthlyVariableCost: number
  effectiveHoursPerMonth: number
  effectiveDate: string
}

/**
 * Payload para criação de novo período de custos da clínica.
 * O backend calcula effectiveDate automaticamente com a data/hora atual.
 */
export interface CreateClinicCostsPayload {
  sixMonthFixedCost: number
  sixMonthVariableCost: number
  effectiveHoursPerMonth: number
}

// Parâmetros de busca enviados no GET /clinics
export interface GetClinicsParams {
  search?: string
}

// Wrapper de resposta da API (padrão { status, data, message, timestamp })
interface ApiResponse<T> {
  status: boolean
  data: T
  message: string
  timestamp: string
}

// ============================================================
// SERVIÇO
// ============================================================

/**
 * Serviço responsável por toda comunicação com a API de clínicas.
 *
 * Alinhado com o contrato real do backend:
 * - GET  /clinics              → retorna lista resumida { id, name, city, state }
 * - GET  /clinics/:id          → retorna clínica completa
 * - POST /clinics              → cria clínica (body: ClinicPayload)
 * - PATCH /clinics/:id         → atualiza parcialmente (body: Partial<ClinicPayload>)
 * - DELETE /clinics/:id        → exclusão lógica (soft delete)
 *
 * Obs: o backend usa PATCH (não PUT) para atualização conforme Clinic_Update.route.ts.
 */
export const clinicService = {
  // GET /clinics — lista clínicas (resumidas) com filtro por nome
  getClinics: async (params?: GetClinicsParams): Promise<ClinicSummary[]> => {
    const response = await api.get<ApiResponse<ClinicSummary[]>>('/clinics', {
      params: params?.search ? { search: params.search } : undefined,
    })
    return response.data.data
  },

  // GET /clinics/:id — busca uma clínica específica (dados completos)
  getClinic: async (id: string): Promise<Clinic> => {
    const response = await api.get<ApiResponse<Clinic>>(`/clinics/${id}`)
    return response.data.data
  },

  // POST /clinics — cria uma nova clínica
  createClinic: async (data: ClinicPayload): Promise<Clinic> => {
    const response = await api.post<ApiResponse<Clinic>>('/clinics', data)
    return response.data.data
  },

  // PATCH /clinics/:id — atualiza parcialmente uma clínica existente
  updateClinic: async (id: string, data: Partial<ClinicPayload>): Promise<Clinic> => {
    const response = await api.patch<ApiResponse<Clinic>>(`/clinics/${id}`, data)
    return response.data.data
  },

  // DELETE /clinics/:id — exclui (soft delete) uma clínica
  deleteClinic: async (id: string): Promise<void> => {
    await api.delete(`/clinics/${id}`)
  },

  // GET /clinics/:clinicId/costs/current — busca o custo vigente da clínica
  getCurrentCosts: async (clinicId: string): Promise<ClinicCosts | null> => {
    try {
      const response = await api.get<ApiResponse<ClinicCosts>>(
        `/clinics/${encodeURIComponent(clinicId)}/costs/current`
      )
      return response.data.data
    } catch {
      return null
    }
  },

  // GET /clinics/:clinicId/costs/history — busca o histórico de custos da clínica
  getCostsHistory: async (clinicId: string): Promise<ClinicCosts[]> => {
    try {
      const response = await api.get<ApiResponse<ClinicCosts[]>>(
        `/clinics/${encodeURIComponent(clinicId)}/costs/history`
      )
      return response.data.data ?? []
    } catch {
      return []
    }
  },

  // POST /clinics/:clinicId/costs — cria novo período de custo vigente
  createCosts: async (clinicId: string, data: CreateClinicCostsPayload): Promise<ClinicCosts> => {
    const response = await api.post<ApiResponse<ClinicCosts>>(
      `/clinics/${encodeURIComponent(clinicId)}/costs`,
      data
    )
    return response.data.data
  },
}

export default clinicService
