// Importa componentes de UI já existentes
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { ClinicForm } from './ClinicForm'
// Importa tipos necessários
import type { ClinicSummary } from '../../../hooks/useClinics'
import type { ClinicFormData } from '../../../validations/clinicSchema'

// Props da ClinicModal
export interface ClinicModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinic?: ClinicSummary | null                        // presente = modo edição; ausente/null = modo criação
  onSubmit: (data: ClinicFormData) => void | Promise<void>
  isSubmitting?: boolean                                // desabilita os botões durante o envio
}

/**
 * Modal com o ClinicForm dentro, reutilizável para criar ou editar.
 *
 * No modo edição, recebe um ClinicSummary (listagem) com id, name, city, state.
 * Para editar os campos completos (clinicType, paymentMethod, etc.),
 * o ClinicForm abre com os campos vazios para o usuário preencher,
 * pois a listagem resumida não inclui esses dados.
 *
 * O botão "Salvar" fica no rodapé (ModalFooter), fora da tag <form>, e
 * dispara o submit através do atributo form={formId}.
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

  const handleCancel = () => {
    onOpenChange(false)
  }

  // No modo edição: pré-preenche apenas os campos disponíveis no resumo
  const defaultValues: Partial<ClinicFormData> | undefined = clinic
    ? {
        name: clinic.name,
        city: clinic.city,
        state: clinic.state,
      }
    : undefined

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg">
      {/* Título dinâmico */}
      <ModalHeader>
        {isEditMode ? 'Editar Clínica' : 'Nova Clínica'}
      </ModalHeader>

      <ModalBody>
        {/* A key força o formulário a remontar ao trocar de clínica */}
        <ClinicForm
          key={clinic?.id ?? 'new'}
          formId={formId}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
      </ModalBody>

      <ModalFooter>
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

ClinicModal.displayName = 'ClinicModal'
