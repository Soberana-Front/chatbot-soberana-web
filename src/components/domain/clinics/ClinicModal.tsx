// Importa hooks do React
import { useState, useEffect } from 'react'
// Importa componentes de UI já existentes
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Spinner } from '../../ui/Spinner'
import { ClinicForm } from './ClinicForm'
// Importa tipos e serviços
import type { ClinicSummary } from '../../../hooks/useClinics'
import type { ClinicFormData } from '../../../validations/clinicSchema'
import { clinicService } from '../../../services/clinicService'

// Props da ClinicModal
export interface ClinicModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinic?: ClinicSummary | null                        // presente = modo edição; ausente/null = modo criação
  onSubmit: (data: ClinicFormData) => void | Promise<void>
  isSubmitting?: boolean                                // desabilita os botões durante o envio
}

/**
 * Modal com o ClinicForm dentro, reutilizável para criar ou editar (Issues #29 e #30).
 *
 * No modo edição:
 * Busca os detalhes completos da clínica via GET /clinics/:id (Issue #30)
 * para pré-preencher todos os campos (tipo, fornecedor de materiais, método de pagamento,
 * comissão, aluguel, despesas, observações).
 *
 * Exibe um Spinner de carregamento enquanto os detalhes são buscados do servidor.
 */
export const ClinicModal = ({
  open,
  onOpenChange,
  clinic,
  onSubmit,
  isSubmitting = false,
}: ClinicModalProps) => {
  const isEditMode = Boolean(clinic)
  const formId = 'clinic-form'

  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [fullFormData, setFullFormData] = useState<Partial<ClinicFormData> | undefined>(undefined)

  // Ao abrir em modo edição, busca os dados completos da clínica
  useEffect(() => {
    if (!open) {
      setFullFormData(undefined)
      setDetailsError(null)
      return
    }

    if (!clinic?.id) {
      setFullFormData(undefined)
      setIsLoadingDetails(false)
      return
    }

    let isMounted = true
    setIsLoadingDetails(true)
    setDetailsError(null)

    clinicService
      .getClinic(clinic.id)
      .then((data) => {
        if (!isMounted) return
        setFullFormData({
          name: data.name,
          city: data.city,
          state: data.state,
          address: data.address ?? '',
          clinicType: data.clinicType,
          materialSupplier: data.materialSupplier,
          paymentMethod: data.paymentMethod,
          commissionPercentage:
            data.commissionPercentage !== undefined
              ? data.commissionPercentage * 100
              : undefined,
          rentAmount: data.rentAmount,
          otherExpenses: data.otherExpenses,
          notes: data.notes ?? '',
        })
      })
      .catch(() => {
        if (!isMounted) return
        // Fallback: se falhar, preenche pelo menos com o que temos no resumo
        setDetailsError('Não foi possível carregar os detalhes completos. Preencha os campos abaixo.')
        setFullFormData({
          name: clinic.name,
          city: clinic.city,
          state: clinic.state,
        })
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false)
      })

    return () => {
      isMounted = false
    }
  }, [open, clinic])

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg">
      {/* Título dinâmico */}
      <ModalHeader>
        {isEditMode ? 'Editar Clínica' : 'Nova Clínica'}
      </ModalHeader>

      <ModalBody>
        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Carregando detalhes da clínica...</p>
          </div>
        ) : (
          <>
            {detailsError && (
              <div className="p-3 mb-4 text-xs text-amber-700 bg-amber-50 rounded border border-amber-200">
                {detailsError}
              </div>
            )}
            <ClinicForm
              key={clinic?.id ? `${clinic.id}-${fullFormData?.clinicType ?? 'loaded'}` : 'new'}
              formId={formId}
              defaultValues={fullFormData}
              onSubmit={onSubmit}
            />
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting || isLoadingDetails}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form={formId}
          isLoading={isSubmitting}
          disabled={isLoadingDetails}
        >
          Salvar
        </Button>
      </ModalFooter>
    </Modal>
  )
}

ClinicModal.displayName = 'ClinicModal'
