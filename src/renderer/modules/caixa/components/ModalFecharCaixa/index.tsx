import React from 'react';
import { useModalFecharCaixaController } from './controller';
import { formatCurrency } from '@shared/lib/utils';

export interface ModalFecharCaixaProps {
  aberto: boolean;
}

export function ModalFecharCaixa({ aberto }: ModalFecharCaixaProps) {
  const controller = useModalFecharCaixaController();

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg w-full max-w-lg shadow-2xl p-6 font-inter text-[#eae2d3] relative animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#38342b] pb-3 mb-4">
          <h2 className="font-sora font-semibold text-lg text-[#eae2d3]">Fechamento do Caixa</h2>
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

        {controller.erroLocal && (
          <div className="mb-4 bg-[#3c1313] border border-[#7a2222] text-[#f8a5a5] p-3 rounded-md text-xs font-inter leading-relaxed">
            <strong className="block font-bold mb-0.5">Erro ao Fechar Caixa:</strong>
            {controller.erroLocal}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-xs text-[#d0c6af]">
            Confira a consolidação dos recebimentos e valores do dia antes de encerrar o caixa:
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs bg-[#110e06] p-4 rounded-md border border-[#38342b]">
            <div>
              <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-0.5">DINHEIRO</span>
              <span className="font-mono text-[#eae2d3] font-semibold">{formatCurrency(controller.totaisMeios.dinheiro)}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-0.5">PIX BRICIA + FLAVIA</span>
              <span className="font-mono text-[#eae2d3] font-semibold">
                {formatCurrency(controller.totaisMeios.pixBricia + controller.totaisMeios.pixFlavia)}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-0.5">CARTÃO CRÉDITO</span>
              <span className="font-mono text-[#eae2d3] font-semibold">{formatCurrency(controller.totaisMeios.cartaoCredito)}</span>
            </div>
            <div>
              <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-0.5">CARTÃO DÉBITO</span>
              <span className="font-mono text-[#eae2d3] font-semibold">{formatCurrency(controller.totaisMeios.cartaoDebito)}</span>
            </div>
          </div>

          <div className="border-t border-[#38342b] pt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#1f1b13] p-3 rounded border border-[#38342b]">
              <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-0.5">TOTAL COMISSÕES</span>
              <span className="font-mono text-[#ffb4ab] font-bold text-sm">{formatCurrency(controller.totalComissoes)}</span>
            </div>
            <div className="bg-[#2d2a20] p-3 rounded border border-[#e9c340]/40">
              <span className="block font-mono text-[10px] text-[#e9c340] uppercase mb-0.5 font-bold">VALOR LÍQUIDO</span>
              <span className="font-mono text-[#e9c340] font-bold text-sm">{formatCurrency(controller.valorLiquido)}</span>
            </div>
          </div>

          <div>
            <label htmlFor="fechamento-obs" className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">
              OBSERVAÇÕES (OPCIONAL)
            </label>
            <textarea
              id="fechamento-obs"
              rows={2}
              value={controller.observacoes}
              onChange={(e) => controller.setObservacoes(e.target.value)}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs font-inter text-[#eae2d3] resize-none"
              placeholder="Notas ou justificativas sobre o saldo final..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#38342b] pt-4 mt-6">
          <button
            type="button"
            className="text-xs text-[#99907b] hover:text-[#eae2d3] px-3 py-2 transition-colors cursor-pointer"
            onClick={controller.fecharModal}
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={controller.carregando}
            className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold px-5 py-2 rounded-md text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
            onClick={controller.handleConfirmarFechamento}
          >
            {controller.carregando ? 'Fechando Caixa...' : 'Confirmar Fechamento do Caixa'}
          </button>
        </div>
      </div>
    </div>
  );
}
