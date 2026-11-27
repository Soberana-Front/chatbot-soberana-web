import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SocialLoginButtons } from '../src/components/shared/SocialLoginButtons';

describe('SocialLoginButtons', () => {
  it('renderiza botões de login com Google e GitHub', () => {
    render(<SocialLoginButtons />);

    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar com github/i })).toBeInTheDocument();
  });

  it('dispara callbacks ao clicar nos botões sociais', () => {
    const onGoogleClick = vi.fn();
    const onGithubClick = vi.fn();

    render(
      <SocialLoginButtons
        onGoogleClick={onGoogleClick}
        onGithubClick={onGithubClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }));
    fireEvent.click(screen.getByRole('button', { name: /entrar com github/i }));

    expect(onGoogleClick).toHaveBeenCalledTimes(1);
    expect(onGithubClick).toHaveBeenCalledTimes(1);
  });

  it('desabilita ambos os botões quando disabled é true', () => {
    render(<SocialLoginButtons disabled />);

    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /entrar com github/i })).toBeDisabled();
  });
});
