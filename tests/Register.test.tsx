import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { InitialSettingsSection } from '../src/components/forms/InitialSettingsSection';
import Register from '../src/pages/Register';
import type { RegisterFormData } from '../src/validations/authSchemas';

const mockRegister = vi.fn();
const mockShowToast = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

vi.mock('../src/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function InitialSettingsHarness() {
  const methods = useForm<RegisterFormData>({
    defaultValues: {
      settings: {
        currency: 'BRL',
        profitMargin: 30,
        taxRate: 15,
        cardFee: 2,
      },
    },
  });

  return (
    <FormProvider {...methods}>
      <InitialSettingsSection />
    </FormProvider>
  );
}

describe('InitialSettingsSection e Register (3 passos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockResolvedValue(undefined);
  });

  it('renderiza InitialSettingsSection com valores padrão e sufixos %', () => {
    render(<InitialSettingsHarness />);

    expect(screen.getByLabelText(/moeda utilizada/i)).toHaveValue('BRL');
    expect(screen.getByLabelText(/margem de lucro padrão/i)).toHaveValue(30);
    expect(screen.getByLabelText(/alíquota padrão de impostos/i)).toHaveValue(15);
    expect(screen.getByLabelText(/taxa padrão de cartão/i)).toHaveValue(2);
    expect(screen.getAllByText('%')).toHaveLength(3);
  });

  it('navega pelos 3 passos do cadastro e envia settings no payload', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
    expect(screen.getByText('Configurações Iniciais')).toBeInTheDocument();
    expect(screen.getByText('Senha')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Maria Silva' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'maria@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '11999998888' },
    });
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: '12345678901' },
    });
    fireEvent.click(screen.getByText('Profissional'));

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/moeda utilizada/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/margem de lucro padrão/i), {
      target: { value: '35' },
    });

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^senha/i), {
      target: { value: 'SenhaForte123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: 'SenhaForte123' },
    });
    fireEvent.click(screen.getByLabelText(/termos de uso/i));
    fireEvent.click(screen.getByLabelText(/política de privacidade/i));

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Maria Silva',
          email: 'maria@exemplo.com',
          settings: expect.objectContaining({
            currency: 'BRL',
            profitMargin: 35,
            taxRate: 15,
            cardFee: 2,
          }),
        }),
      );
    });
  });
});
