
import { api } from './api';

export interface ComparisonClinic {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface ComparisonProcedure {
  id: string;
  clinicId: string | null;
  name: string;
  category: string | null;
  averageTime?: number;
  description?: string;
}

export interface CurrentClinicCosts {
  id: string;
  clinicId: string;
  sixMonthFixedCost: number;
  sixMonthVariableCost: number;
  monthlyFixedCost: number;
  monthlyVariableCost: number;
  effectiveHoursPerMonth: number;
  effectiveDate: string;
}

export interface ClinicPricingDefaults {
  clinicId: string;
  paymentMethod: 'COMMISSION' | 'MONTHLY_RENT' | 'FIXED_VALUE';
  fixedCost: number;
  commission: number;
  defaultMaterialsCost?: number;
}

interface ApiResponse<T> {
  status: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export const comparisonService = {
  async listClinics(): Promise<ComparisonClinic[]> {
    const response = await api.get<ApiResponse<ComparisonClinic[]>>(
      '/clinics',
      { params: { search: '' } },
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Não foi possível carregar as clínicas.');
    }

    return response.data.data;
  },

  async listProcedures(): Promise<ComparisonProcedure[]> {
    const response = await api.get<ApiResponse<ComparisonProcedure[]>>(
      '/procedures',
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Não foi possível carregar os procedimentos.');
    }

    return response.data.data;
  },

  async getCurrentCosts(clinicId: string): Promise<CurrentClinicCosts> {
    const response = await api.get<ApiResponse<CurrentClinicCosts>>(
      `/clinics/${encodeURIComponent(clinicId)}/costs/current`,
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Não foi possível carregar os custos da clínica.');
    }

    return response.data.data;
  },

  async getPricingDefaults(clinicId: string): Promise<ClinicPricingDefaults> {
    const response = await api.get<ApiResponse<ClinicPricingDefaults>>(
      `/clinics/${encodeURIComponent(clinicId)}/pricing-defaults`,
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Não foi possível carregar os parâmetros comerciais.');
    }

    return response.data.data;
  },
};

export default comparisonService;
