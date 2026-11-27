import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ForgotPassword from '../src/pages/ForgotPassword';

const mockForgotPassword = vi.fn();

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    forgotPassword: mockForgotPassword,
  }),
}));

vi.mock('../src/components/layout/AuthLayout', () => ({
  AuthLayout: ({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </div>
  ),
}));

describe('ForgotPassword Page (Issue #22)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o formulário de recuperação com campo de e-mail e botão', () => {
    render(<ForgotPassword />);

    expect(screen.getByRole('heading', { name: /recuperar senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar link de recuperação/i })).toBeInTheDocument();
  });

  it('exibe erro de validação para e-mail inválido', async () => {
    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it('envia solicitação com sucesso e exibe mensagem neutra sem expor existência de usuário', async () => {
    mockForgotPassword.mockResolvedValueOnce({ success: true, message: 'Link enviado' });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    fireEvent.change(emailInput, { target: { value: 'usuario@exemplo.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('usuario@exemplo.com');
      expect(screen.getByText(/e-mail enviado!/i)).toBeInTheDocument();
      expect(screen.getByText(/enviamos um link de recuperação/i)).toBeInTheDocument();
    });
  });

  it('trata erro retornado pela chamada', async () => {
    mockForgotPassword.mockRejectedValueOnce(new Error('Falha temporária no servidor'));

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    fireEvent.change(emailInput, { target: { value: 'usuario@exemplo.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(screen.getByText(/falha temporária no servidor/i)).toBeInTheDocument();
    });
  });
});
