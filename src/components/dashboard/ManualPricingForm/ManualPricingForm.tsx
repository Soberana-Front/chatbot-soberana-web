// ============================================================
// FORMULÁRIO DE PREENCHIMENTO MANUAL DA PRECIFICAÇÃO
// ============================================================

/**
 * Alternativa ao fluxo de conversa com a IA.
 *
 * Permite que o usuário informe manualmente todos os
 * parâmetros necessários para calcular a precificação
 * quando a IA ou o backend estiverem indisponíveis.
 *
 * Issue #52 — FE-039
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  manualPricingSchema,
  type ManualPricingFormData,
} from '../../../validations/manualPricingSchema'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

// ============================================================
// PROPS
// ============================================================

interface ManualPricingFormProps {
  /** Chamado com os dados validados ao submeter. */
  onSubmit: (data: ManualPricingFormData) => void

  /** Volta para o modo de chat com a IA. */
  onBackToChat?: () => void

  /** Indica que o formulário está processando. */
  isLoading?: boolean

  /** Desabilita todos os campos e botões. */
  disabled?: boolean
}

// ============================================================
// COMPONENTE
// ============================================================

export default function ManualPricingForm({
  onSubmit,
  onBackToChat,
  isLoading = false,
  disabled = false,
}: ManualPricingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualPricingFormData>({
    resolver: zodResolver(manualPricingSchema),
    defaultValues: {
      materialCost: 0,
      fixedCosts: 0,
      variableCosts: 0,
      hourCost: 0,
      commission: 0,
      taxes: 0,
      margin: 0,
      notes: '',
    },
  })

  return (
    <section className="chat-conversation">
      {/* ====================================
       * CABEÇALHO
       * ==================================== */}

      <header className="chat-conversation__header">
        <div>
          <span className="chat-conversation__step">
            Etapa 3 — Modo manual
          </span>

          <h2 className="chat-conversation__title">
            Preenchimento Manual
          </h2>

          <p className="chat-conversation__description">
            Preencha os dados abaixo como alternativa à conversa com
            a IA. Todos os campos numéricos são obrigatórios.
          </p>
        </div>
      </header>

      {/* ====================================
       * FORMULÁRIO
       * ==================================== */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="settings-form"
        noValidate
      >
        {/* Seção: Custos */}
        <section className="settings-section">
          <h2 className="settings-section-title">Custos</h2>

          <div className="settings-form-grid">
            <Input
              label="Custo de materiais (R$)"
              type="number"
              step="0.01"
              min={0}
              defaultValue="0"
              error={errors.materialCost?.message}
              required
              disabled={disabled}
              {...register('materialCost', {
                valueAsNumber: true,
              })}
            />

            <Input
              label="Custos fixos (R$)"
              type="number"
              step="0.01"
              min={0}
              defaultValue="0"
              error={errors.fixedCosts?.message}
              required
              disabled={disabled}
              {...register('fixedCosts', {
                valueAsNumber: true,
              })}
            />

            <Input
              label="Custos variáveis (R$)"
              type="number"
              step="0.01"
              min={0}
              defaultValue="0"
              error={errors.variableCosts?.message}
              required
              disabled={disabled}
              {...register('variableCosts', {
                valueAsNumber: true,
              })}
            />

            <Input
              label="Custo por hora (R$)"
              type="number"
              step="0.01"
              min={0}
              defaultValue="0"
              error={errors.hourCost?.message}
              required
              disabled={disabled}
              {...register('hourCost', {
                valueAsNumber: true,
              })}
            />
          </div>
        </section>

        {/* Seção: Percentuais */}
        <section className="settings-section">
          <h2 className="settings-section-title">Percentuais</h2>

          <div className="settings-form-grid">
            <Input
              label="Comissão (%)"
              type="number"
              step="0.01"
              min={0}
              max={100}
              defaultValue="0"
              error={errors.commission?.message}
              required
              disabled={disabled}
              {...register('commission', {
                valueAsNumber: true,
              })}
            />

            <Input
              label="Impostos (%)"
              type="number"
              step="0.01"
              min={0}
              max={100}
              defaultValue="0"
              error={errors.taxes?.message}
              required
              disabled={disabled}
              {...register('taxes', {
                valueAsNumber: true,
              })}
            />

            <Input
              label="Margem de lucro (%)"
              type="number"
              step="0.01"
              min={0}
              max={100}
              defaultValue="0"
              error={errors.margin?.message}
              required
              disabled={disabled}
              {...register('margin', {
                valueAsNumber: true,
              })}
            />
          </div>
        </section>

        {/* Seção: Observações */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            Observações (opcional)
          </h2>

          <textarea
            className="adicionar-item__input"
            rows={3}
            placeholder="Anotações adicionais sobre esta precificação..."
            disabled={disabled}
            {...register('notes')}
            style={{
              width: '100%',
              resize: 'vertical',
            }}
          />
        </section>

        {/* ====================================
         * AÇÕES
         * ==================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
          }}
        >
          {onBackToChat && (
            <button
              type="button"
              className="adicionar-item__cancel"
              onClick={onBackToChat}
              disabled={disabled || isLoading}
            >
              Voltar ao chat
            </button>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={disabled}
          >
            Calcular precificação
          </Button>
        </div>
      </form>
    </section>
  )
}
