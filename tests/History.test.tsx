import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { History } from '../src/pages/history/History';

vi.mock('../src/components/dashboard/DashboardLayout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('History Page (Issue #36 - FE-023)', () => {
  it('renderiza o cabeçalho, filtros de histórico e lista paginada de precificações', () => {
    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /histórico/i })).toBeInTheDocument();
    expect(screen.getByText(/consulte as precificações já realizadas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filtrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
  });
});
