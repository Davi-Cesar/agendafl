import React from 'react';

export function ServicosView() {
  return (
    <main className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter p-6 overflow-y-auto">
      <header className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">Catálogo de Serviços</h1>
        <p className="font-inter text-xs text-[#99907b] mt-1">
          Gerenciamento de serviços, preços, duração estimada e profissionais habilitados
        </p>
      </header>
    </main>
  );
}
