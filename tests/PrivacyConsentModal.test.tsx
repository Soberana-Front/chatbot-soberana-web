import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PrivacyConsentModal from '../src/components/dashboard/PrivacyConsentModal/PrivacyConsentModal';

describe('PrivacyConsentModal (Issue #48)', () => {
  it('renderiza título, tópicos de transparência e botões de aceite/recusa', () => {
    render(<PrivacyConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /política de privacidade e uso de ia/i })).toBeInTheDocument();
    expect(screen.getByText(/dados armazenados:/i)).toBeInTheDocument();
    expect(screen.getByText(/uso de provedores externos de ia:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aceitar e continuar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recusar/i })).toBeInTheDocument();
  });

  it('dispara onAccept ao clicar em Aceitar e continuar', () => {
    const onAccept = vi.fn();
    render(<PrivacyConsentModal onAccept={onAccept} onDecline={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /aceitar e continuar/i }));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('dispara onDecline ao clicar em Recusar', () => {
    const onDecline = vi.fn();
    render(<PrivacyConsentModal onAccept={vi.fn()} onDecline={onDecline} />);

    fireEvent.click(screen.getByRole('button', { name: /recusar/i }));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });
});
