import React from 'react';
import { useSidebarController } from './controller';
import { NAV_ITEMS } from './sidebar.config';
import { SidebarBrand, SidebarNavItem, SidebarLogoutButton } from './components';

export function Sidebar() {
  const controller = useSidebarController();
  const isLight = controller.theme === 'light';

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-surface-lowest border-r border-primary/30 shadow-sidebar flex flex-col justify-between p-4 font-inter text-on-surface relative z-10">
      <div>
        <SidebarBrand />

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = controller.currentRoute === item.route;

            return (
              <SidebarNavItem
                key={item.route}
                label={item.label}
                icon={<Icon className="w-5 h-5" />}
                isActive={isActive}
                onClick={() => controller.handleNavigate(item.route)}
              />
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
        {/* Botão de Alternar Tema (Modo Claro / Modo Noturno) */}
        <button
          type="button"
          onClick={controller.toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium bg-[#1f1b13] border border-[#38342b] hover:border-[#e9c340] text-[#eae2d3] transition-all cursor-pointer"
          title={isLight ? 'Alternar para Modo Noturno' : 'Alternar para Modo Claro'}
        >
          <span className="flex items-center gap-2.5">
            {isLight ? (
              <svg className="w-4 h-4 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
            <span>{isLight ? 'Modo Noturno' : 'Modo Claro'}</span>
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#2d2a20] text-[#e9c340] border border-[#38342b]">
            {isLight ? 'Claro' : 'Escuro'}
          </span>
        </button>

        <SidebarLogoutButton onLogout={controller.handleLogout} />
      </div>
    </aside>
  );
}
