
export interface UserSettings {
  currency: string;
  profitMargin: number;
  taxRate: number;
  cardFee: number;
  averageServiceTime: number;
}

// Configurações enviadas no cadastro inicial.
export type RegisterSettings = Pick<
  UserSettings,
  'currency' | 'profitMargin' | 'taxRate' | 'cardFee'
>;

// O PUT de configurações utiliza o objeto completo.
export type UpdateSettingsPayload = UserSettings;
