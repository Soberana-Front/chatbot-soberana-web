import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProceduresPage } from '../src/pages/ProceduresPage/ProceduresPage'
import { procedureService } from '../src/services/procedureService'
import { MemoryRouter } from 'react-router'

vi.mock('../src/components/dashboard/DashboardLayout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}))

vi.mock('../src/services/procedureService', () => ({
  procedureService: {
    getProcedures: vi.fn(),
    createProcedure: vi.fn(),
    updateProcedure: vi.fn(),
    deleteProcedure: vi.fn(),
  },
}))

describe('Issue #33 (FE-020) - Listagem, Filtros e Paginação de Procedimentos', () => {
  const mockProcedures = [
    {
      id: 'proc-1',
      clinicId: 'clinic-1',
      name: 'Restauração em Resina',
      category: 'Estética',
      time: 45,
      averageTime: 45,
      description: 'Restauração estética do elemento dental',
    },
    {
      id: 'proc-2',
      clinicId: 'clinic-1',
      name: 'Profilaxia Completa',
      category: 'Prevenção',
      time: 30,
      averageTime: 30,
      description: 'Limpeza e remoção de tártaro',
    },
    {
      id: 'proc-3',
      clinicId: 'clinic-1',
      name: 'Exodontia Simples',
      category: 'Cirurgia',
      time: 60,
      averageTime: 60,
      description: 'Extração de dente permanente',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(procedureService.getProcedures).mockResolvedValue(mockProcedures)
  })

  it('chama getProcedures e renderiza a lista de procedimentos na tabela', async () => {
    render(
      <MemoryRouter>
        <ProceduresPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Carregando procedimentos.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(procedureService.getProcedures).toHaveBeenCalled()
      expect(screen.getByText('Restauração em Resina')).toBeInTheDocument()
      expect(screen.getByText('Profilaxia Completa')).toBeInTheDocument()
      expect(screen.getByText('Exodontia Simples')).toBeInTheDocument()
    })

    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('filtra procedimentos por categoria', async () => {
    render(
      <MemoryRouter>
        <ProceduresPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Restauração em Resina')).toBeInTheDocument()
    })

    const categorySelect = screen.getByRole('combobox')
    fireEvent.change(categorySelect, { target: { value: 'Prevenção' } })

    expect(screen.getByText('Profilaxia Completa')).toBeInTheDocument()
    expect(screen.queryByText('Restauração em Resina')).not.toBeInTheDocument()
    expect(screen.queryByText('Exodontia Simples')).not.toBeInTheDocument()
  })

  it('exibe estado de lista vazia quando nenhum procedimento é retornado', async () => {
    vi.mocked(procedureService.getProcedures).mockResolvedValue([])

    render(
      <MemoryRouter>
        <ProceduresPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Nenhum procedimento encontrado/i)).toBeInTheDocument()
      expect(screen.getByText(/Comece cadastrando um novo procedimento/i)).toBeInTheDocument()
    })
  })

  it('exibe mensagem de erro quando a API falha ao buscar procedimentos', async () => {
    vi.mocked(procedureService.getProcedures).mockRejectedValue(new Error('Falha na API'))

    render(
      <MemoryRouter>
        <ProceduresPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao carregar os procedimentos. Tente novamente./i)
      ).toBeInTheDocument()
    })
  })
})
