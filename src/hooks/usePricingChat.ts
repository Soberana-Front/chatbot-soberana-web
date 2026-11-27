import {
  useCallback,
  useRef,
  useState,
} from 'react'

import type {
  ChatMessage,
} from '../types/pricing'

import type {
  AdicionarItemData,
} from '../components/dashboard/AdicionarItem/AdicionarItem'

// ============================================================
// COMPATIBILIDADE
// ============================================================

/**
 * Mantém o nome PricingChatMessage utilizado pelos
 * componentes atuais, mas agora ele é baseado no tipo
 * oficial ChatMessage.
 */
export type PricingChatMessage = ChatMessage

// ============================================================
// RESPOSTA MOCKADA DA IA
// ============================================================

/**
 * Resposta utilizada enquanto a API real da IA
 * ainda não está integrada.
 */
const MOCK_AI_RESPONSE =
  'Entendido! Obrigado pelas informações. Vou considerar esses dados para a sua precificação.'

// ============================================================
// TIMEOUT DA IA (ISSUE #53)
// ============================================================

/**
 * Tempo em milissegundos antes de exibir o aviso
 * de espera prolongada.
 */
const AI_TIMEOUT_MS = 15_000

// ============================================================
// MENSAGEM INICIAL
// ============================================================

/**
 * Cria a mensagem inicial da conversa.
 */
const createInitialMessage = (): PricingChatMessage => ({
  id: `initial-${Date.now()}`,
  sender: 'ia',
  message:
    'Olá! Vamos precificar seu procedimento. Me conte mais sobre os custos envolvidos...',
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
})

// ============================================================
// FORMATAÇÃO
// ============================================================

/**
 * Formata um valor numérico para moeda brasileira.
 */
const formatCurrency = (
  value: number,
): string =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

/**
 * Converte a categoria interna do item
 * para um texto amigável.
 */
const getCategoryLabel = (
  category: AdicionarItemData['category'],
): string => {
  switch (category) {
    case 'material':
      return 'Material'

    case 'comissao':
      return 'Comissão'

    case 'imposto':
      return 'Imposto'

    case 'gasto_adicional':
      return 'Gasto adicional'

    case 'outro':
      return 'Outro'

    default:
      return 'Outro'
  }
}

// ============================================================
// HOOK
// ============================================================

/**
 * Hook responsável pelo gerenciamento da conversa
 * de precificação.
 *
 * Inclui tratamento de espera prolongada, erro e
 * rate limit (Issue #53 — FE-040).
 */
export function usePricingChat(options?: { timeoutMs?: number }) {
  const timeoutDuration = options?.timeoutMs ?? AI_TIMEOUT_MS
  // ==========================================================
  // MENSAGENS
  // ==========================================================

  const [messages, setMessages] = useState<
    PricingChatMessage[]
  >([createInitialMessage()])

  // ==========================================================
  // ESTADO DA IA
  // ==========================================================

  const [isTyping, setIsTyping] =
    useState(false)

  // ==========================================================
  // ESTADO DA CONVERSA
  // ==========================================================

  const [isCompleted, setIsCompleted] =
    useState(false)

  // ==========================================================
  // ERRO E TIMEOUT (ISSUE #53)
  // ==========================================================

  const [error, setError] =
    useState<string | null>(null)

  const [isTimedOut, setIsTimedOut] =
    useState(false)

  const [lastFailedMessage, setLastFailedMessage] =
    useState<string | null>(null)

  /**
   * Referência do timer de timeout.
   * Permite limpar o timeout quando a resposta chega.
   */
  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Referência do timer da resposta mockada.
   */
  const responseTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  // ==========================================================
  // LIMPAR TIMEOUT
  // ==========================================================

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // ==========================================================
  // ENVIAR MENSAGEM
  // ==========================================================

  const sendMessage = useCallback(
    (text: string) => {
      const trimmedText = text.trim()

      if (!trimmedText) {
        return
      }

      if (isTyping) {
        return
      }

      if (isCompleted) {
        return
      }

      // Limpa erros anteriores
      setError(null)
      setIsTimedOut(false)

      // Armazena para possível retry
      setLastFailedMessage(trimmedText)

      // ------------------------------------------------------
      // Mensagem do usuário
      // ------------------------------------------------------

      const userMessage: PricingChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        message: trimmedText,
        timestamp: new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        dataSource: 'manual',
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        userMessage,
      ])

      // ------------------------------------------------------
      // Inicia simulação da IA
      // ------------------------------------------------------

      setIsTyping(true)

      // Inicia timeout de espera prolongada (Issue #53)
      clearTimeoutRef()
      timeoutRef.current = setTimeout(() => {
        setIsTimedOut(true)
      }, timeoutDuration)

      // Resposta mockada da IA
      responseTimerRef.current = setTimeout(() => {
        // Limpa o timeout de espera
        clearTimeoutRef()
        setIsTimedOut(false)

        const aiMessage: PricingChatMessage = {
          id: `ia-${Date.now()}`,
          sender: 'ia',
          message: MOCK_AI_RESPONSE,
          timestamp: new Date().toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),
          dataSource: 'suggested',
        }

        setMessages((currentMessages) => [
          ...currentMessages,
          aiMessage,
        ])

        setIsTyping(false)
        setIsCompleted(true)
        setLastFailedMessage(null)
      }, 1000)
    },
    [isTyping, isCompleted, clearTimeoutRef],
  )

  // ==========================================================
  // ADICIONAR ITEM
  // ==========================================================

  const addItem = useCallback(
    (item: AdicionarItemData) => {
      if (isTyping) {
        return
      }

      if (isCompleted) {
        return
      }

      const categoryLabel =
        getCategoryLabel(item.category)

      const itemMessage: PricingChatMessage = {
        id: `item-${Date.now()}`,
        sender: 'user',
        message:
          `Item adicionado: ${item.name} — ` +
          `${formatCurrency(item.value)} ` +
          `(${categoryLabel})`,
        timestamp: new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        dataSource: 'manual',
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        itemMessage,
      ])
    },
    [isTyping, isCompleted],
  )

  // ==========================================================
  // FINALIZAR CONVERSA
  // ==========================================================

  const finishConversation = useCallback(() => {
    if (isTyping) {
      return
    }

    if (messages.length <= 1) {
      return
    }

    setIsCompleted(true)
  }, [isTyping, messages.length])

  // ==========================================================
  // ERRO — LIMPAR (ISSUE #53)
  // ==========================================================

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ==========================================================
  // RETRY — REENVIAR ÚLTIMA MENSAGEM (ISSUE #53)
  // ==========================================================

  const retryLastMessage = useCallback(() => {
    if (lastFailedMessage) {
      setError(null)
      setIsTimedOut(false)
      setIsTyping(false)
      // Chama sendMessage na próxima renderização
      // para evitar problemas com o guard isTyping
      window.setTimeout(() => {
        sendMessage(lastFailedMessage)
      }, 0)
    }
  }, [lastFailedMessage, sendMessage])

  // ==========================================================
  // TIMEOUT — DISPENSAR AVISO (ISSUE #53)
  // ==========================================================

  const dismissTimeout = useCallback(() => {
    setIsTimedOut(false)
  }, [])

  // ==========================================================
  // RESET
  // ==========================================================

  const resetChat = useCallback(() => {
    // Limpa timers
    clearTimeoutRef()
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current)
      responseTimerRef.current = null
    }

    setMessages([createInitialMessage()])
    setIsTyping(false)
    setIsCompleted(false)
    setError(null)
    setIsTimedOut(false)
    setLastFailedMessage(null)
  }, [clearTimeoutRef])

  // ==========================================================
  // RETORNO
  // ==========================================================

  return {
    messages,
    isTyping,
    isCompleted,

    // Erro e timeout (Issue #53)
    error,
    isTimedOut,
    lastFailedMessage,

    sendMessage,
    addItem,

    finishConversation,
    resetChat,

    // Ações de erro (Issue #53)
    clearError,
    retryLastMessage,
    dismissTimeout,
  }
}

export default usePricingChat
