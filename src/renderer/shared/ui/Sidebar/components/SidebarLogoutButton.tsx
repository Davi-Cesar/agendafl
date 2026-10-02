import React from 'react';
import { LogoutIcon } from '../icons/LogoutIcon';

export interface SidebarLogoutButtonProps {
  onLogout: () => void;
}

export function SidebarLogoutButton({ onLogout }: SidebarLogoutButtonProps) {
  return (
    <div className="border-t border-border pt-3">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-outline hover:bg-surface-low hover:text-error transition-all"
        onClick={onLogout}
      >
        <LogoutIcon className="w-5 h-5" />
        Sair
      </button>
    </div>
  );
}
