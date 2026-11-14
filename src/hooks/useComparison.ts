import { useState, useCallback, useEffect } from 'react';
import {
  comparisonService,
  type ComparisonClinic,
  type ComparisonProcedure,
  type CurrentClinicCosts,
  type ClinicPricingDefaults,
} from '../services/comparisonService';

export type Clinic = ComparisonClinic;
export type Procedure = ComparisonProcedure;

export interface ComparisonClinicResult {
  clinic: ComparisonClinic;
  costs: CurrentClinicCosts;
  pricing: ClinicPricingDefaults;
}

export interface ComparisonResult {
  clinicA: ComparisonClinicResult;
  clinicB: ComparisonClinicResult;
  procedure: ComparisonProcedure;
}

export const useComparison = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [clinicA, setClinicA] = useState<Clinic | null>(null);
  const [clinicB, setClinicB] = useState<Clinic | null>(null);
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setError(null);

      try {
        const [clinicsData, proceduresData] = await Promise.all([
          comparisonService.listClinics(),
          comparisonService.listProcedures(),
        ]);

        if (!isMounted) return;

        setClinics(clinicsData);
        setProcedures(proceduresData);
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar clínicas e procedimentos.',
        );
      } finally {
        if (isMounted) setIsLoadingOptions(false);
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const compare = useCallback(
    async (
      clinicAId: string,
      clinicBId: string,
      procedureId: string,
    ): Promise<ComparisonResult> => {
      setIsLoading(true);
      setError(null);
      setComparisonResult(null);

      try {
        if (clinicAId === clinicBId) {
          throw new Error('As clínicas selecionadas devem ser diferentes.');
        }

        const foundClinicA = clinics.find((clinic) => clinic.id === clinicAId);
        const foundClinicB = clinics.find((clinic) => clinic.id === clinicBId);
        const foundProcedure = procedures.find((item) => item.id === procedureId);

        if (!foundClinicA || !foundClinicB || !foundProcedure) {
          throw new Error(
            'Clínica ou procedimento não encontrado. Atualize a página e tente novamente.',
          );
        }

        const [costsA, pricingA, costsB, pricingB] = await Promise.all([
          comparisonService.getCurrentCosts(clinicAId),
          comparisonService.getPricingDefaults(clinicAId),
          comparisonService.getCurrentCosts(clinicBId),
          comparisonService.getPricingDefaults(clinicBId),
        ]);

        const result: ComparisonResult = {
          clinicA: {
            clinic: foundClinicA,
            costs: costsA,
            pricing: pricingA,
          },
          clinicB: {
            clinic: foundClinicB,
            costs: costsB,
            pricing: pricingB,
          },
          procedure: foundProcedure,
        };

        setClinicA(foundClinicA);
        setClinicB(foundClinicB);
        setProcedure(foundProcedure);
        setComparisonResult(result);

        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Erro ao comparar clínicas. Tente novamente.';

        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clinics, procedures],
  );

  const reset = useCallback(() => {
    setClinicA(null);
    setClinicB(null);
    setProcedure(null);
    setComparisonResult(null);
    setError(null);
  }, []);

  return {
    clinics,
    procedures,
    clinicA,
    clinicB,
    procedure,
    comparisonResult,
    isLoading,
    isLoadingOptions,
    error,
    compare,
    reset,
  };
};
