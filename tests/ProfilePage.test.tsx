import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { ProfilePage } from '../src/pages/ProfilePage/ProfilePage';

vi.mock('../src/components/dashboard/DashboardLayout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../src/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('../src/hooks/useProfile', () => ({
  useProfile: () => ({
    user: {
      name: 'Dra. Ana Silva',
      email: 'ana@soberana.com',
      phone: '11999998888',
      specialty: 'Ortodontia',
      avatarUrl: undefined,
    },
    isLoading: false,
    error: null,
    updateProfile: vi.fn(),
    updateAvatar: vi.fn(),
  }),
}));

describe('ProfilePage (Issue #26)', () => {
  it('renderiza os dados do perfil e link para alteração de senha', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /meu perfil/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dra. Ana Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana@soberana.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar dados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alterar senha/i })).toBeInTheDocument();
  });
});
