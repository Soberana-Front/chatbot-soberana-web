import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePricingChat } from '../src/hooks/usePricingChat';

describe('usePricingChat (Issue #53)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inicializa com mensagem da IA e estados vazios', () => {
    const { result } = renderHook(() => usePricingChat());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].sender).toBe('ia');
    expect(result.current.isTyping).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isTimedOut).toBe(false);
  });

  it('ativa timeout prolongado caso a resposta demore mais de 15 segundos', () => {
    const { result } = renderHook(() => usePricingChat({ timeoutMs: 200 }));

    act(() => {
      result.current.sendMessage('Mensagem de teste');
    });

    expect(result.current.isTyping).toBe(true);
    expect(result.current.isTimedOut).toBe(false);

    // Avança 200ms para disparar o timeout antes da resposta mockada (1000ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isTimedOut).toBe(true);
  });

  it('permite dispensar o aviso de timeout', () => {
    const { result } = renderHook(() => usePricingChat({ timeoutMs: 200 }));

    act(() => {
      result.current.sendMessage('Mensagem de teste');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isTimedOut).toBe(true);

    act(() => {
      result.current.dismissTimeout();
    });

    expect(result.current.isTimedOut).toBe(false);
  });
});
