import React from 'react';
import { useSidebarController } from './controller';

export function Sidebar() {
  const controller = useSidebarController();

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-[#110e06] border-r border-[#e9c340]/30 shadow-[4px_0_20px_rgba(233,195,64,0.12)] flex flex-col justify-between p-4 font-inter text-[#eae2d3] relative z-10">
      <div>
        {/* Identidade */}
        <div className="mb-6 px-2">
          <span className="block font-sora font-bold text-lg text-[#e9c340] tracking-tight">FL Agenda</span>
          <span className="block font-inter text-xs text-[#99907b] font-medium tracking-wide">Espaço FL</span>
        </div>

        {/* Menu de navegação */}
        <nav className="space-y-1">
          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
              controller.currentRoute === '/agenda'
                ? 'bg-[#2d2a20] text-[#e9c340] font-semibold border-l-2 border-[#e9c340] shadow-[-3px_0_10px_rgba(233,195,64,0.6)]'
                : 'text-[#d0c6af] hover:bg-[#1f1b13] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.handleNavigate('/agenda')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Agenda
          </button>

          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
              controller.currentRoute === '/caixa'
                ? 'bg-[#2d2a20] text-[#e9c340] font-semibold border-l-2 border-[#e9c340] shadow-[-3px_0_10px_rgba(233,195,64,0.6)]'
                : 'text-[#d0c6af] hover:bg-[#1f1b13] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.handleNavigate('/caixa')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Caixa
          </button>

          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
              controller.currentRoute === '/profissionais'
                ? 'bg-[#2d2a20] text-[#e9c340] font-semibold border-l-2 border-[#e9c340] shadow-[-3px_0_10px_rgba(233,195,64,0.6)]'
                : 'text-[#d0c6af] hover:bg-[#1f1b13] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.handleNavigate('/profissionais')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profissionais
          </button>

          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
              controller.currentRoute === '/clientes'
                ? 'bg-[#2d2a20] text-[#e9c340] font-semibold border-l-2 border-[#e9c340] shadow-[-3px_0_10px_rgba(233,195,64,0.6)]'
                : 'text-[#d0c6af] hover:bg-[#1f1b13] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.handleNavigate('/clientes')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Clientes
          </button>

          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
              controller.currentRoute === '/servicos'
                ? 'bg-[#2d2a20] text-[#e9c340] font-semibold border-l-2 border-[#e9c340] shadow-[-3px_0_10px_rgba(233,195,64,0.6)]'
                : 'text-[#d0c6af] hover:bg-[#1f1b13] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.handleNavigate('/servicos')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Serviços
          </button>

          <button
            type="button"
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
              controller.currentRoute === '/comandas'
                ? 'bg-[#2d2a20] text-[#e9c340] font-semibold border-l-2 border-[#e9c340] shadow-[-3px_0_10px_rgba(233,195,64,0.6)]'
                : 'text-[#d0c6af] hover:bg-[#1f1b13] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.handleNavigate('/comandas')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Comandas
          </button>
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-[#1e1e1e] pt-3">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-[#99907b] hover:bg-[#1f1b13] hover:text-[#ffb4ab] transition-all"
          onClick={controller.handleLogout}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
