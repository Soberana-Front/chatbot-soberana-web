import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DataSourceBadge from '../src/components/dashboard/DataSourceBadge/DataSourceBadge';

describe('DataSourceBadge (Issue #50)', () => {
  it('renderiza os diferentes rótulos padrão conforme o tipo', () => {
    const { rerender } = render(<DataSourceBadge type="manual" />);
    expect(screen.getByText('Manual')).toBeInTheDocument();

    rerender(<DataSourceBadge type="suggested" />);
    expect(screen.getByText('Sugerido pela IA')).toBeInTheDocument();

    rerender(<DataSourceBadge type="confirmed" />);
    expect(screen.getByText('Confirmado')).toBeInTheDocument();

    rerender(<DataSourceBadge type="rejected" />);
    expect(screen.getByText('Rejeitado')).toBeInTheDocument();
  });

  it('permite sobrescrever com label customizado', () => {
    render(<DataSourceBadge type="suggested" label="IA Proposta" />);
    expect(screen.getByText('IA Proposta')).toBeInTheDocument();
  });
});
