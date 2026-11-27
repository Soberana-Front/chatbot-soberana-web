// Importa hooks do React
import { useState, useEffect, useCallback } from 'react'
// Importa o serviço e os tipos de clínica (alinhados com o backend)
import { clinicService } from '../services/clinicService'
import type { Clinic, ClinicSummary, ClinicPayload } from '../services/clinicService'
import type { ClinicFormData } from '../validations/clinicSchema'

// Estado de paginação exposto pelo hook (paginação local, já que o backend não pagina)
export interface ClinicsPagination {
  page: number
  totalPages: number
  totalItems: number
}

const PAGE_SIZE = 10

/**
 * Hook responsável pelo estado e pelas operações de Clínicas.
 * Alinhado com o contrato real do backend.
 *
 * A listagem usa GET /clinics (retorna ClinicSummary[]).
 * Criação/edição usam os tipos completos (Clinic).
 * A paginação é feita localmente (o backend não pagina).
 * O filtro de texto também é local (o backend filtra por nome via query).
 */
export const useClinics = () => {
  // Lista completa — base para filtro e paginação locais
  const [allClinics, setAllClinics] = useState<ClinicSummary[]>([])
  // Lista já filtrada/paginada, exibida na tabela
  const [clinics, setClinics] = useState<ClinicSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [pagination, setPagination] = useState<ClinicsPagination>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  })

  // Aplica filtro de texto (nome, cidade, estado) e paginação sobre allClinics
  const applyFilterAndPagination = useCallback(
    (source: ClinicSummary[], searchTerm: string, page: number) => {
      const term = searchTerm.trim().toLowerCase()

      const filtered = term
        ? source.filter(
            (clinic) =>
              clinic.name.toLowerCase().includes(term) ||
              clinic.city.toLowerCase().includes(term) ||
              clinic.state.toLowerCase().includes(term)
          )
        : source

      const totalItems = filtered.length
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
      const safePage = Math.min(page, totalPages)
      const start = (safePage - 1) * PAGE_SIZE
      const pageItems = filtered.slice(start, start + PAGE_SIZE)

      setClinics(pageItems)
      setPagination({ page: safePage, totalPages, totalItems })
    },
    []
  )

  // Carrega as clínicas da API real (GET /clinics)
  const fetchClinics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await clinicService.getClinics()
      setAllClinics(data)
      applyFilterAndPagination(data, search, 1)
    } catch {
      setError('Erro ao carregar as clínicas. Verifique sua conexão e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [applyFilterAndPagination, search])

  // Atualiza o termo de busca e reaplica filtro/paginação (volta para página 1)
  const filterClinics = useCallback(
    (term: string) => {
      setSearch(term)
      applyFilterAndPagination(allClinics, term, 1)
    },
    [allClinics, applyFilterAndPagination]
  )

  // Muda de página mantendo o filtro atual
  const goToPage = useCallback(
    (page: number) => {
      applyFilterAndPagination(allClinics, search, page)
    },
    [allClinics, search, applyFilterAndPagination]
  )

  /**
   * Cria uma clínica nova via POST /clinics.
   * O formulário envia commissionPercentage em 0-100%;
   * o backend espera fração 0.0-1.0.
   */
  const createClinic = useCallback(
    async (data: ClinicFormData) => {
      setError(null)
      try {
        const payload: ClinicPayload = {
          ...data,
          // Converte % (0-100) → fração (0.0-1.0) para o backend
          commissionPercentage:
            data.commissionPercentage !== undefined
              ? data.commissionPercentage / 100
              : undefined,
          address: data.address || undefined,
          notes: data.notes || undefined,
        }
        const created = await clinicService.createClinic(payload)
        // Adiciona ao topo da lista (resumo) e reaplica filtro
        const summary: ClinicSummary = {
          id: created.id,
          name: created.name,
          city: created.city,
          state: created.state,
        }
        const updated = [summary, ...allClinics]
        setAllClinics(updated)
        applyFilterAndPagination(updated, search, pagination.page)
      } catch {
        setError('Erro ao cadastrar a clínica. Tente novamente.')
        throw new Error('Erro ao cadastrar a clínica.')
      }
    },
    [allClinics, search, pagination.page, applyFilterAndPagination]
  )

  /**
   * Atualiza uma clínica via PATCH /clinics/:id.
   * Recarrega a listagem após a atualização.
   */
  const updateClinic = useCallback(
    async (id: string, data: ClinicFormData) => {
      setError(null)
      try {
        const payload: Partial<ClinicPayload> = {
          ...data,
          commissionPercentage:
            data.commissionPercentage !== undefined
              ? data.commissionPercentage / 100
              : undefined,
          address: data.address || undefined,
          notes: data.notes || undefined,
        }
        const updated = await clinicService.updateClinic(id, payload)
        // Atualiza o item na lista local
        const summary: ClinicSummary = {
          id: updated.id,
          name: updated.name,
          city: updated.city,
          state: updated.state,
        }
        const updatedList = allClinics.map((c) => (c.id === id ? summary : c))
        setAllClinics(updatedList)
        applyFilterAndPagination(updatedList, search, pagination.page)
      } catch {
        setError('Erro ao editar a clínica. Tente novamente.')
        throw new Error('Erro ao editar a clínica.')
      }
    },
    [allClinics, search, pagination.page, applyFilterAndPagination]
  )

  // Exclui uma clínica via DELETE /clinics/:id
  const deleteClinic = useCallback(
    async (id: string) => {
      setError(null)
      try {
        await clinicService.deleteClinic(id)
        const updated = allClinics.filter((c) => c.id !== id)
        setAllClinics(updated)
        applyFilterAndPagination(updated, search, pagination.page)
      } catch {
        setError('Erro ao excluir a clínica. Tente novamente.')
        throw new Error('Erro ao excluir a clínica.')
      }
    },
    [allClinics, search, pagination.page, applyFilterAndPagination]
  )

  // Carrega a lista ao montar o componente
  useEffect(() => {
    fetchClinics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    clinics,
    isLoading,
    error,
    pagination,
    search,
    filterClinics,
    goToPage,
    createClinic,
    updateClinic,
    deleteClinic,
    refetch: fetchClinics,
  }
}

// Re-exporta os tipos necessários para a ClinicsPage e ClinicModal
export type { Clinic, ClinicSummary }
