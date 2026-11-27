import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ManualPricingForm from '../src/components/dashboard/ManualPricingForm/ManualPricingForm';

describe('ManualPricingForm (Issue #52)', () => {
  it('renderiza os campos de custos e percentuais', () => {
    render(<ManualPricingForm onSubmit={vi.fn()} onBackToChat={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /preenchimento manual/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/custo de materiais/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/custos fixos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/margem de lucro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calcular precificação/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar ao chat/i })).toBeInTheDocument();
  });

  it('submete dados válidos para cálculo', async () => {
    const onSubmit = vi.fn();
    render(<ManualPricingForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/custo de materiais/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/custos fixos/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/custos variáveis/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/custo por hora/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/comissão/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/impostos/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/margem de lucro/i), { target: { value: '35' } });

    fireEvent.click(screen.getByRole('button', { name: /calcular precificação/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          materialCost: 50,
          fixedCosts: 30,
          variableCosts: 20,
          hourCost: 100,
          commission: 10,
          taxes: 15,
          margin: 35,
        }),
        expect.anything(),
      );
    });
  });
});
