import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdicionarItem from '../src/components/dashboard/AdicionarItem/AdicionarItem';

describe('AdicionarItem (Issue #40 - FE-027)', () => {
  it('renderiza o botão de adicionar item', () => {
    render(<AdicionarItem onAddItem={vi.fn()} />);

    expect(screen.getByRole('button', { name: /\+ adicionar item/i })).toBeInTheDocument();
  });

  it('abre o modal ao clicar no botão e exibe campos de categoria, nome e valor', () => {
    render(<AdicionarItem onAddItem={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /\+ adicionar item/i }));

    expect(screen.getByRole('heading', { name: /adicionar item/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
  });

  it('valida campos e submete novo item de custo', () => {
    const onAddItem = vi.fn();
    render(<AdicionarItem onAddItem={onAddItem} />);

    fireEvent.click(screen.getByRole('button', { name: /\+ adicionar item/i }));

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Broca cirúrgica' } });
    fireEvent.change(screen.getByLabelText(/valor/i), { target: { value: '45,50' } });

    fireEvent.click(screen.getByRole('button', { name: /^adicionar$/i }));

    expect(onAddItem).toHaveBeenCalledWith({
      category: 'material',
      name: 'Broca cirúrgica',
      value: 45.5,
    });
  });
});
