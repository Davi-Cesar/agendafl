import React from 'react';

export function SidebarBrand() {
  return (
    <div className="mb-6 px-1 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#1f1b13] border border-[#e9c340]/40 flex items-center justify-center p-1 shadow-md shadow-[#e9c340]/5 overflow-hidden shrink-0">
        <img
          src="./assets/icon.png"
          alt="Agenda FL"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <span className="block font-sora font-bold text-base text-primary tracking-tight truncate leading-tight">
          Agenda FL
        </span>
        <span className="block font-inter text-[11px] text-outline font-medium tracking-wide truncate">
          Espaço FL
        </span>
      </div>
    </div>
  );
}
