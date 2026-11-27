import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ClinicCostsModal } from '../src/components/domain/clinics/ClinicCostsModal'
import { clinicService, type ClinicCosts } from '../src/services/clinicService'

vi.mock('../src/services/clinicService', () => ({
  clinicService: {
    getCurrentCosts: vi.fn(),
    getCostsHistory: vi.fn(),
    createCosts: vi.fn(),
  },
}))

describe('ClinicCostsModal - Issue #32 (Histórico de Custos)', () => {
  const mockClinic = {
    id: 'clinic-123',
    name: 'Clínica Sorriso',
    city: 'São Paulo',
    state: 'SP' as const,
  }

  const mockHistory: ClinicCosts[] = [
    {
      id: 'cost-1',
      clinicId: 'clinic-123',
      sixMonthFixedCost: 12000,
      sixMonthVariableCost: 6000,
      monthlyFixedCost: 2000,
      monthlyVariableCost: 1000,
      effectiveHoursPerMonth: 160,
      effectiveDate: '2026-11-20T10:00:00.000Z',
    },
    {
      id: 'cost-2',
      clinicId: 'clinic-123',
      sixMonthFixedCost: 9000,
      sixMonthVariableCost: 3000,
      monthlyFixedCost: 1500,
      monthlyVariableCost: 500,
      effectiveHoursPerMonth: 160,
      effectiveDate: '2026-05-01T10:00:00.000Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(clinicService.getCurrentCosts).mockResolvedValue(mockHistory[0])
    vi.mocked(clinicService.getCostsHistory).mockResolvedValue(mockHistory)
  })

  it('renderiza as abas de custo vigente e histórico', () => {
    render(
      <ClinicCostsModal
        open={true}
        onOpenChange={vi.fn()}
        clinic={mockClinic}
      />
    )

    expect(screen.getByRole('tab', { name: /Custo Vigente/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Histórico de Períodos/i })).toBeInTheDocument()
  })

  it('alterna para a aba de histórico e lista os períodos com dados formatados', async () => {
    render(
      <ClinicCostsModal
        open={true}
        onOpenChange={vi.fn()}
        clinic={mockClinic}
      />
    )

    const historyTab = screen.getByRole('tab', { name: /Histórico de Períodos/i })
    fireEvent.click(historyTab)

    expect(clinicService.getCostsHistory).toHaveBeenCalledWith('clinic-123')

    await waitFor(() => {
      expect(screen.getByText('Vigente')).toBeInTheDocument()
      expect(screen.getByText('Arquivado')).toBeInTheDocument()
    })

    expect(screen.getByText(/Histórico de Períodos de Custos/i)).toBeInTheDocument()
  })

  it('exibe estado vazio amigável quando a clínica não possui histórico', async () => {
    vi.mocked(clinicService.getCostsHistory).mockResolvedValue([])

    render(
      <ClinicCostsModal
        open={true}
        onOpenChange={vi.fn()}
        clinic={mockClinic}
      />
    )

    const historyTab = screen.getByRole('tab', { name: /Histórico de Períodos/i })
    fireEvent.click(historyTab)

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum período de custo registrado no histórico desta clínica/i)
      ).toBeInTheDocument()
    })
  })

  it('exibe mensagem de erro e botão de retentar quando a busca falha', async () => {
    vi.mocked(clinicService.getCostsHistory).mockRejectedValue(new Error('Erro de conexão'))

    render(
      <ClinicCostsModal
        open={true}
        onOpenChange={vi.fn()}
        clinic={mockClinic}
      />
    )

    const historyTab = screen.getByRole('tab', { name: /Histórico de Períodos/i })
    fireEvent.click(historyTab)

    await waitFor(() => {
      expect(
        screen.getByText(/Não foi possível carregar o histórico de custos/i)
      ).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Tentar novamente/i })
    expect(retryBtn).toBeInTheDocument()
  })
})
