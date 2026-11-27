import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExtractedDataConfirmation, {
  type ExtractedDataItem,
} from '../src/components/dashboard/ExtractedDataConfirmation/ExtractedDataConfirmation';

describe('ExtractedDataConfirmation (Issue #51)', () => {
  const items: ExtractedDataItem[] = [
    { id: '1', label: 'Custo de luvas', value: 25.5, unit: 'R$', status: 'pending' },
    { id: '2', label: 'Anestésico', value: 40, unit: 'R$', status: 'confirmed' },
  ];

  it('exibe a lista de itens com seus dados e botões de ação', () => {
    render(
      <ExtractedDataConfirmation
        items={items}
        onConfirmAll={vi.fn()}
        onConfirmItem={vi.fn()}
        onRejectItem={vi.fn()}
        onEditItem={vi.fn()}
      />,
    );

    expect(screen.getByText('Custo de luvas')).toBeInTheDocument();
    expect(screen.getByText('Anestésico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar todos/i })).toBeInTheDocument();
  });

  it('dispara onConfirmItem ao clicar no botão de confirmação individual', () => {
    const onConfirmItem = vi.fn();
    render(
      <ExtractedDataConfirmation
        items={items}
        onConfirmAll={vi.fn()}
        onConfirmItem={onConfirmItem}
        onRejectItem={vi.fn()}
        onEditItem={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Confirmar Custo de luvas'));
    expect(onConfirmItem).toHaveBeenCalledWith('1');
  });

  it('dispara onRejectItem ao clicar no botão de rejeição', () => {
    const onRejectItem = vi.fn();
    render(
      <ExtractedDataConfirmation
        items={items}
        onConfirmAll={vi.fn()}
        onConfirmItem={vi.fn()}
        onRejectItem={onRejectItem}
        onEditItem={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Rejeitar Custo de luvas'));
    expect(onRejectItem).toHaveBeenCalledWith('1');
  });
});
