// Importa a instância do Axios já configurada (mesma usada pelo clinicService)
import { api } from './api'
// Importa o tipo literal de categoria, definido junto com o schema do formulário
import type { ProcedureCategory } from '../validations/procedureSchema'

// ===========================
// TIPOS
// ===========================

// Formato bruto retornado pelo backend
export interface BackendProcedure {
  id: string
  clinicId: string | null
  name: string
  category: string | null
  averageTime?: number
  description?: string
}

// Formato de um procedimento utilizado pelo frontend
export interface Procedure {
  id: string
  clinicId?: string | null
  name: string
  category: ProcedureCategory
  time: number          // mapeado a partir de averageTime
  averageTime?: number  // contrato do backend
  description?: string
}

// Payload enviado ao criar/editar um procedimento
export interface ProcedurePayload {
  clinicId?: string
  name: string
  category: string
  time?: number
  averageTime?: number
  description?: string
}

// Parâmetros de busca enviados no GET /procedures (backend aceita search)
export interface GetProceduresParams {
  search?: string
}

// Wrapper padrão de resposta do backend Soberana
interface ApiResponse<T> {
  status: boolean
  data: T
  message: string
  timestamp: string
}

// ===========================
// SERVIÇO
// ===========================

/**
 * Serviço responsável por toda comunicação com a API de procedimentos.
 * Alinhado com as rotas reais do backend:
 * - GET    /procedures             → lista procedimentos (filtro opcional por nome: search)
 * - GET    /procedures/:id         → detalhes do procedimento
 * - POST   /procedures             → criação de procedimento
 * - PATCH  /procedures/:id         → atualização parcial
 * - DELETE /procedures/:id         → exclusão lógica
 */
export const procedureService = {
  // GET /procedures — lista procedimentos com filtro opcional por nome
  getProcedures: async (params?: GetProceduresParams): Promise<Procedure[]> => {
    const response = await api.get<ApiResponse<BackendProcedure[]>>('/procedures', {
      params: params?.search ? { search: params.search } : undefined,
    })
    const items = response.data?.data ?? []
    return items.map((p) => ({
      id: p.id,
      clinicId: p.clinicId,
      name: p.name,
      category: (p.category ?? '') as ProcedureCategory,
      time: p.averageTime ?? 0,
      averageTime: p.averageTime,
      description: p.description ?? undefined,
    }))
  },

  // GET /procedures/:id — busca um procedimento específico
  getProcedure: async (id: string): Promise<Procedure> => {
    const response = await api.get<ApiResponse<BackendProcedure>>(`/procedures/${encodeURIComponent(id)}`)
    const p = response.data.data
    return {
      id: p.id,
      clinicId: p.clinicId,
      name: p.name,
      category: (p.category ?? '') as ProcedureCategory,
      time: p.averageTime ?? 0,
      averageTime: p.averageTime,
      description: p.description ?? undefined,
    }
  },

  // POST /procedures — cria um novo procedimento
  createProcedure: async (data: ProcedurePayload): Promise<Procedure> => {
    const payload = {
      clinicId: data.clinicId,
      name: data.name,
      category: data.category,
      averageTime: data.averageTime ?? data.time,
      description: data.description,
    }
    const response = await api.post<ApiResponse<BackendProcedure>>('/procedures', payload)
    const p = response.data.data
    return {
      id: p.id,
      clinicId: p.clinicId,
      name: p.name,
      category: (p.category ?? '') as ProcedureCategory,
      time: p.averageTime ?? 0,
      averageTime: p.averageTime,
      description: p.description ?? undefined,
    }
  },

  // PATCH /procedures/:id — atualiza um procedimento existente (backend usa PATCH)
  updateProcedure: async (id: string, data: Partial<ProcedurePayload>): Promise<Procedure> => {
    const payload: Record<string, unknown> = {}
    if (data.clinicId) payload.clinicId = data.clinicId
    if (data.name !== undefined) payload.name = data.name
    if (data.category !== undefined) payload.category = data.category
    if (data.averageTime !== undefined || data.time !== undefined) {
      payload.averageTime = data.averageTime ?? data.time
    }
    if (data.description !== undefined) payload.description = data.description

    const response = await api.patch<ApiResponse<BackendProcedure>>(
      `/procedures/${encodeURIComponent(id)}`,
      payload
    )
    const p = response.data.data
    return {
      id: p.id,
      clinicId: p.clinicId,
      name: p.name,
      category: (p.category ?? '') as ProcedureCategory,
      time: p.averageTime ?? 0,
      averageTime: p.averageTime,
      description: p.description ?? undefined,
    }
  },

  // DELETE /procedures/:id — exclui um procedimento
  deleteProcedure: async (id: string): Promise<void> => {
    await api.delete(`/procedures/${encodeURIComponent(id)}`)
  },
}

export default procedureService