import React from 'react';

export function SidebarBrand() {
  return (
    <div className="mb-6 px-1 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#18140b] border border-[#e9c340]/50 flex items-center justify-center shadow-md shadow-[#e9c340]/10 overflow-hidden shrink-0">
        <svg
          className="w-7 h-7"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Agenda FL"
        >
          <defs>
            <linearGradient id="flGoldGrad" x1="0" y1="10" x2="0" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FCE26A" />
              <stop offset="100%" stopColor="#D4A62A" />
            </linearGradient>
          </defs>
          {/* Letra F */}
          <path
            d="M11 13C11 11.8954 11.8954 11 13 11H29C30.1046 11 31 11.8954 31 13V16.5C31 17.6046 30.1046 18.5 29 18.5H18.5V28H27C28.1046 28 29 28.8954 29 30V33C29 34.1046 28.1046 35 27 35H18.5V51C18.5 52.1046 17.6046 53 16.5 53H13C11.8954 53 11 52.1046 11 51V13Z"
            fill="url(#flGoldGrad)"
          />
          {/* Letra L */}
          <path
            d="M36 13C36 11.8954 36.8954 11 38 11H41.5C42.6046 11 43.5 11.8954 43.5 13V45.5H52C53.1046 45.5 54 46.3954 54 47.5V51C54 52.1046 53.1046 53 52 53H38C36.8954 53 36 52.1046 36 51V13Z"
            fill="url(#flGoldGrad)"
          />
        </svg>
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
