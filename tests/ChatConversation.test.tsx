import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatConversation from '../src/components/dashboard/ChatConversation/ChatConversation';

describe('ChatConversation (Issue #49 - FE-036)', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });
  const mockMessages = [
    {
      id: '1',
      sender: 'ia' as const,
      message: 'Olá! Me conte sobre os custos.',
      timestamp: '10:00',
    },
    {
      id: '2',
      sender: 'user' as const,
      message: 'O custo de material é R$ 50.',
      timestamp: '10:01',
    },
  ];

  it('renderiza as mensagens trocadas, campo de entrada e botões de ação', () => {
    render(
      <ChatConversation
        messages={mockMessages}
        onSendMessage={vi.fn()}
        onAddItem={vi.fn()}
        isTyping={false}
        isCompleted={false}
        onFinishConversation={vi.fn()}
      />,
    );

    expect(screen.getByText('Olá! Me conte sobre os custos.')).toBeInTheDocument();
    expect(screen.getByText('O custo de material é R$ 50.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite sua mensagem/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /encerrar conversa/i })).toBeInTheDocument();
  });

  it('permite enviar nova mensagem na conversa', () => {
    const onSendMessage = vi.fn();
    render(
      <ChatConversation
        messages={mockMessages}
        onSendMessage={onSendMessage}
        onAddItem={vi.fn()}
        isTyping={false}
        isCompleted={false}
        onFinishConversation={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/digite sua mensagem/i);
    fireEvent.change(input, { target: { value: 'Mais detalhes sobre materiais' } });
    fireEvent.click(screen.getByTitle(/enviar mensagem/i));

    expect(onSendMessage).toHaveBeenCalledWith('Mais detalhes sobre materiais');
  });
});
