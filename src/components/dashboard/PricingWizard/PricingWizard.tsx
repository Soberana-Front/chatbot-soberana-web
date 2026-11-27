import { useNavigate } from 'react-router'

import ClinicStep from '../ClinicStep/ClinicStep'
import ProcedureStep from '../ProcedureStep/ProcedureStep'
import ChatConversation from '../ChatConversation/ChatConversation'
import PricingResult from '../PricingResult/PricingResult'
import PrivacyConsentModal from '../PrivacyConsentModal/PrivacyConsentModal'
import ManualPricingForm from '../ManualPricingForm/ManualPricingForm'

import {
  FormSteps,
  type Step,
} from '../../ui/FormSteps'

import {
  usePricingWizard,
} from '../../../hooks/usePricingWizard'
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges'

import type {
  ManualPricingFormData,
} from '../../../validations/manualPricingSchema'

// ========================================
// ETAPAS DO WIZARD
// ========================================

// Configuração visual das quatro etapas.
const WIZARD_STEPS: Step[] = [
  {
    label: 'Clínica',
    value: 1,
  },
  {
    label: 'Procedimento',
    value: 2,
  },
  {
    label: 'Conversa',
    value: 3,
  },
  {
    label: 'Resultado',
    value: 4,
  },
]

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

// Componente responsável por integrar
// todo o fluxo da nova precificação.
export default function PricingWizard() {
  // Permite redirecionar o usuário ao finalizar.
  const navigate = useNavigate()

  // ========================================
  // ESTADO CENTRAL DO WIZARD
  // ========================================

  /**
   * Toda a lógica do wizard e do chat é
   * fornecida pelos hooks.
   */
  const {
    currentStep,
    selectedClinic,
    selectedProcedure,
    chatMessages,
    pricingResult,
    isLoading,

    // Estados específicos do chat.
    isTyping,
    isChatCompleted,

    goToStep,

    selectClinic,
    selectProcedure,

    // Funções específicas do chat.
    sendMessage,
    addItem,
    finishConversation,

    calculatePricing,

    // Privacidade (Issue #48).
    privacyAccepted,
    acceptPrivacy,

    // Modo manual (Issue #52).
    isManualMode,
    switchToManual,
    switchToChat,

    // Erro e timeout (Issue #53).
    chatError,
    isTimedOut,
    clearError,
    retryLastMessage,
    dismissTimeout,
  } = usePricingWizard()

  const hasUnsavedChanges =
    Boolean(selectedClinic || selectedProcedure || chatMessages.length > 0) &&
    !pricingResult

  const { confirmLeave } = useUnsavedChanges({
    isDirty: hasUnsavedChanges,
    message:
      'Você possui dados preenchidos nesta precificação que ainda não foram salvos. Deseja realmente sair desta etapa?',
  })

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  /**
   * Permite navegar somente para etapas
   * que já foram alcançadas.
   */
  const handleStepClick = (stepIndex: number) => {
    // Não permite pular etapas futuras.
    if (stepIndex > currentStep) {
      return
    }

    if (stepIndex < currentStep && !confirmLeave()) {
      return
    }

    goToStep(stepIndex)
  }

  /**
   * Volta uma etapa.
   */
  const handlePrevious = () => {
    if (!confirmLeave()) {
      return
    }

    goToStep(currentStep - 1)
  }

  // ========================================
  // ETAPA 1 — CLÍNICA
  // ========================================

  const handleClinicNext = (
    clinic: typeof selectedClinic,
  ) => {
    if (!clinic) {
      return
    }

    // Salva a clínica no hook.
    selectClinic(clinic)

    // Avança para a etapa seguinte.
    goToStep(1)
  }

  // ========================================
  // ETAPA 2 — PROCEDIMENTO
  // ========================================

  const handleProcedureNext = (
    procedure: typeof selectedProcedure,
  ) => {
    if (!procedure) {
      return
    }

    // Salva o procedimento no hook.
    selectProcedure(procedure)

    // Avança para a conversa.
    goToStep(2)
  }

  // ========================================
  // ETAPA 3 — CONVERSA
  // ========================================

  /**
   * Avança da conversa para o resultado.
   *
   * O cálculo mockado é iniciado antes de mudar
   * para a etapa final.
   */
  const handleChatNext = () => {
    if (!isChatCompleted || isTyping) {
      return
    }

    calculatePricing()

    goToStep(3)
  }

  /**
   * Submissão do formulário manual (Issue #52).
   * Avança para o resultado com cálculo mockado.
   */
  const handleManualSubmit = (_data: ManualPricingFormData) => {
    calculatePricing()
    goToStep(3)
  }

  // ========================================
  // ETAPA 4 — RESULTADO
  // ========================================

  const handleFinish = () => {
    // Finaliza o fluxo e retorna ao dashboard.
    navigate('/dashboard')
  }

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  return (
    <section className="pricing-wizard">
      {/* ====================================
          CABEÇALHO
          ==================================== */}

      <header className="pricing-wizard-header">
        <div>
          <p className="pricing-wizard-eyebrow">
            Nova Precificação
          </p>

          <h1 className="pricing-wizard-title">
            Criar nova precificação
          </h1>

          <p className="pricing-wizard-description">
            Siga as etapas para chegar ao preço ideal
            do seu procedimento.
          </p>
        </div>
      </header>

      {/* ====================================
          INDICADOR DAS ETAPAS
          ==================================== */}

      <div className="pricing-wizard-steps">
        <FormSteps
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* ====================================
          CONTEÚDO
          ==================================== */}

      <div className="pricing-wizard-content">

        {/* ====================================
            ETAPA 1 — CLÍNICA
            ==================================== */}

        {currentStep === 0 && (
          <ClinicStep
            initialClinicId={
              selectedClinic?.id
            }
            onNext={handleClinicNext}
          />
        )}

        {/* ====================================
            ETAPA 2 — PROCEDIMENTO
            ==================================== */}

        {currentStep === 1 && (
          <ProcedureStep
            initialProcedureId={
              selectedProcedure?.id
            }
            onNext={handleProcedureNext}
          />
        )}

        {/* ====================================
            ETAPA 3 — CONVERSA / MANUAL
            ==================================== */}

        {currentStep === 2 && (
          <>
            {/* Modal de aceite da política (Issue #48) */}
            {!privacyAccepted && (
              <PrivacyConsentModal
                onAccept={acceptPrivacy}
                onDecline={() => goToStep(1)}
              />
            )}

            {/* Modo manual (Issue #52) */}
            {privacyAccepted && isManualMode && (
              <ManualPricingForm
                onSubmit={handleManualSubmit}
                onBackToChat={switchToChat}
                isLoading={isLoading}
              />
            )}

            {/* Modo chat (padrão) */}
            {privacyAccepted && !isManualMode && (
              <ChatConversation
                messages={chatMessages}
                onSendMessage={sendMessage}
                onAddItem={addItem}
                isTyping={isTyping}
                isCompleted={isChatCompleted}
                onFinishConversation={
                  finishConversation
                }
                onNext={handleChatNext}
                error={chatError}
                isTimedOut={isTimedOut}
                onRetry={retryLastMessage}
                onClearError={clearError}
                onDismissTimeout={dismissTimeout}
                onManualFallback={switchToManual}
              />
            )}
          </>
        )}

        {/* ====================================
            ETAPA 4 — RESULTADO
            ==================================== */}

        {currentStep === 3 && (
          <PricingResult
            data={pricingResult || undefined}
            onFinish={handleFinish}
          />
        )}
      </div>

      {/* ====================================
          CARREGAMENTO
          ==================================== */}

      {isLoading && (
        <p className="pricing-wizard-loading">
          Calculando precificação...
        </p>
      )}

      {/* ====================================
          VOLTAR
          ==================================== */}

      {currentStep > 0 && (
        <div className="pricing-wizard-navigation">
          <button
            type="button"
            onClick={handlePrevious}
            className="pricing-wizard-back-button"
          >
            Voltar
          </button>
        </div>
      )}
    </section>
  )
}
