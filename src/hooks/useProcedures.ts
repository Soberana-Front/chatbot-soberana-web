// Importa hooks do React
import { useState, useEffect, useCallback } from 'react'
// Importa o serviço e os tipos de procedimento
import { procedureService } from '../services/procedureService'
import { clinicService } from '../services/clinicService'
import type { Procedure, ProcedurePayload, GetProceduresParams } from '../services/procedureService'

// Estado de paginação exposto pelo hook
export interface ProceduresPagination {
  page: number
  totalPages: number
  totalItems: number
}

const PAGE_SIZE = 10

/**
 * Hook responsável pelo estado e pelas operações de Procedimentos (Issue #33 - FE-020).
 * Alinhado com o contrato real do backend e com o padrão adotado em useClinics.
 * 
 * - Busca inicial e filtro por nome via GET /procedures?search=...
 * - Filtro de categoria e paginação aplicados sobre os dados retornados
 * - Criação (POST), Edição (PATCH) e Exclusão (DELETE) reais
 * - Tratamento de loading, erro, lista vazia e paginação
 */
export const useProcedures = () => {
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [category, setCategory] = useState<string>('') // '' = todas as categorias
  const [pagination, setPagination] = useState<ProceduresPagination>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  })

  // Aplica filtro de categoria e paginação sobre allProcedures
  const applyFilterAndPagination = useCallback(
    (source: Procedure[], searchTerm: string, categoryFilter: string, page: number) => {
      const term = searchTerm.trim().toLowerCase()

      const filtered = source.filter((procedure) => {
        const matchesSearch = term ? procedure.name.toLowerCase().includes(term) : true
        const matchesCategory = categoryFilter ? procedure.category === categoryFilter : true
        return matchesSearch && matchesCategory
      })

      const totalItems = filtered.length
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
      const safePage = Math.min(page, totalPages)
      const start = (safePage - 1) * PAGE_SIZE
      const pageItems = filtered.slice(start, start + PAGE_SIZE)

      setProcedures(pageItems)
      setPagination({ page: safePage, totalPages, totalItems })
    },
    []
  )

  // Carrega os procedimentos da API real (GET /procedures)
  const fetchProcedures = useCallback(
    async (params?: GetProceduresParams) => {
      setIsLoading(true)
      setError(null)

      try {
        const searchTerm = params?.search !== undefined ? params.search : search
        const data = await procedureService.getProcedures({
          search: searchTerm ? searchTerm : undefined,
        })
        setAllProcedures(data)
        applyFilterAndPagination(data, searchTerm, category, 1)
      } catch {
        setError('Erro ao carregar os procedimentos. Tente novamente.')
        setAllProcedures([])
        setProcedures([])
      } finally {
        setIsLoading(false)
      }
    },
    [applyFilterAndPagination, search, category]
  )

  // Atualiza o termo de busca e reaplica filtro/paginação (busca remota na API)
  const filterProcedures = useCallback(
    (term: string) => {
      setSearch(term)
      void fetchProcedures({ search: term })
    },
    [fetchProcedures]
  )

  // Atualiza o filtro de categoria e reaplica sobre allProcedures (volta pra página 1)
  const filterByCategory = useCallback(
    (categoryFilter: string) => {
      setCategory(categoryFilter)
      applyFilterAndPagination(allProcedures, search, categoryFilter, 1)
    },
    [allProcedures, search, applyFilterAndPagination]
  )

  // Muda de página mantendo os filtros atuais
  const goToPage = useCallback(
    (page: number) => {
      applyFilterAndPagination(allProcedures, search, category, page)
    },
    [allProcedures, search, category, applyFilterAndPagination]
  )

  // Cria um procedimento via API real (Issue #34 - FE-021)
  const createProcedure = useCallback(
    async (data: ProcedurePayload) => {
      setError(null)
      try {
        let clinicId = data.clinicId
        if (!clinicId) {
          const clinics = await clinicService.getClinics()
          if (clinics.length > 0 && clinics[0]?.id) {
            clinicId = clinics[0].id
          }
        }
        const created = await procedureService.createProcedure({
          ...data,
          clinicId,
        })
        const updated = [created, ...allProcedures]
        setAllProcedures(updated)
        applyFilterAndPagination(updated, search, category, 1)
        return created
      } catch (err) {
        setError('Erro ao criar o procedimento. Tente novamente.')
        throw err
      }
    },
    [allProcedures, search, category, applyFilterAndPagination]
  )

  // Edita um procedimento via API real
  const updateProcedure = useCallback(
    async (id: string, data: Partial<ProcedurePayload>) => {
      setError(null)
      try {
        const updatedProcedure = await procedureService.updateProcedure(id, data)
        const updated = allProcedures.map((procedure) =>
          procedure.id === id ? updatedProcedure : procedure
        )
        setAllProcedures(updated)
        applyFilterAndPagination(updated, search, category, pagination.page)
        return updatedProcedure
      } catch (err) {
        setError('Erro ao atualizar o procedimento. Tente novamente.')
        throw err
      }
    },
    [allProcedures, search, category, pagination.page, applyFilterAndPagination]
  )

  // Exclui um procedimento via API real
  const deleteProcedure = useCallback(
    async (id: string) => {
      setError(null)
      try {
        await procedureService.deleteProcedure(id)
        const updated = allProcedures.filter((procedure) => procedure.id !== id)
        setAllProcedures(updated)
        applyFilterAndPagination(updated, search, category, pagination.page)
      } catch (err) {
        setError('Erro ao excluir o procedimento. Tente novamente.')
        throw err
      }
    },
    [allProcedures, search, category, pagination.page, applyFilterAndPagination]
  )

  useEffect(() => {
    void fetchProcedures()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    procedures,
    isLoading,
    error,
    pagination,
    search,
    category,
    filterProcedures,
    filterByCategory,
    goToPage,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    refetch: fetchProcedures,
  }
}