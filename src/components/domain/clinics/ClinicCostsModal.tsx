import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Spinner } from '../../ui/Spinner'
import { clinicService, type ClinicCosts } from '../../../services/clinicService'
import type { ClinicSummary } from '../../../hooks/useClinics'
import { clinicCostsSchema, type ClinicCostsFormData } from '../../../validations/clinicCostsSchema'
import { formatCurrency } from '../../../utils/formatCurrency'

export interface ClinicCostsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinic?: ClinicSummary | null
  onCostsSaved?: (newCosts: ClinicCosts) => void
}

/**
 * Modal para consulta e edição dos custos vigentes da clínica (Issue #31 - FE-018).
 *
 * Funcionalidades:
 * 1. Consulta o custo vigente atual via GET /clinics/:clinicId/costs/current.
 * 2. Exibe métricas vigentes (fixo mensal, variável mensal, horas e custo da hora clínica).
 * 3. Formulário de registro de novo período de custos via POST /clinics/:clinicId/costs.
 * 4. Cálculo dinâmico em tempo real de horas clínicas conforme o usuário digita.
 */
export const ClinicCostsModal: React.FC<ClinicCostsModalProps> = ({
  open,
  onOpenChange,
  clinic,
  onCostsSaved,
}) => {
  const [currentCosts, setCurrentCosts] = useState<ClinicCosts | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClinicCostsFormData>({
    resolver: zodResolver(clinicCostsSchema),
    defaultValues: {
      sixMonthFixedCost: 0,
      sixMonthVariableCost: 0,
      effectiveHoursPerMonth: 160,
    },
  })

  // Carrega os custos vigentes ao abrir a modal
  useEffect(() => {
    if (!open || !clinic?.id) {
      setCurrentCosts(null)
      setFeedbackMessage(null)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setFeedbackMessage(null)

    clinicService
      .getCurrentCosts(clinic.id)
      .then((costs) => {
        if (!isMounted) return
        setCurrentCosts(costs)
        if (costs) {
          reset({
            sixMonthFixedCost: costs.sixMonthFixedCost,
            sixMonthVariableCost: costs.sixMonthVariableCost,
            effectiveHoursPerMonth: costs.effectiveHoursPerMonth,
          })
        }
      })
      .catch(() => {
        if (!isMounted) return
        setCurrentCosts(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [open, clinic, reset])

  // Valores dinâmicos para cálculo em tempo real
  const watchedFixed = watch('sixMonthFixedCost') || 0
  const watchedVariable = watch('sixMonthVariableCost') || 0
  const watchedHours = watch('effectiveHoursPerMonth') || 1

  const projectedMonthlyFixed = watchedFixed / 6
  const projectedMonthlyVariable = watchedVariable / 6
  const projectedTotalMonthly = projectedMonthlyFixed + projectedMonthlyVariable
  const projectedHourlyCost = watchedHours > 0 ? projectedTotalMonthly / watchedHours : 0

  // Submissão do novo período
  const onSubmit = async (data: ClinicCostsFormData) => {
    if (!clinic?.id) return

    setIsSubmitting(true)
    setFeedbackMessage(null)

    try {
      const created = await clinicService.createCosts(clinic.id, {
        sixMonthFixedCost: data.sixMonthFixedCost,
        sixMonthVariableCost: data.sixMonthVariableCost,
        effectiveHoursPerMonth: data.effectiveHoursPerMonth,
      })

      setCurrentCosts(created)
      setFeedbackMessage({
        type: 'success',
        text: 'Novo período de custos vigente cadastrado com sucesso!',
      })
      if (onCostsSaved) {
        onCostsSaved(created)
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Não foi possível salvar o novo período de custos. Verifique os dados e tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span>Custos Operacionais — {clinic?.name || 'Clínica'}</span>
        </div>
      </ModalHeader>

      <ModalBody>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Consultando período de custos vigente...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mensagem de Feedback */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            {/* Painel de Custos Vigentes Atuais */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Período Vigente Atual
                </span>
                {currentCosts && (
                  <span className="text-xs text-slate-500 font-medium">
                    Vigência desde {new Date(currentCosts.effectiveDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>

              {currentCosts ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-0.5">Fixo Mensal</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatCurrency(currentCosts.monthlyFixedCost)}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-0.5">Variável Mensal</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatCurrency(currentCosts.monthlyVariableCost)}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-0.5">Horas Úteis/mês</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {currentCosts.effectiveHoursPerMonth}h
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-700 font-medium mb-0.5">Hora Clínica</p>
                    <p className="text-sm font-bold text-emerald-800">
                      {formatCurrency(
                        (currentCosts.monthlyFixedCost + currentCosts.monthlyVariableCost) /
                          currentCosts.effectiveHoursPerMonth
                      )}
                      /h
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-1">
                  Nenhum período de custo vigente cadastrado. Cadastre o período inicial abaixo.
                </p>
              )}
            </div>

            {/* Formulário de Novo Período */}
            <form id="clinic-costs-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Registrar Novo Período de Custos
              </h4>
              <p className="text-xs text-slate-500">
                Ao cadastrar um novo período, o custo anterior será arquivado e o novo valor passará a ser o vigente para precificações.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Custo Fixo Semestral (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  error={errors.sixMonthFixedCost?.message}
                  required
                  {...register('sixMonthFixedCost', { valueAsNumber: true })}
                />

                <Input
                  label="Custo Variável Semestral (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  error={errors.sixMonthVariableCost?.message}
                  required
                  {...register('sixMonthVariableCost', { valueAsNumber: true })}
                />

                <Input
                  label="Horas Úteis / Mês"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Ex: 160"
                  error={errors.effectiveHoursPerMonth?.message}
                  required
                  {...register('effectiveHoursPerMonth', { valueAsNumber: true })}
                />
              </div>

              {/* Simulação e Cálculos Dinâmicos em Tempo Real */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-2">
                <p className="text-xs font-semibold text-indigo-900">
                  Projeção dos Custos Mensais e Hora Clínica (Tempo Real):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Fixo mensal (÷6):</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(projectedMonthlyFixed)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Variável mensal (÷6):</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(projectedMonthlyVariable)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Custo Total / Mês:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(projectedTotalMonthly)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-800 block font-medium">Custo / Hora:</span>
                    <span className="font-bold text-indigo-950 text-sm">
                      {formatCurrency(projectedHourlyCost)}/h
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Fechar
        </Button>
        <Button
          type="submit"
          form="clinic-costs-form"
          isLoading={isSubmitting}
          disabled={isLoading}
        >
          Salvar Novo Período
        </Button>
      </ModalFooter>
    </Modal>
  )
}

ClinicCostsModal.displayName = 'ClinicCostsModal'
