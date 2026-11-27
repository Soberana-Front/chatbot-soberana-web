// Importa componente Button da UI
import { Button } from '../ui/Button';

// Props do componente de botões sociais
interface SocialLoginButtonsProps {
  buttonText?: string;
  githubButtonText?: string;
  onGoogleClick?: () => void;
  onGithubClick?: () => void;
  disabled?: boolean;
}

const GoogleIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M21.8 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.48Z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.75 0 5.06-.91 6.75-2.46l-3.3-2.56c-.91.61-2.08.97-3.45.97-2.65 0-4.9-1.79-5.7-4.2H2.89v2.64A10 10 0 0 0 12 22Z"
      fill="#34A853"
    />
    <path
      d="M6.3 13.75a6.01 6.01 0 0 1 0-3.5V7.61H2.89a10 10 0 0 0 0 8.78l3.41-2.64Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.05c1.5 0 2.84.51 3.9 1.52l2.92-2.92C17.05 3.01 14.75 2 12 2A10 10 0 0 0 2.89 7.61l3.41 2.64c.8-2.41 3.05-4.2 5.7-4.2Z"
      fill="#EA4335"
    />
  </svg>
);

const GithubIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
    />
  </svg>
);

// Componente com botões de login social (Google e GitHub)
export const SocialLoginButtons = ({
  buttonText = 'Entrar com Google',
  githubButtonText = 'Entrar com GitHub',
  onGoogleClick,
  onGithubClick,
  disabled = false,
}: SocialLoginButtonsProps) => {
  return (
    <div className="social-login-buttons">
      {/* Divisor com texto "Ou continue com" */}
      <div className="social-login-divider">
        <div className="absolute inset-0 flex items-center">
          <div className="social-login-divider-line" />
        </div>
        <div className="social-login-divider-text-wrapper">
          <span className="social-login-divider-text">Ou continue com</span>
        </div>
      </div>

      {/* Botões de login social */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="social-login-btn"
          onClick={onGoogleClick}
          disabled={disabled}
        >
          <GoogleIcon />
          {buttonText}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="social-login-btn"
          onClick={onGithubClick}
          disabled={disabled}
        >
          <GithubIcon />
          {githubButtonText}
        </Button>
      </div>
    </div>
  );
};