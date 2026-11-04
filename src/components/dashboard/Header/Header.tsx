/* ========================================
 * IMPORTAÇÕES
 * ======================================== */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bell } from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import { PageHeader } from '../../layout/PageHeader';

const pageNames: Record<string, string> = {
  dashboard: 'Dashboard',
  clinicas: 'Clínicas',
  procedimentos: 'Procedimentos',
  comparacoes: 'Comparações',
  historico: 'Histórico',
  perfil: 'Perfil',
  configuracoes: 'Configurações',
  precificacao: 'Precificação',
};

/* ========================================
 * UTILITÁRIO: GERAR INICIAIS DO NOME
 * ======================================== */

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

/* ========================================
 * COMPONENTE PRINCIPAL
 * ======================================== */

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const current = segments.at(-1) ?? 'dashboard';
  const title = current === 'nova' ? 'Nova precificação'
    : current === 'alterar-senha' ? 'Alterar senha'
    : pageNames[current] ?? (segments[0] === 'historico' ? 'Detalhe do histórico' : 'Detalhe da precificação');
  const breadcrumbs = segments.length > 1 || current !== 'dashboard'
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        ...segments.map((segment, index) => ({
          label: index === segments.length - 1 ? title : pageNames[segment] ?? segment,
          href: index === segments.length - 1 ? undefined : `/${segments.slice(0, index + 1).join('/')}`,
        })),
      ]
    : [];

  const userName = user?.name ?? 'Doutor(a)';
  const userInitials = user?.name ? getInitials(user.name) : 'DR';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      {/* ===== LADO ESQUERDO ===== */}
      <PageHeader title={title} subtitle={current === 'dashboard' ? 'Precifique seus procedimentos com precisão' : undefined} breadcrumbs={breadcrumbs} />

      {/* ===== LADO DIREITO ===== */}
      <div className="dashboard-header-actions">

        {/* Data atual */}
        <div className="dashboard-header-date-badge">
          <Bell className="w-3.5 h-3.5 text-gray-400" />
          <span>16 Jul 2026</span>
        </div>

        {/* Botão de notificações */}
        <button
          type="button"
          aria-label="Notificações"
          className="dashboard-header-notification-btn"
        >
          <Bell className="w-5 h-5" />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </button>

        {/* Avatar e dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleDropdown}
            className="dashboard-header-avatar"
          >
            {userInitials}
          </button>

          {isDropdownOpen && (
            <div className="dashboard-header-dropdown">

              <div className="dashboard-header-dropdown-user">
                <p className="dashboard-header-dropdown-user-text">
                  Olá, {userName}
                </p>
              </div>

              
<button
  type="button"
  onClick={() => {
    setIsDropdownOpen(false);
    navigate('/perfil');
  }}
  className="dashboard-header-dropdown-item"
>
  Perfil
</button>

<button
  type="button"
  onClick={() => {
    setIsDropdownOpen(false);
    navigate('/configuracoes');
  }}
  className="dashboard-header-dropdown-item"
>
  Configurações
</button>

              <button
                type="button"
                onClick={handleLogout}
                className="dashboard-header-dropdown-item-danger"
              >
                Sair
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
