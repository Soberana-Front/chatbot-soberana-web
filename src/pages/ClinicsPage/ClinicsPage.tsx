// Importa hooks do React e ícone
import { useState } from 'react'
import { Plus } from 'lucide-react'
// Importa layout do dashboard e componentes de UI já criados
import { DashboardLayout } from '../../components/dashboard/DashboardLayout/DashboardLayout'
import { SearchBar } from '../../components/ui/SearchBar'
import { Pagination } from '../../components/ui/Pagination'
import { ClinicTable } from '../../components/domain/clinics/ClinicTable'
import { ClinicModal } from '../../components/domain/clinics/ClinicModal'
import { ClinicCostsModal } from '../../components/domain/clinics/ClinicCostsModal'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/AsyncStates'
import { DeleteConfirmation } from '../../components/ui/DeleteConfirmation'
// Importa o hook de estado de clínicas
import { useClinics } from '../../hooks/useClinics'
import type { ClinicSummary } from '../../hooks/useClinics'
import type { ClinicFormData } from '../../validations/clinicSchema'

/**
 * Página de listagem de Clínicas.
 *
 * Integração real com o backend via GET /clinics (listagem resumida),
 * POST /clinics (criação), PATCH /clinics/:id (edição) e DELETE /clinics/:id.
 * Alinhada com o contrato real do backend (issues #28, #29, #30).
 */
export const ClinicsPage = () => {
  const {
    clinics,
    isLoading,
    error,
    pagination,
    search,
    filterClinics,
    goToPage,
    createClinic,
    updateClinic,
    deleteClinic,
  } = useClinics()

  // Controla se a modal está aberta e qual clínica está sendo editada
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClinic, setEditingClinic] = useState<ClinicSummary | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Controla a modal de custos operacionais (Issue #31 - FE-018)
  const [costsClinic, setCostsClinic] = useState<ClinicSummary | null>(null)

  // Abre a modal de custos
  const handleOpenCostsModal = (clinic: ClinicSummary) => {
    setCostsClinic(clinic)
  }

  // Abre a modal em modo criação (botão "Cadastrar")
  const handleOpenCreateModal = () => {
    setEditingClinic(null)
    setIsModalOpen(true)
  }

  // Abre a modal em modo edição (ícone de lápis na tabela)
  const handleOpenEditModal = (clinic: ClinicSummary) => {
    setEditingClinic(clinic)
    setIsModalOpen(true)
  }

  // Submissão do formulário: decide entre criar ou editar, e fecha a modal ao final
  const handleSubmit = async (data: ClinicFormData) => {
    setIsSubmitting(true)
    try {
      if (editingClinic) {
        await updateClinic(editingClinic.id, data)
      } else {
        await createClinic(data)
      }
      setIsModalOpen(false)
    } catch {
      // useClinics já guarda a mensagem amigável em `error`, exibida logo abaixo da busca
    } finally {
      setIsSubmitting(false)
    }
  }

  // Controla a modal de confirmação de exclusão
  const [deletingClinic, setDeletingClinic] = useState<ClinicSummary | null>(null)

  const handleDeleteClick = (clinic: ClinicSummary) => {
    setDeletingClinic(clinic)
  }

  const handleConfirmDelete = async () => {
    if (!deletingClinic) return
    await deleteClinic(deletingClinic.id)
  }

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        {/* Cabeçalho da página com título e botão Cadastrar */}
        <div className="clinics-page-header">
          <div>
            <h1 className="dashboard-header-title">Clínicas</h1>
            <p className="dashboard-header-subtitle">Gerencie as clínicas cadastradas</p>
          </div>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4" />
            Cadastrar
          </Button>
        </div>

        {/* Barra de pesquisa (filtro local) */}
        <div className="clinics-page-toolbar">
          <SearchBar
            value={search}
            onSearch={filterClinics}
            placeholder="Pesquisar por nome, cidade ou estado..."
          />
        </div>

        {/* Mensagem de erro (ex: falha ao criar/editar/excluir) */}
        {error && <ErrorState message={error} />}

        {/* Tabela com dados da API */}
        <ClinicTable
          clinics={clinics}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteClick}
          onManageCosts={handleOpenCostsModal}
        />

        {/* Paginação local */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={goToPage}
        />
      </div>

      {/* Modal de criação/edição */}
      <ClinicModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        clinic={editingClinic}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Modal de custos operacionais (Issue #31 - FE-018) */}
      <ClinicCostsModal
        open={Boolean(costsClinic)}
        onOpenChange={(open) => !open && setCostsClinic(null)}
        clinic={costsClinic}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmation
        open={Boolean(deletingClinic)}
        onOpenChange={(open: boolean) => !open && setDeletingClinic(null)}
        itemName={deletingClinic?.name ?? ''}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  )
}

export default ClinicsPage
