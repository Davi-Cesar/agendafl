import React, { useState } from 'react';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow();
      setIsMaximized((prev) => !prev);
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div
      className="h-8 min-h-[32px] w-full bg-[#0d0b06] border-b border-[#262013] flex items-center justify-end select-none z-50 text-[#eae2d3]"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Direita: Controles de Janela (Minimizar, Maximizar, Fechar) */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Botão Minimizar */}
        <button
          type="button"
          onClick={handleMinimize}
          className="h-full px-3 text-[#99907b] hover:text-[#eae2d3] hover:bg-[#1f1b13] transition-colors flex items-center justify-center cursor-pointer"
          title="Minimizar"
          aria-label="Minimizar janela"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
            <line x1="2" y1="6" x2="10" y2="6" strokeLinecap="round" />
          </svg>
        </button>

        {/* Botão Maximizar / Restaurar */}
        <button
          type="button"
          onClick={handleMaximize}
          className="h-full px-3 text-[#99907b] hover:text-[#eae2d3] hover:bg-[#1f1b13] transition-colors flex items-center justify-center cursor-pointer"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
          aria-label="Maximizar ou restaurar janela"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="2" y="2" width="8" height="8" rx="1" />
          </svg>
        </button>

        {/* Botão Fechar */}
        <button
          type="button"
          onClick={handleClose}
          className="h-full px-3 text-[#99907b] hover:text-white hover:bg-[#e11d48] transition-colors flex items-center justify-center cursor-pointer"
          title="Fechar"
          aria-label="Fechar janela"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="3" y1="3" x2="9" y2="9" />
            <line x1="9" y1="3" x2="3" y2="9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
