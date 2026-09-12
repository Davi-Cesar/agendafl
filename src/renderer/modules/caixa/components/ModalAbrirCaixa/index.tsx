import React from 'react';
import { useModalAbrirCaixaController } from './controller';

export interface ModalAbrirCaixaProps {
  aberto: boolean;
}

export function ModalAbrirCaixa({ aberto }: ModalAbrirCaixaProps) {
  const controller = useModalAbrirCaixaController();

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg w-full max-w-md shadow-2xl p-6 font-inter text-[#eae2d3] relative animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#38342b] pb-3 mb-4">
          <h2 className="font-sora font-semibold text-lg text-[#eae2d3]">Abertura de Caixa</h2>
          <button
            type="button"
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors cursor-pointer"
            onClick={controller.fecharModal}
            aria-label="Fechar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[#d0c6af] leading-relaxed">
            Informe o fundo de troco inicial para abrir o caixa de hoje e liberar o recebimento de comandas.
          </p>

          <div>
            <label htmlFor="fundo-caixa-input" className="block font-mono text-[10px] text-[#99907b] uppercase mb-1 font-semibold">
              FUNDO DE CAIXA (R$)
            </label>
            <input
              id="fundo-caixa-input"
              type="number"
              min="0"
              step="10"
              value={controller.saldoInicial}
              onChange={(e) => controller.setSaldoInicial(Number(e.target.value))}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text.sm font-mono text-[#eae2d3]"
              placeholder="500,00"
            />
          </div>

          {controller.erro && (
            <div className="text-xs text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/30 p-2 rounded">
              {controller.erro}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#38342b] pt-4 mt-6">
          <button
            type="button"
            className="text-xs text-[#99907b] hover:text-[#eae2d3] px-3 py-2 transition-colors cursor-pointer"
            onClick={controller.fecharModal}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={controller.carregando}
            className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold px-5 py-2 rounded-md text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
            onClick={controller.handleConfirmar}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Confirmar Abertura do Caixa
          </button>
        </div>
      </div>
    </div>
  );
}
