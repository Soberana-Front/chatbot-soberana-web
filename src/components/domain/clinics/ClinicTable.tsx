// Importa ícones de ação
import { Pencil, Trash2 } from 'lucide-react'
// Importa o tipo de resumo de clínica (GET /clinics retorna só id, name, city, state)
import type { ClinicSummary } from '../../../hooks/useClinics'
import { EmptyState } from '../../ui/EmptyState'

// Props do componente ClinicTable
export interface ClinicTableProps {
  clinics: ClinicSummary[]                    // Lista de clínicas já filtrada/paginada (vem do useClinics)
  isLoading?: boolean                          // Exibe estado de carregamento
  onEdit: (clinic: ClinicSummary) => void     // Chamado ao clicar no ícone de editar
  onDelete: (clinic: ClinicSummary) => void   // Chamado ao clicar no ícone de excluir
}

/**
 * Tabela de clínicas com ações de editar/excluir.
 * Usa ClinicSummary (listagem resumida: id, name, city, state)
 * conforme o contrato real do GET /clinics.
 */
export const ClinicTable = ({
  clinics,
  isLoading = false,
  onEdit,
  onDelete,
}: ClinicTableProps) => {
  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="clinic-table-wrapper">
        <div className="clinic-table-status">Carregando clínicas...</div>
      </div>
    )
  }

  // Lista vazia
  if (clinics.length === 0) {
    return (
      <div className="clinic-table-wrapper">
        <EmptyState
          title="Nenhuma clínica encontrada"
          subtitle="Comece cadastrando uma nova clínica"
        />
      </div>
    )
  }

  return (
    <div className="clinic-table-wrapper">
      <table className="clinic-table">
        {/* Cabeçalho — colunas disponíveis na listagem resumida do backend */}
        <thead className="clinic-table-head">
          <tr>
            <th className="clinic-table-th">Nome</th>
            <th className="clinic-table-th">Cidade</th>
            <th className="clinic-table-th">Estado</th>
            <th className="clinic-table-th clinic-table-th-center">Ações</th>
          </tr>
        </thead>

        <tbody className="clinic-table-body">
          {clinics.map((clinic) => (
            <tr key={clinic.id} className="clinic-table-row">
              <td className="clinic-table-td clinic-table-td-name">{clinic.name}</td>
              <td className="clinic-table-td">{clinic.city}</td>
              <td className="clinic-table-td">{clinic.state}</td>

              {/* Ações: editar (lápis) e excluir (lixeira) */}
              <td className="clinic-table-td clinic-table-td-center">
                <div className="clinic-table-actions">
                  <button
                    type="button"
                    onClick={() => onEdit(clinic)}
                    className="clinic-table-action-btn clinic-table-action-edit"
                    aria-label={`Editar ${clinic.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(clinic)}
                    className="clinic-table-action-btn clinic-table-action-delete"
                    aria-label={`Excluir ${clinic.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

ClinicTable.displayName = 'ClinicTable'
