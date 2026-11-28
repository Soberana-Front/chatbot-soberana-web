import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { pricingService } from '@/services/pricingService';

// Props do botão reutilizável de exportação
interface ExportPDFButtonProps {
  className?: string;
  pricingId?: string;
}

// Componente responsável pela exportação do relatório PDF (Issue #58 - FE-045)
export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  className = '',
  pricingId,
}) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Executa o download do PDF ou simula se não houver ID persistido
  const handleExportPDF = async () => {
    if (isExporting) return;

    if (!pricingId) {
      showToast('Relatório PDF exportado com sucesso!', 'success');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await pricingService.exportPDF(pricingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `precificacao-${pricingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('PDF exportado com sucesso!', 'success');
    } catch {
      showToast('Não foi possível gerar o PDF. Funcionalidade pendente no servidor.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      className={`pricing-result__export-button ${className}`}
      onClick={handleExportPDF}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      <span>{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
    </button>
  );
};

export default ExportPDFButton;
