import { useFormContext } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import {
  CURRENCY_OPTIONS,
  PERCENT_MIN,
  PERCENT_MAX,
} from '../../validations/settingsSchema';
import type { RegisterFormData } from '../../validations/authSchemas';

// Componente com os campos de configurações iniciais (Passo 2 do cadastro)
export const InitialSettingsSection = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RegisterFormData>();

  const settingsValues = watch('settings');
  const settingsErrors = errors.settings;

  const percentSuffix = (
    <span className="text-sm font-medium text-muted-foreground" aria-hidden="true">
      %
    </span>
  );

  return (
    <div className="initial-settings-section space-y-4">
      <Select
        label="Moeda utilizada"
        options={CURRENCY_OPTIONS.map((option) => ({ ...option }))}
        error={settingsErrors?.currency?.message}
        required
        {...register('settings.currency')}
      />

      <Input
        label="Margem de lucro padrão (%)"
        type="number"
        step="0.01"
        min={PERCENT_MIN}
        max={PERCENT_MAX}
        defaultValue={String(settingsValues?.profitMargin ?? 30)}
        rightIcon={percentSuffix}
        error={settingsErrors?.profitMargin?.message}
        required
        {...register('settings.profitMargin', { valueAsNumber: true })}
      />

      <Input
        label="Alíquota padrão de impostos (%)"
        type="number"
        step="0.01"
        min={PERCENT_MIN}
        max={PERCENT_MAX}
        defaultValue={String(settingsValues?.taxRate ?? 15)}
        rightIcon={percentSuffix}
        error={settingsErrors?.taxRate?.message}
        required
        {...register('settings.taxRate', { valueAsNumber: true })}
      />

      <Input
        label="Taxa padrão de cartão (%)"
        type="number"
        step="0.01"
        min={PERCENT_MIN}
        max={PERCENT_MAX}
        defaultValue={String(settingsValues?.cardFee ?? 2)}
        rightIcon={percentSuffix}
        error={settingsErrors?.cardFee?.message}
        required
        {...register('settings.cardFee', { valueAsNumber: true })}
      />
    </div>
  );
};
