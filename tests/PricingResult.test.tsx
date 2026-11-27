import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingResult } from '../src/components/dashboard/PricingResult/PricingResult';
import { PricingSummary, type PricingSummaryData } from '../src/components/dashboard/PricingSumary/PricingSumary';

vi.mock('../src/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('PricingResult e PricingSummary (Issue #46 - FE-033)', () => {
  const mockData: PricingSummaryData = {
    clinicCosts: 150,
    procedureCost: 80,
    taxIncidences: 45,
    profit: 120,
    result: 395,
    directCost: 230,
    correctedCost: 275,
    finalPrice: 500,
  };

  it('exibe todos os custos, incidências, lucro e resultado em PricingSummary', () => {
    render(<PricingSummary data={mockData} />);

    expect(screen.getByRole('heading', { name: /resumo da precificação/i })).toBeInTheDocument();
    expect(screen.getByText('Custos da Clínica')).toBeInTheDocument();
    expect(screen.getByText('Procedimento')).toBeInTheDocument();
    expect(screen.getByText('Incidências')).toBeInTheDocument();
    expect(screen.getByText('Lucro')).toBeInTheDocument();
    expect(screen.getByText('Resultado')).toBeInTheDocument();
    expect(screen.getByText('Custo Direto')).toBeInTheDocument();
    expect(screen.getByText('Custo Corrigido')).toBeInTheDocument();
  });

  it('renderiza o componente PricingResult completo com preço sugerido', () => {
    render(<PricingResult data={mockData} />);

    expect(screen.getByText(/preço final/i)).toBeInTheDocument();
    expect(screen.getByText('Custos da Clínica')).toBeInTheDocument();
    expect(screen.getByText('Lucro')).toBeInTheDocument();
  });
});
