// ============================================================
// MODAL DE ACEITE DA POLÍTICA DE PRIVACIDADE
// ============================================================

/**
 * Componente exibido antes de iniciar a conversa com a IA.
 *
 * Informa ao usuário quais dados são armazenados, a finalidade
 * do uso e como os provedores externos de IA são utilizados.
 *
 * Issue #48 — FE-035
 */

// ============================================================
// PROPS
// ============================================================

interface PrivacyConsentModalProps {
  /** Chamado quando o usuário aceita a política. */
  onAccept: () => void

  /** Chamado quando o usuário recusa a política. */
  onDecline: () => void
}

// ============================================================
// COMPONENTE
// ============================================================

export default function PrivacyConsentModal({
  onAccept,
  onDecline,
}: PrivacyConsentModalProps) {
  return (
    <div
      className="adicionar-item__overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onDecline()
        }
      }}
    >
      <div
        className="adicionar-item__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-consent-title"
        style={{ maxWidth: '32rem' }}
      >
        {/* ====================================
         * CABEÇALHO
         * ==================================== */}

        <div className="adicionar-item__header">
          <div>
            <span className="adicionar-item__step">
              Privacidade
            </span>

            <h2
              id="privacy-consent-title"
              className="adicionar-item__title"
            >
              Política de Privacidade e Uso de IA
            </h2>

            <p className="adicionar-item__description">
              Antes de iniciar a conversa com a Soberana AI,
              leia e aceite os termos abaixo.
            </p>
          </div>
        </div>

        {/* ====================================
         * CONTEÚDO DA POLÍTICA
         * ==================================== */}

        <div style={{ padding: '0 1.5rem 1rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-gray-50, #f9fafb)',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              color: 'var(--color-gray-700, #374151)',
            }}
          >
            <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
              Dados armazenados:
            </p>
            <ul
              style={{
                paddingLeft: '1.25rem',
                marginBottom: '1rem',
                listStyleType: 'disc',
              }}
            >
              <li>Nome e e-mail do usuário</li>
              <li>Dados de custos informados durante a precificação</li>
              <li>Mensagens trocadas com a IA</li>
            </ul>

            <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
              Finalidade:
            </p>
            <ul
              style={{
                paddingLeft: '1.25rem',
                marginBottom: '1rem',
                listStyleType: 'disc',
              }}
            >
              <li>
                Alimentar a inteligência artificial para calcular a
                precificação do procedimento
              </li>
              <li>
                Gerar sugestões de preços baseadas nos custos informados
              </li>
            </ul>

            <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
              Uso de provedores externos de IA:
            </p>
            <ul
              style={{
                paddingLeft: '1.25rem',
                marginBottom: '0.5rem',
                listStyleType: 'disc',
              }}
            >
              <li>
                Os dados da conversa são enviados de forma anônima a
                provedores de inteligência artificial (como OpenAI e
                Anthropic) exclusivamente para processamento
              </li>
              <li>
                Nenhum dado pessoal identificável é compartilhado com
                esses provedores
              </li>
            </ul>
          </div>
        </div>

        {/* ====================================
         * AÇÕES
         * ==================================== */}

        <div className="adicionar-item__actions">
          <button
            type="button"
            className="adicionar-item__cancel"
            onClick={onDecline}
          >
            Recusar
          </button>

          <button
            type="button"
            className="adicionar-item__submit"
            onClick={onAccept}
          >
            Aceitar e continuar
          </button>
        </div>
      </div>
    </div>
  )
}
