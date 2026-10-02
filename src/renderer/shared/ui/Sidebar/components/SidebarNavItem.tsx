import React from 'react';

export interface SidebarNavItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export function SidebarNavItem({
  label,
  icon,
  isActive,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-surface-high text-primary font-semibold border-l-2 border-primary'
          : 'text-on-variant hover:bg-surface-low hover:text-on-surface'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
