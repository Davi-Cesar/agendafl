import React from 'react';
import { useClientesViewController } from './controller';

export function ClientesView() {
  const controller = useClientesViewController();

  return (
    <main className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter p-6 overflow-y-auto">
      <header className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">Cadastro e Histórico de Clientes</h1>
        <p className="font-inter text-xs text-[#99907b] mt-1">
          Gerenciamento de clientes, histórico de visitas e contatos
        </p>
      </header>

      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Buscar cliente por nome ou telefone..."
          value={controller.busca}
          onChange={(e) => controller.setBusca(e.target.value)}
          className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-4 py-2 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all"
        />
      </div>
    </main>
  );
}
