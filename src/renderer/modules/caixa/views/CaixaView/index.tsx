import React from 'react';
import { useCaixaViewController } from './controller';

export function CaixaView() {
  const controller = useCaixaViewController();

  return (
    <main className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter p-6 overflow-y-auto">
      <header className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">Fluxo de Caixa</h1>
        <p className="font-inter text-xs text-[#99907b] mt-1">
          Abertura e fechamento de caixa, registro de retiradas e saldo por meio de pagamento
        </p>
      </header>

      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-6 max-w-lg space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#38342b] pb-4">
          <h3 className="font-sora font-semibold text-base text-[#e9c340]">Status: Caixa Aberto</h3>
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-[#99907b]">FUNDO INICIAL:</span>
            <span className="text-[#eae2d3]">R$ 200,00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#99907b]">ENTRADAS DO DIA:</span>
            <span className="text-[#10b981] font-semibold">R$ 390,00</span>
          </div>
        </div>

        <button
          type="button"
          onClick={controller.handleAbrirCaixa}
          className="w-full mt-4 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold py-2.5 rounded-md text-xs transition-all cursor-pointer"
        >
          Registrar Lançamento
        </button>
      </div>
    </main>
  );
}
