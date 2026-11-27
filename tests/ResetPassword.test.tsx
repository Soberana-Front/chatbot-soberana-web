import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPassword from '../src/pages/ResetPassword';

const mockResetPassword = vi.fn();

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
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

vi.mock('react-router', () => ({
  useParams: () => ({ token: 'token-teste-123' }),
}));

describe('ResetPassword Page (Issue #23)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os campos de nova senha e confirmação', () => {
    render(<ResetPassword />);

    expect(screen.getByRole('heading', { name: /redefinir senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^nova senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar nova senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeInTheDocument();
  });

  it('valida divergência entre senha e confirmação', async () => {
    render(<ResetPassword />);

    fireEvent.change(screen.getByLabelText(/^nova senha/i), { target: { value: 'senha1234' } });
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), { target: { value: 'outrasenha' } });
    fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('submete com token válido e exibe tela de sucesso', async () => {
    mockResetPassword.mockResolvedValueOnce({ success: true, message: 'Senha alterada' });

    render(<ResetPassword />);

    fireEvent.change(screen.getByLabelText(/^nova senha/i), { target: { value: 'novaSenha123' } });
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), { target: { value: 'novaSenha123' } });
    fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: 'token-teste-123',
        password: 'novaSenha123',
        passwordConfirmation: 'novaSenha123',
      });
      expect(screen.getByText(/senha redefinida com sucesso!/i)).toBeInTheDocument();
    });
  });
});
