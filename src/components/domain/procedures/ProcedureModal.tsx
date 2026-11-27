// Importa componentes de UI já existentes
import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { ProcedureForm } from './ProcedureForm'
import { clinicService } from '../../../services/clinicService'
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
 * Modal com o ProcedureForm dentro, reutilizável para criar ou editar (Issue #34 - FE-021).
 */
export const ProcedureModal = ({
  open,
  onOpenChange,
  procedure,
  onSubmit,
  isSubmitting = false,
}: ProcedureModalProps) => {
  const [clinicOptions, setClinicOptions] = useState<Array<{ value: string; label: string }>>([])
  const isEditMode = Boolean(procedure)
  const formId = 'procedure-form'

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

  const handleCancel = () => {
    onOpenChange(false)
  }

  // Monta os valores iniciais do formulário a partir do procedimento (modo edição)
  const defaultValues = procedure
    ? {
        clinicId: procedure.clinicId ?? undefined,
        name: procedure.name,
        category: procedure.category as ProcedureFormData['category'],
        time: procedure.time,
        description: procedure.description,
      }
    : undefined

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg">
      {/* Título dinâmico: "Novo Procedimento" ou "Editar Procedimento" */}
      <ModalHeader className="px-6 pt-6">
        {isEditMode ? 'Editar Procedimento' : 'Novo Procedimento'}
      </ModalHeader>

      <ModalBody className="px-6">
        {/* A key força o formulário a remontar ao trocar de procedimento
            ou ao alternar entre criar/editar, garantindo defaultValues corretos */}
        <ProcedureForm
          key={procedure?.id ?? 'new'}
          formId={formId}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          clinicOptions={clinicOptions}
        />
      </ModalBody>

      <ModalFooter className="px-6 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form={formId}
          isLoading={isSubmitting}
        >
          Salvar
        </Button>
      </ModalFooter>
    </Modal>
  )
}

ProcedureModal.displayName = 'ProcedureModal'