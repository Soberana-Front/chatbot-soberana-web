import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PricingWizard from '../src/components/dashboard/PricingWizard/PricingWizard';

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../src/components/dashboard/ClinicStep/ClinicStep', () => ({
  default: () => <div data-testid="clinic-step">Etapa da Clínica</div>,
}));

vi.mock('../src/components/dashboard/ProcedureStep/ProcedureStep', () => ({
  default: () => <div data-testid="procedure-step">Etapa do Procedimento</div>,
}));

vi.mock('../src/components/dashboard/ChatConversation/ChatConversation', () => ({
  default: () => <div data-testid="chat-step">Etapa da Conversa</div>,
}));

vi.mock('../src/components/dashboard/PricingResult/PricingResult', () => ({
  default: () => <div data-testid="result-step">Etapa do Resultado</div>,
}));

describe('PricingWizard Visual Structure (Issue #38 - FE-025)', () => {
  it('renderiza o cabeçalho e todas as 4 etapas visuais do assistente', () => {
    render(<PricingWizard />);

    expect(screen.getByRole('heading', { name: /criar nova precificação/i })).toBeInTheDocument();
    expect(screen.getByText('Clínica')).toBeInTheDocument();
    expect(screen.getByText('Procedimento')).toBeInTheDocument();
    expect(screen.getByText('Conversa')).toBeInTheDocument();
    expect(screen.getByText('Resultado')).toBeInTheDocument();
    expect(screen.getByTestId('clinic-step')).toBeInTheDocument();
  });
});
