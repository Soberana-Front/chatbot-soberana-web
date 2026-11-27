import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPage } from '../src/pages/SettingsPage/SettingsPage';

vi.mock('../src/components/dashboard/DashboardLayout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../src/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('../src/hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      currency: 'BRL',
      profitMargin: 30,
      taxRate: 15,
      cardFee: 2.5,
      averageServiceTime: 60,
    },
    isLoading: false,
    error: null,
    updateSettings: vi.fn(),
  }),
}));

describe('SettingsPage (Issue #26 / #186)', () => {
  it('renderiza os campos de moeda, margem de lucro, taxa e tempo de atendimento', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: /configurações/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/moeda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/margem de lucro padrão/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alíquota padrão de impostos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/taxa padrão de cartão/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tempo médio de atendimento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });
});
