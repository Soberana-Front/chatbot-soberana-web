import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign, Clock, Calendar, CheckCircle2, AlertCircle, History } from 'lucide-react'
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
 * Modal para consulta e edição dos custos vigentes (Issue #31 - FE-018)
 * e histórico de períodos de custos da clínica (Issue #32 - FE-019).
 */
export const ClinicCostsModal: React.FC<ClinicCostsModalProps> = ({
  open,
  onOpenChange,
  clinic,
  onCostsSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [currentCosts, setCurrentCosts] = useState<ClinicCosts | null>(null)
  const [costsHistory, setCostsHistory] = useState<ClinicCosts[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
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
  const fetchCurrentCosts = useCallback(async (clinicId: string) => {
    setIsLoading(true)
    setFeedbackMessage(null)
    try {
      const costs = await clinicService.getCurrentCosts(clinicId)
      setCurrentCosts(costs)
      if (costs) {
        reset({
          sixMonthFixedCost: costs.sixMonthFixedCost,
          sixMonthVariableCost: costs.sixMonthVariableCost,
          effectiveHoursPerMonth: costs.effectiveHoursPerMonth,
        })
      }
    } catch {
      setCurrentCosts(null)
    } finally {
      setIsLoading(false)
    }
  }, [reset])

  // Carrega o histórico de custos (Issue #32 - FE-019)
  const fetchCostsHistory = useCallback(async (clinicId: string) => {
    setIsLoadingHistory(true)
    setHistoryError(null)
    try {
      const history = await clinicService.getCostsHistory(clinicId)
      setCostsHistory(history)
    } catch {
      setCostsHistory([])
      setHistoryError('Não foi possível carregar o histórico de custos.')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    if (!open || !clinic?.id) {
      setCurrentCosts(null)
      setCostsHistory([])
      setHistoryError(null)
      setFeedbackMessage(null)
      setActiveTab('current')
      return
    }

    void fetchCurrentCosts(clinic.id)
  }, [open, clinic, fetchCurrentCosts])

  // Ao alternar para a aba de histórico, busca os períodos anteriores
  useEffect(() => {
    if (activeTab === 'history' && clinic?.id) {
      void fetchCostsHistory(clinic.id)
    }
  }, [activeTab, clinic, fetchCostsHistory])

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
      // Atualiza também o histórico para refletir o novo período
      if (clinic?.id) {
        void fetchCostsHistory(clinic.id)
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
        {/* Navegação entre Abas */}
        <div role="tablist" aria-label="Abas de custos da clínica" className="flex items-center gap-2 border-b border-slate-200 mb-5">
          <button
            type="button"
            role="tab"
            id="tab-current"
            aria-controls="panel-current"
            aria-selected={activeTab === 'current'}
            onClick={() => setActiveTab('current')}
            className={`pb-2.5 px-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'current'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Custo Vigente & Novo Período
          </button>
          <button
            type="button"
            role="tab"
            id="tab-history"
            aria-controls="panel-history"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Períodos
          </button>
        </div>

        {/* ABA 1: CUSTOS VIGENTES E NOVO PERÍODO (Issue #31) */}
        {activeTab === 'current' && (
          <div role="tabpanel" id="panel-current" aria-labelledby="tab-current">
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
          </div>
        )}

        {/* ABA 2: HISTÓRICO DE PERÍODOS DE CUSTOS (Issue #32 - FE-019) */}
        {activeTab === 'history' && (
          <div role="tabpanel" id="panel-history" aria-labelledby="tab-history" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Histórico de Períodos de Custos
                </h4>
                <p className="text-xs text-slate-500">
                  Acompanhe a evolução dos custos operacionais cadastrados para esta clínica.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => clinic?.id && void fetchCostsHistory(clinic.id)}
                disabled={isLoadingHistory}
              >
                Atualizar
              </Button>
            </div>

            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center p-8 gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-slate-500">Carregando histórico de custos...</p>
              </div>
            ) : historyError ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2">
                <p className="text-sm text-rose-800 font-medium">{historyError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => clinic?.id && void fetchCostsHistory(clinic.id)}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : costsHistory.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500">
                  Nenhum período de custo registrado no histórico desta clínica.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Vigência</th>
                      <th className="p-2.5 text-right">Fixo Mensal</th>
                      <th className="p-2.5 text-right">Variável Mensal</th>
                      <th className="p-2.5 text-right">Horas/Mês</th>
                      <th className="p-2.5 text-right">Total Mensal</th>
                      <th className="p-2.5 text-right">Hora Clínica</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {costsHistory.map((item, index) => {
                      const isCurrent = currentCosts?.id === item.id || index === 0
                      const totalMonthly = item.monthlyFixedCost + item.monthlyVariableCost
                      const hourly = item.effectiveHoursPerMonth > 0 ? totalMonthly / item.effectiveHoursPerMonth : 0

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isCurrent ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <td className="p-2.5 font-medium text-slate-800">
                            {new Date(item.effectiveDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-2.5 text-right text-slate-600">
                            {formatCurrency(item.monthlyFixedCost)}
                          </td>
                          <td className="p-2.5 text-right text-slate-600">
                            {formatCurrency(item.monthlyVariableCost)}
                          </td>
                          <td className="p-2.5 text-right text-slate-600">
                            {item.effectiveHoursPerMonth}h
                          </td>
                          <td className="p-2.5 text-right font-medium text-slate-800">
                            {formatCurrency(totalMonthly)}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-emerald-700">
                            {formatCurrency(hourly)}/h
                          </td>
                          <td className="p-2.5 text-center">
                            {isCurrent ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                Vigente
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                Arquivado
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Fechar
        </Button>
        {activeTab === 'current' && (
          <Button
            type="submit"
            form="clinic-costs-form"
            isLoading={isSubmitting}
            disabled={isLoading}
          >
            Salvar Novo Período
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

ClinicCostsModal.displayName = 'ClinicCostsModal'
