import { DashboardLayout } from "../../components/dashboard/DashboardLayout/DashboardLayout";
import { ComparisonSelector } from "../../components/dashboard/ComparisonSelector/ComparisonSelector";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useComparison } from "../../hooks/useComparison";
import { GitCompare } from "lucide-react";
import type { ComparisonResult } from "../../hooks/useComparison";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatNumber = (value: number) => numberFormatter.format(value);

const formatDifference = (value: number, format: "currency" | "number" | "percent") => {
  const sign = value > 0 ? "+" : "";

  if (format === "currency") {
    return `${sign}${formatCurrency(value)}`;
  }

  if (format === "percent") {
    return `${sign}${formatNumber(value)} p.p.`;
  }

  return `${sign}${formatNumber(value)}`;
};

const paymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    COMMISSION: "Comissão",
    MONTHLY_RENT: "Aluguel mensal",
    FIXED_VALUE: "Valor fixo",
  };

  return labels[method] || method;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
};

interface ComparisonResultsProps {
  result: ComparisonResult;
}

const ComparisonResults = ({ result }: ComparisonResultsProps) => {
  const { clinicA, clinicB, procedure } = result;

  const metrics = [
    {
      label: "Custos fixos mensais",
      valueA: clinicA.costs.monthlyFixedCost,
      valueB: clinicB.costs.monthlyFixedCost,
      format: "currency" as const,
    },
    {
      label: "Custos variáveis mensais",
      valueA: clinicA.costs.monthlyVariableCost,
      valueB: clinicB.costs.monthlyVariableCost,
      format: "currency" as const,
    },
    {
      label: "Horas efetivas por mês",
      valueA: clinicA.costs.effectiveHoursPerMonth,
      valueB: clinicB.costs.effectiveHoursPerMonth,
      format: "number" as const,
    },
    {
      label: "Custo fixo comercial configurado",
      valueA: clinicA.pricing.fixedCost,
      valueB: clinicB.pricing.fixedCost,
      format: "currency" as const,
    },
    {
      label: "Comissão configurada",
      valueA: clinicA.pricing.commission,
      valueB: clinicB.pricing.commission,
      format: "percent" as const,
    },
    {
      label: "Materiais padrão",
      valueA: clinicA.pricing.defaultMaterialsCost,
      valueB: clinicB.pricing.defaultMaterialsCost,
      format: "currency" as const,
    },
  ];

  const formatValue = (
    value: number | undefined,
    format: "currency" | "number" | "percent",
  ) => {
    if (value === undefined || value === null) {
      return "Não informado";
    }

    if (format === "currency") {
      return formatCurrency(value);
    }

    if (format === "percent") {
      return `${formatNumber(value)}%`;
    }

    return formatNumber(value);
  };

  return (
    <div className="comparison-page-results">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Clínica A
          </p>
          <h3 className="text-lg font-bold text-slate-900">
            {clinicA.clinic.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {clinicA.clinic.city} - {clinicA.clinic.state}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Procedimento selecionado
          </p>
          <h3 className="text-lg font-bold text-slate-900">
            {procedure.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {procedure.category || "Categoria não informada"}
            {procedure.averageTime !== undefined
              ? ` • ${procedure.averageTime} min`
              : ""}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Clínica B
          </p>
          <h3 className="text-lg font-bold text-slate-900">
            {clinicB.clinic.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {clinicB.clinic.city} - {clinicB.clinic.state}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Comparativo de custos e configurações
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Valores retornados pela API para cada clínica. A diferença representa
          o valor da Clínica B menos o valor da Clínica A.
        </p>

        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr className="comparison-table-head-row">
                <th className="comparison-table-th">Parâmetro</th>
                <th className="comparison-table-th">{clinicA.clinic.name}</th>
                <th className="comparison-table-th">{clinicB.clinic.name}</th>
                <th className="comparison-table-th">Diferença</th>
              </tr>
            </thead>

            <tbody>
              {metrics.map((metric, index) => {
                const hasBothValues =
                  metric.valueA !== undefined &&
                  metric.valueA !== null &&
                  metric.valueB !== undefined &&
                  metric.valueB !== null;

                const difference = hasBothValues
                  ? metric.valueB! - metric.valueA!
                  : null;

                const diffColor =
                  difference === null || difference === 0
                    ? "comparison-table-diff-neutral"
                    : difference > 0
                      ? "comparison-table-diff-positive"
                      : "comparison-table-diff-negative";

                return (
                  <tr
                    key={metric.label}
                    className={`comparison-table-row ${
                      index % 2 === 1 ? "comparison-table-row-alt" : ""
                    }`}
                  >
                    <td className="comparison-table-td comparison-table-td-label">
                      {metric.label}
                    </td>
                    <td className="comparison-table-td">
                      {formatValue(metric.valueA, metric.format)}
                    </td>
                    <td className="comparison-table-td">
                      {formatValue(metric.valueB, metric.format)}
                    </td>
                    <td className={`comparison-table-td ${diffColor}`}>
                      {difference === null
                        ? "—"
                        : formatDifference(difference, metric.format)}
                    </td>
                  </tr>
                );
              })}

              <tr className="comparison-table-row">
                <td className="comparison-table-td comparison-table-td-label">
                  Método de cobrança
                </td>
                <td className="comparison-table-td">
                  {paymentMethodLabel(clinicA.pricing.paymentMethod)}
                </td>
                <td className="comparison-table-td">
                  {paymentMethodLabel(clinicB.pricing.paymentMethod)}
                </td>
                <td className="comparison-table-td comparison-table-diff-neutral">
                  —
                </td>
              </tr>

              <tr className="comparison-table-row">
                <td className="comparison-table-td comparison-table-td-label">
                  Data de referência dos custos
                </td>
                <td className="comparison-table-td">
                  {formatDate(clinicA.costs.effectiveDate)}
                </td>
                <td className="comparison-table-td">
                  {formatDate(clinicB.costs.effectiveDate)}
                </td>
                <td className="comparison-table-td comparison-table-diff-neutral">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Os valores apresentados são dados de configuração e custos da clínica.
          Não representam preço final, lucro ou margem calculados para o
          procedimento.
        </p>
      </div>
    </div>
  );
};

const ComparisonPage = () => {
  const {
    clinics,
    procedures,
    isLoading,
    isLoadingOptions,
    error,
    comparisonResult,
    compare,
  } = useComparison();

  const handleCompare = (data: {
    clinicAId: string;
    clinicBId: string;
    procedureId: string;
  }) => {
    void compare(
      data.clinicAId,
      data.clinicBId,
      data.procedureId,
    ).catch(() => undefined);
  };

  const isLoadingPage = isLoadingOptions;

  return (
    <DashboardLayout>
      <div className="comparison-page-container">
        <div className="comparison-page-header">
          <div className="flex items-center gap-3">
            <div className="comparison-page-icon">
              <GitCompare className="w-6 h-6" />
            </div>

            <div>
              <h1 className="comparison-page-title">Comparar Clínicas</h1>
              <p className="comparison-page-subtitle">
                Compare custos e configurações de duas clínicas para o mesmo
                procedimento.
              </p>
            </div>
          </div>
        </div>

        {isLoadingPage && (
          <div className="comparison-page-loading">
            <Spinner
              size="lg"
              label="Carregando clínicas e procedimentos..."
              labelPosition="bottom"
            />
          </div>
        )}

        {!isLoadingPage && clinics.length > 0 && procedures.length > 0 && (
          <ComparisonSelector
            clinics={clinics}
            procedures={procedures}
            onCompare={handleCompare}
            isLoading={isLoading}
          />
        )}

        {!isLoadingPage &&
          (clinics.length === 0 || procedures.length === 0) &&
          !error && (
            <div className="comparison-page-error">
              Não há clínicas ou procedimentos disponíveis para comparação.
            </div>
          )}

        {error && (
          <div className="comparison-page-error" role="alert">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="comparison-page-loading">
            <Spinner
              size="lg"
              label="Consultando os dados das clínicas..."
              labelPosition="bottom"
            />
          </div>
        )}

        {!isLoading && comparisonResult && (
          <ComparisonResults result={comparisonResult} />
        )}

        {!isLoading &&
          !comparisonResult &&
          !error &&
          !isLoadingOptions && (
            <EmptyState
              icon={GitCompare}
              title="Nenhuma comparação realizada"
              subtitle="Selecione duas clínicas e um procedimento para consultar os dados disponíveis."
            />
          )}
      </div>
    </DashboardLayout>
  );
};

export default ComparisonPage;
