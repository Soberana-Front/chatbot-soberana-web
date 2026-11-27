import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUnsavedChanges } from '../src/hooks/useUnsavedChanges';

describe('useUnsavedChanges (Issue #41)', () => {
  const confirmSpy = vi.spyOn(window, 'confirm');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    confirmSpy.mockReset();
  });

  it('permite sair sem confirmação quando isDirty é false', () => {
    const { result } = renderHook(() =>
      useUnsavedChanges({ isDirty: false }),
    );

    expect(result.current.confirmLeave()).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('solicita confirmação quando isDirty é true e bloqueia beforeunload', () => {
    confirmSpy.mockReturnValue(false);
    const { result } = renderHook(() =>
      useUnsavedChanges({ isDirty: true, message: 'Descartar alterações?' }),
    );

    expect(result.current.confirmLeave()).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith('Descartar alterações?');

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
