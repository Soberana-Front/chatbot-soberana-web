// Importa componentes de UI já existentes
import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Spinner } from '../../ui/Spinner'
import { ProcedureForm } from './ProcedureForm'
import { clinicService } from '../../../services/clinicService'
import { procedureService } from '../../../services/procedureService'
// Importa tipos
import type { Procedure } from '../../../services/procedureService'
import type { ProcedureFormData } from '../../../validations/procedureSchema'

// Props da ProcedureModal
export interface ProcedureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  procedure?: Procedure | null  // presente = modo edição; ausente/null = modo criação
  onSubmit: (data: ProcedureFormData) => void | Promise<void>
  isSubmitting?: boolean
}

/**
 * Modal com o ProcedureForm dentro, reutilizável para criar ou editar (Issues #34 e #35).
 *
 * No modo edição (Issue #35 - FE-022):
 * - Consulta os detalhes atualizados do procedimento via GET /procedures/:id
 * - Exibe indicador de loading (Spinner) durante a busca
 * - Trata erros de carregamento com fallback amigável
 * - Permite salvar alterações via PATCH /procedures/:id
 */
export const ProcedureModal = ({
  open,
  onOpenChange,
  procedure,
  onSubmit,
  isSubmitting = false,
}: ProcedureModalProps) => {
  const [clinicOptions, setClinicOptions] = useState<Array<{ value: string; label: string }>>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [fullFormData, setFullFormData] = useState<Partial<ProcedureFormData> | undefined>(undefined)

  const isEditMode = Boolean(procedure)
  const formId = 'procedure-form'

  // Carrega opções de clínicas quando a modal abre
  useEffect(() => {
    if (open) {
      clinicService
        .getClinics()
        .then((clinics) => {
          setClinicOptions(clinics.map((c) => ({ value: c.id, label: c.name })))
        })
        .catch(() => {
          setClinicOptions([])
        })
    }
  }, [open])

  // Busca detalhes completos do procedimento quando aberto em modo edição (Issue #35)
  useEffect(() => {
    if (!open) {
      setFullFormData(undefined)
      setDetailsError(null)
      setIsLoadingDetails(false)
      return
    }

    if (!procedure?.id) {
      setFullFormData(undefined)
      setIsLoadingDetails(false)
      return
    }

    let isMounted = true
    setIsLoadingDetails(true)
    setDetailsError(null)

    procedureService
      .getProcedure(procedure.id)
      .then((data) => {
        if (!isMounted) return
        setFullFormData({
          clinicId: data.clinicId ?? undefined,
          name: data.name,
          category: data.category as ProcedureFormData['category'],
          time: data.time || (data.averageTime ?? 0),
          description: data.description ?? '',
        })
      })
      .catch(() => {
        if (!isMounted) return
        setDetailsError('Não foi possível carregar os detalhes do procedimento. Você pode editar os dados locais.')
        setFullFormData({
          clinicId: procedure.clinicId ?? undefined,
          name: procedure.name,
          category: procedure.category as ProcedureFormData['category'],
          time: procedure.time,
          description: procedure.description ?? '',
        })
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false)
      })

    return () => {
      isMounted = false
    }
  }, [open, procedure])

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg">
      {/* Título dinâmico: "Novo Procedimento" ou "Editar Procedimento" */}
      <ModalHeader className="px-6 pt-6">
        {isEditMode ? 'Editar Procedimento' : 'Novo Procedimento'}
      </ModalHeader>

      <ModalBody className="px-6">
        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Carregando detalhes do procedimento...</p>
          </div>
        ) : (
          <>
            {detailsError && (
              <div className="p-3 mb-4 text-xs text-amber-700 bg-amber-50 rounded border border-amber-200">
                {detailsError}
              </div>
            )}
            <ProcedureForm
              key={procedure?.id ? `${procedure.id}-${fullFormData?.name ?? 'loaded'}` : 'new'}
              formId={formId}
              defaultValues={fullFormData}
              onSubmit={onSubmit}
              clinicOptions={clinicOptions}
            />
          </>
        )}
      </ModalBody>

      <ModalFooter className="px-6 pb-6">
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

ProcedureModal.displayName = 'ProcedureModal'

ProcedureModal.displayName = 'ProcedureModal'