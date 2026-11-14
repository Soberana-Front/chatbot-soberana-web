
import { api } from './api';
import type { UserSettings, UpdateSettingsPayload } from '../types/settings';

export const settingsService = {
  // GET /settings — busca as configurações do usuário logado
  getSettings: async (): Promise<UserSettings> => {
    try {
      const response = await api.get<UserSettings>('/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT /settings — atualiza as configurações do usuário logado
  updateSettings: async (data: UpdateSettingsPayload): Promise<UserSettings> => {
    try {
      const response = await api.put<UserSettings>('/settings', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default settingsService;
