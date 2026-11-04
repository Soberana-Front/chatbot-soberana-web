// Importa React e o hook para acessar o formulário pai
import { Controller, useFormContext } from 'react-hook-form';
// Importa componentes da UI e ícones
import { Input } from '../ui/Input';
import { FormattedField } from '../ui/FormattedField';
import type { RegisterFormData } from '../../validations/authSchemas';

// Componente com os campos de dados pessoais (Passo 1 do cadastro)
export const PersonalDataSection = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RegisterFormData>();

  return (
    <div className="personal-data-section">
      {/* Campo: Nome Completo */}
      <Input
        label="Nome Completo"
        placeholder="Digite seu nome completo"
        error={errors.name?.message as string | undefined}
        required
        {...register('name')}
      />

      {/* Campo: E-mail */}
      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        error={errors.email?.message as string | undefined}
        required
        {...register('email')}
      />

      {/* Campo: Telefone (com máscara) */}
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <FormattedField kind="phone" label="Telefone" name={field.name} value={field.value} onValueChange={(value) => field.onChange(value ?? '')} onBlur={field.onBlur} error={errors.phone?.message} required />
        )}
      />

      {/* Campo: CPF (com máscara) */}
      <Controller
        control={control}
        name="cpf"
        render={({ field }) => (
          <FormattedField kind="cpf" label="CPF" name={field.name} value={field.value} onValueChange={(value) => field.onChange(value ?? '')} onBlur={field.onBlur} error={errors.cpf?.message} required />
        )}
      />
    </div>
  );
};
