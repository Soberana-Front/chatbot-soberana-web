import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportPDFButton from '../src/components/dashboard/ExportPDFButton/ExportPDFButton';
import { pricingService } from '../src/services/pricingService';

const mockShowToast = vi.fn();

vi.mock('../src/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock('../src/services/pricingService', () => ({
  pricingService: {
    exportPDF: vi.fn(),
  },
}));

describe('ExportPDFButton (Issue #58 - FE-045)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exporta PDF em modo mock quando não há pricingId', () => {
    render(<ExportPDFButton />);

    const button = screen.getByRole('button', { name: /exportar pdf/i });
    fireEvent.click(button);

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining('PDF exportado com sucesso'),
      'success',
    );
  });

  it('chama pricingService.exportPDF quando pricingId é fornecido', async () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
    vi.mocked(pricingService.exportPDF).mockResolvedValueOnce(mockBlob);

    // Mock createObjectURL e revokeObjectURL
    window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/teste');
    window.URL.revokeObjectURL = vi.fn();

    render(<ExportPDFButton pricingId="precificacao-123" />);

    const button = screen.getByRole('button', { name: /exportar pdf/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(pricingService.exportPDF).toHaveBeenCalledWith('precificacao-123');
      expect(mockShowToast).toHaveBeenCalledWith('PDF exportado com sucesso!', 'success');
    });
  });

  it('exibe mensagem de erro apropriada quando o endpoint falha', async () => {
    vi.mocked(pricingService.exportPDF).mockRejectedValueOnce(new Error('Network error'));

    render(<ExportPDFButton pricingId="precificacao-123" />);

    const button = screen.getByRole('button', { name: /exportar pdf/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Não foi possível gerar o PDF. Funcionalidade pendente no servidor.',
        'error',
      );
    });
  });
});
