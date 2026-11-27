import { useCallback, useEffect } from 'react';

interface UseUnsavedChangesOptions {
  isDirty: boolean;
  message?: string;
}

const DEFAULT_UNSAVED_MESSAGE =
  'Existem alterações não salvas. Deseja realmente sair sem salvar?';

/**
 * Hook reutilizável para proteger formulários e etapas com alterações não persistidas.
 * Ativa alerta de saída do navegador (`beforeunload`) e fornece `confirmAction`
 * para confirmar abandono de etapa ou cancelamento.
 */
export function useUnsavedChanges({
  isDirty,
  message = DEFAULT_UNSAVED_MESSAGE,
}: UseUnsavedChangesOptions) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  const confirmLeave = useCallback(() => {
    if (!isDirty) return true;
    return window.confirm(message);
  }, [isDirty, message]);

  return { confirmLeave };
}
