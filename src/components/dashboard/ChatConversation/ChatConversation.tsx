import { useEffect, useRef } from 'react'

import { ChatMessage } from '../ChatMessage/ChatMessage'
import { ChatInput } from '../ChatInput/ChatInput'
import AdicionarItem from '../AdicionarItem/AdicionarItem'

import type {
  PricingChatMessage,
} from '../../../hooks/usePricingChat'

import type {
  AdicionarItemData,
} from '../AdicionarItem/AdicionarItem'

// ========================================
// PROPS
// ========================================

/**
 * Props recebidas pelo componente de conversa.
 *
 * O componente não controla a lógica da IA.
 * Essa responsabilidade pertence ao usePricingChat.
 */
interface ChatConversationProps {
  /**
   * Mensagens atuais da conversa.
   */
  messages: PricingChatMessage[]

  /**
   * Função responsável pelo envio de mensagens.
   */
  onSendMessage: (message: string) => void

  /**
   * Função responsável pela inclusão de um
   * novo item de custo na conversa.
   */
  onAddItem: (item: AdicionarItemData) => void

  /**
   * Indica que a IA está processando uma resposta.
   */
  isTyping: boolean

  /**
   * Indica que a conversa foi finalizada.
   */
  isCompleted: boolean

  /**
   * Finaliza a conversa.
   */
  onFinishConversation: () => void

  /**
   * Avança para a próxima etapa.
   */
  onNext?: () => void

  // ========================================
  // ERRO E TIMEOUT (ISSUE #53)
  // ========================================

  /**
   * Mensagem de erro, se houver.
   */
  error?: string | null

  /**
   * Indica que a IA está demorando mais que o esperado.
   */
  isTimedOut?: boolean

  /**
   * Reenvia a última mensagem que falhou.
   */
  onRetry?: () => void

  /**
   * Limpa o erro exibido.
   */
  onClearError?: () => void

  /**
   * Dispensa o aviso de timeout.
   */
  onDismissTimeout?: () => void

  /**
   * Alterna para o modo de preenchimento manual.
   */
  onManualFallback?: () => void
}

// ========================================
// COMPONENTE
// ========================================

/**
 * Exibe a interface da conversa de precificação.
 *
 * A lógica de mensagens, IA e adição de itens
 * fica centralizada nos hooks.
 */
export default function ChatConversation({
  messages,
  onSendMessage,
  onAddItem,
  isTyping,
  isCompleted,
  onFinishConversation,
  onNext,
  error,
  isTimedOut,
  onRetry,
  onClearError,
  onDismissTimeout,
  onManualFallback,
}: ChatConversationProps) {
  // ========================================
  // REFERÊNCIA DO SCROLL
  // ========================================

  /**
   * Referência utilizada para manter a conversa
   * posicionada na última mensagem.
   */
  const messagesEndRef =
    useRef<HTMLDivElement | null>(null)

  // ========================================
  // SCROLL AUTOMÁTICO
  // ========================================

  /**
   * Sempre que uma mensagem nova for adicionada
   * ou a IA começar a digitar, leva a conversa
   * automaticamente para o final.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isTyping])

  // ========================================
  // AVANÇAR
  // ========================================

  /**
   * Só permite avançar depois que a conversa
   * estiver finalizada e a IA não estiver digitando.
   */
  const handleNext = () => {
    if (!isCompleted || isTyping) {
      return
    }

    onNext?.()
  }

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  return (
    <section className="chat-conversation">
      {/* ====================================
          CABEÇALHO
          ==================================== */}

      <header className="chat-conversation__header">
        <div>
          <span className="chat-conversation__step">
            Etapa 3
          </span>

          <h2 className="chat-conversation__title">
            Converse com a Soberana AI
          </h2>

          <p className="chat-conversation__description">
            Converse com a IA para refinar as informações da sua
            precificação.
          </p>
        </div>
      </header>

      {/* ====================================
          ÁREA DO CHAT
          ==================================== */}

      <div className="chat-conversation__card">
        <div className="chat-conversation__messages">
          {/* ====================================
              MENSAGENS
              ==================================== */}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              sender={message.sender}
              message={message.message}
              timestamp={message.timestamp}
              dataSource={message.dataSource}
            />
          ))}

          {/* ====================================
              INDICADOR DE DIGITAÇÃO
              ==================================== */}

          {isTyping && (
            <div
              className="chat-conversation__loading"
              aria-live="polite"
            >
              Soberana AI está digitando...
            </div>
          )}

          {/* ====================================
              AVISO DE TIMEOUT (ISSUE #53)
              ==================================== */}

          {isTimedOut && isTyping && (
            <div
              role="alert"
              style={{
                margin: '0.5rem 0',
                padding: '0.75rem 1rem',
                backgroundColor: '#fffbeb',
                border: '1px solid #fbbf24',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <span>
                A IA está demorando mais que o esperado. Aguarde ou
                tente novamente.
              </span>
              {onDismissTimeout && (
                <button
                  type="button"
                  onClick={onDismissTimeout}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#92400e',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Dispensar
                </button>
              )}
            </div>
          )}

          {/* ====================================
              ERRO (ISSUE #53)
              ==================================== */}

          {error && (
            <div
              role="alert"
              style={{
                margin: '0.5rem 0',
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#991b1b',
              }}
            >
              <p style={{ margin: '0 0 0.5rem' }}>{error}</p>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.8125rem',
                      backgroundColor: '#991b1b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    Tentar novamente
                  </button>
                )}
                {onClearError && (
                  <button
                    type="button"
                    onClick={onClearError}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.8125rem',
                      backgroundColor: 'transparent',
                      color: '#991b1b',
                      border: '1px solid #fca5a5',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    Dispensar
                  </button>
                )}
                {onManualFallback && (
                  <button
                    type="button"
                    onClick={onManualFallback}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.8125rem',
                      backgroundColor: 'transparent',
                      color: '#4f46e5',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Preencher manualmente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Elemento utilizado para o scroll automático */}
          <div ref={messagesEndRef} />
        </div>

        {/* ====================================
            CAMPO DE ENVIO
            ==================================== */}

        <div className="chat-conversation__input">
          <ChatInput
            onSendMessage={onSendMessage}
            disabled={isTyping || isCompleted}
          />
        </div>

        {/* ====================================
            ADICIONAR ITEM
            ==================================== */}

        <div className="chat-conversation__add-item">
          <AdicionarItem
            onAddItem={onAddItem}
            disabled={isTyping || isCompleted}
          />
        </div>
      </div>

      {/* ====================================
          AÇÕES
          ==================================== */}

      <div className="chat-conversation__footer">
        {/* ====================================
            FALLBACK MANUAL (ISSUE #52)
            ==================================== */}

        {!isCompleted && onManualFallback && (
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline',
            }}
            onClick={onManualFallback}
          >
            Preencher manualmente
          </button>
        )}

        {/* ====================================
            FINALIZAR CONVERSA
            ==================================== */}

        {!isCompleted && (
          <button
            type="button"
            className="chat-conversation__finish-button"
            onClick={onFinishConversation}
            disabled={
              isTyping ||
              messages.length <= 1
            }
          >
            Encerrar conversa
          </button>
        )}

        {/* ====================================
            PRÓXIMO
            ==================================== */}

        <button
          type="button"
          className="chat-conversation__next-button"
          onClick={handleNext}
          disabled={
            !isCompleted ||
            isTyping
          }
        >
          Próximo
        </button>
      </div>
    </section>
  )
}
