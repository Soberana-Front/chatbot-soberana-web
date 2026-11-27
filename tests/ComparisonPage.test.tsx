import type { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComparisonPage from '../src/pages/ComparisonPage/ComparisonPage';
import { comparisonService } from '../src/services/comparisonService';

vi.mock('../src/components/dashboard/DashboardLayout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../src/services/comparisonService', () => ({
  comparisonService: {
    listClinics: vi.fn(),
    listProcedures: vi.fn(),
    getCurrentCosts: vi.fn(),
    getPricingDefaults: vi.fn(),
  },
}));

describe('ComparisonPage (Issue #167)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(comparisonService.listClinics).mockResolvedValue([
      { id: 'clinic-a', name: 'Clínica Alpha', city: 'São Paulo', state: 'SP' },
      { id: 'clinic-b', name: 'Clínica Beta', city: 'Campinas', state: 'SP' },
    ]);

    vi.mocked(comparisonService.listProcedures).mockResolvedValue([
      { id: 'proc-1', clinicId: 'clinic-a', name: 'Limpeza Dental', category: 'PREVENTIVE' },
    ]);

    vi.mocked(comparisonService.getCurrentCosts).mockImplementation(async (clinicId: string) => ({
      id: `cost-${clinicId}`,
      clinicId,
      sixMonthFixedCost: clinicId === 'clinic-a' ? 60000 : 48000,
      sixMonthVariableCost: 12000,
      monthlyFixedCost: clinicId === 'clinic-a' ? 10000 : 8000,
      monthlyVariableCost: 2000,
      effectiveHoursPerMonth: 160,
      effectiveDate: '2026-01-01T00:00:00.000Z',
    }));

    vi.mocked(comparisonService.getPricingDefaults).mockImplementation(async (clinicId: string) => ({
      clinicId,
      paymentMethod: 'COMMISSION',
      fixedCost: 0,
      commission: clinicId === 'clinic-a' ? 30 : 25,
      defaultMaterialsCost: 50,
    }));
  });

  it('carrega opções reais do service e exibe comparação entre duas clínicas', async () => {
    render(<ComparisonPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/clínica a/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/clínica a/i), { target: { value: 'clinic-a' } });
    fireEvent.change(screen.getByLabelText(/clínica b/i), { target: { value: 'clinic-b' } });
    fireEvent.change(screen.getByLabelText(/procedimento/i), { target: { value: 'proc-1' } });

    fireEvent.click(screen.getByRole('button', { name: /^comparar$/i }));

    await waitFor(() => {
      expect(comparisonService.getCurrentCosts).toHaveBeenCalledWith('clinic-a');
      expect(comparisonService.getCurrentCosts).toHaveBeenCalledWith('clinic-b');
      expect(comparisonService.getPricingDefaults).toHaveBeenCalledWith('clinic-a');
      expect(comparisonService.getPricingDefaults).toHaveBeenCalledWith('clinic-b');
    });

    expect(screen.getByText(/custos fixos mensais/i)).toBeInTheDocument();
  });
});
