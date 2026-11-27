// Importa hooks do react-hook-form e resolver do Zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// Importa componentes de UI já existentes
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
// Importa schema, tipos e listas de opções alinhadas com o backend
import {
  clinicSchema,
  BRAZILIAN_STATES,
  CLINIC_TYPES,
  CLINIC_TYPE_LABELS,
  MATERIAL_SUPPLIER_OPTIONS,
  MATERIAL_SUPPLIER_LABELS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_LABELS,
  type ClinicFormData,
} from '../../../validations/clinicSchema'

// Props do ClinicForm
export interface ClinicFormProps {
  formId?: string                              // id do <form>, usado pelo botão de submit no ModalFooter
  defaultValues?: Partial<ClinicFormData>       // valores iniciais (modo edição)
  onSubmit: (data: ClinicFormData) => void      // chamado com os dados já validados
}

// Opções de Estado geradas a partir da lista de UFs
const stateOptions = BRAZILIAN_STATES.map((uf) => ({ value: uf, label: uf }))

// Opções de Tipo de Clínica alinhadas com o backend (OWN | OUTSOURCED)
const clinicTypeOptions = CLINIC_TYPES.map((type) => ({
  value: type,
  label: CLINIC_TYPE_LABELS[type] ?? type,
}))

// Opções de Fornecedor de Materiais
const materialSupplierOptions = MATERIAL_SUPPLIER_OPTIONS.map((supplier) => ({
  value: supplier,
  label: MATERIAL_SUPPLIER_LABELS[supplier] ?? supplier,
}))

// Opções de Método de Pagamento
const paymentMethodOptions = PAYMENT_METHOD_OPTIONS.map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method] ?? method,
}))

/**
 * Formulário com os campos de uma clínica.
 * Alinhado com o contrato real do backend (Clinic_Create).
 *
 * Campos alterados em relação à versão anterior:
 * - `type` → `clinicType` (enum OWN | OUTSOURCED)
 * - `commission` → `commissionPercentage` (0-100%)
 * - `rent` → `rentAmount` (number, R$)
 * - `costs` → `otherExpenses` (number, R$)
 * - Adicionados: `materialSupplier`, `paymentMethod`, `notes`
 *
 * Não tem botões próprios — o ClinicModal dispara o submit via form={formId}.
 */
export const ClinicForm = ({
  formId = 'clinic-form',
  defaultValues,
  onSubmit,
}: ClinicFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues,
  })

  // Observa o método de pagamento para mostrar/ocultar o campo de comissão
  const paymentMethod = watch('paymentMethod')

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="clinic-form">
      {/* Nome */}
      <Input
        label="Nome"
        placeholder="Nome da clínica"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Cidade e Estado lado a lado */}
      <div className="clinic-form-row">
        <Input
          label="Cidade"
          placeholder="Cidade"
          error={errors.city?.message}
          required
          {...register('city')}
        />
        <Select
          label="Estado"
          placeholder="UF"
          options={stateOptions}
          error={errors.state?.message}
          required
          {...register('state')}
        />
      </div>

      {/* Endereço (opcional) */}
      <Input
        label="Endereço"
        placeholder="Rua, número, bairro (opcional)"
        error={errors.address?.message}
        optional
        {...register('address')}
      />

      {/* Tipo da Clínica e Fornecedor de Materiais lado a lado */}
      <div className="clinic-form-row">
        <Select
          label="Tipo da Clínica"
          placeholder="Selecione"
          options={clinicTypeOptions}
          error={errors.clinicType?.message}
          required
          {...register('clinicType')}
        />
        <Select
          label="Materiais"
          placeholder="Quem fornece"
          options={materialSupplierOptions}
          error={errors.materialSupplier?.message}
          required
          {...register('materialSupplier')}
        />
      </div>

      {/* Método de Pagamento */}
      <Select
        label="Método de Pagamento"
        placeholder="Selecione o método"
        options={paymentMethodOptions}
        error={errors.paymentMethod?.message}
        required
        {...register('paymentMethod')}
      />

      {/* Comissão — só aparece quando o método for COMMISSION */}
      {paymentMethod === 'COMMISSION' && (
        <Input
          label="Comissão (%)"
          type="number"
          placeholder="0"
          step="0.01"
          min={0}
          max={100}
          rightIcon={<span className="clinic-form-suffix">%</span>}
          error={errors.commissionPercentage?.message}
          required
          {...register('commissionPercentage', { valueAsNumber: true })}
        />
      )}

      {/* Aluguel — só aparece quando o método for MONTHLY_RENT */}
      {paymentMethod === 'MONTHLY_RENT' && (
        <Input
          label="Valor do Aluguel (R$)"
          type="number"
          placeholder="0.00"
          step="0.01"
          min={0}
          error={errors.rentAmount?.message}
          required
          {...register('rentAmount', { valueAsNumber: true })}
        />
      )}

      {/* Outras Despesas */}
      <Input
        label="Outras Despesas (R$)"
        type="number"
        placeholder="0.00"
        step="0.01"
        min={0}
        error={errors.otherExpenses?.message}
        optional
        {...register('otherExpenses', { valueAsNumber: true })}
      />

      {/* Observações (opcional) */}
      <Input
        label="Observações"
        placeholder="Informações adicionais (opcional)"
        error={errors.notes?.message}
        optional
        {...register('notes')}
      />
    </form>
  )
}

ClinicForm.displayName = 'ClinicForm'
