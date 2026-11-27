import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProcedureModal } from '../src/components/domain/procedures/ProcedureModal'
import { procedureService } from '../src/services/procedureService'
import { clinicService } from '../src/services/clinicService'

vi.mock('../src/services/procedureService', () => ({
  procedureService: {
    getProcedure: vi.fn(),
  },
}))

vi.mock('../src/services/clinicService', () => ({
  clinicService: {
    getClinics: vi.fn().mockResolvedValue([
      { id: 'clinic-1', name: 'Clínica Sorriso' },
    ]),
  },
}))

describe('Issue #35 (FE-022) - Detalhes e Edição de Procedimento', () => {
  const mockProcedure = {
    id: 'proc-100',
    clinicId: 'clinic-1',
    name: 'Gengivectomia',
    category: 'Cirurgia' as const,
    time: 50,
    averageTime: 50,
    description: 'Remoção cirúrgica de tecido gengival',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clinicService.getClinics).mockResolvedValue([
      { id: 'clinic-1', name: 'Clínica Sorriso', city: 'SP', state: 'SP' },
    ])
  })

  it('renderiza modo criação com título "Novo Procedimento"', () => {
    render(
      <ProcedureModal
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByText('Novo Procedimento')).toBeInTheDocument()
    expect(procedureService.getProcedure).not.toHaveBeenCalled()
  })

  it('no modo edição, consulta detalhes via GET /procedures/:id e preenche o formulário', async () => {
    vi.mocked(procedureService.getProcedure).mockResolvedValue(mockProcedure)

    render(
      <ProcedureModal
        open={true}
        onOpenChange={vi.fn()}
        procedure={mockProcedure}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByText('Editar Procedimento')).toBeInTheDocument()
    expect(procedureService.getProcedure).toHaveBeenCalledWith('proc-100')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Gengivectomia')).toBeInTheDocument()
      expect(screen.getByDisplayValue('50')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Remoção cirúrgica de tecido gengival')).toBeInTheDocument()
    })
  })

  it('exibe mensagem de aviso quando a busca de detalhes da API falha', async () => {
    vi.mocked(procedureService.getProcedure).mockRejectedValue(new Error('Network error'))

    render(
      <ProcedureModal
        open={true}
        onOpenChange={vi.fn()}
        procedure={mockProcedure}
        onSubmit={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Não foi possível carregar os detalhes do procedimento/i)
      ).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Gengivectomia')).toBeInTheDocument()
  })
})
