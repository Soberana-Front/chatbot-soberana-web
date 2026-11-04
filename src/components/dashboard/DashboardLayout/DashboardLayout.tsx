import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router';

import Header from '../Header/Header';
import { Sidebar } from '@/components/layout/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => setIsSidebarOpen(false), [location.pathname]);
  useEffect(() => {
    if (!isSidebarOpen) return;
    closeButtonRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === 'Tab' && drawerRef.current) {
        const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>('button, a[href]')];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [isSidebarOpen]);

  return (
    <div className="dashboard-layout">
      <div className="dashboard-inner">

        {/* SIDEBAR DESKTOP */}
        <aside className="dashboard-desktop-sidebar">
          <div className="dashboard-desktop-sidebar-sticky">
            <Sidebar />
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <div className="dashboard-main-area">

          {/* BARRA MOBILE */}
          <div className="dashboard-mobile-bar">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Abrir menu"
              aria-expanded={isSidebarOpen}
              aria-controls="dashboard-mobile-drawer"
              onClick={() => setIsSidebarOpen(true)}
              className="dashboard-mobile-menu-button"
            >
              <Menu size={22} />
            </button>
            <span className="dashboard-mobile-title">Soberana</span>
          </div>

          {/* SIDEBAR MOBILE */}
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setIsSidebarOpen(false)}
                className="dashboard-mobile-backdrop"
              />

              {/* Drawer */}
              <aside ref={drawerRef} id="dashboard-mobile-drawer" className="dashboard-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navegação principal">
                <div className="dashboard-mobile-drawer-header">
                  <span className="dashboard-mobile-drawer-title">Menu</span>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setIsSidebarOpen(false)}
                    className="dashboard-mobile-drawer-close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div
                  className="dashboard-mobile-drawer-content"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Sidebar />
                </div>
              </aside>
            </>
          )}

          {/* HEADER */}
          <div className="dashboard-header-wrapper">
            <Header />
          </div>

          {/* CONTEÚDO */}
          <main className="dashboard-content">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
