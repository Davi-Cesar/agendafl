import React from 'react';
import { useModalDetalhesAgendamentoController } from './controller';

export function ModalDetalhesAgendamento() {
  const controller = useModalDetalhesAgendamentoController();
  const apt = controller.agendamento;

  if (!apt) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg w-full max-w-md shadow-2xl p-6 font-inter text-[#eae2d3] relative animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#38342b] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-sora font-semibold text-lg text-[#eae2d3]">Detalhes do Agendamento</h2>
            {apt.comandaNumero && (
              <span className="bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                Comanda {apt.comandaNumero}
              </span>
            )}
          </div>
          <button
            type="button"
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors"
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
          <div className="bg-[#110e06] border border-[#38342b] rounded-md p-4">
            <div className="font-sora font-bold text-base text-[#e9c340] mb-1">{apt.clienteNome}</div>
            <div className="font-inter text-xs text-[#d0c6af]">{apt.servico}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#110e06] p-3 rounded-md border border-[#38342b]">
              <span className="block font-mono text-[10px] text-[#99907b] mb-0.5">PROFISSIONAL</span>
              <span className="font-medium text-[#eae2d3]">{controller.profissionalNome}</span>
            </div>

            <div className="bg-[#110e06] p-3 rounded-md border border-[#38342b]">
              <span className="block font-mono text-[10px] text-[#99907b] mb-0.5">HORÁRIO</span>
              <span className="font-mono text-[#eae2d3]">
                {apt.horarioInicio} às {apt.horarioFim}
              </span>
            </div>
          </div>

          <div>
            <span className="block font-mono text-[10px] text-[#99907b] mb-1.5">ALTERAR STATUS DA AGENDA</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="bg-[#2d2a20] hover:bg-[#e9c340] hover:text-[#3c2f00] text-[#e9c340] border border-[#e9c340]/40 py-2 rounded-md font-mono text-[11px] font-semibold transition-all"
                onClick={() => controller.handleMudarStatus('em_atendimento')}
              >
                Em Atendimento
              </button>
              <button
                type="button"
                className="bg-[#10b981]/10 hover:bg-[#10b981] hover:text-[#000] text-[#10b981] border border-[#10b981]/30 py-2 rounded-md font-mono text-[11px] font-semibold transition-all"
                onClick={() => controller.handleMudarStatus('concluido')}
              >
                Concluir
              </button>
              <button
                type="button"
                className="bg-[#ffb4ab]/10 hover:bg-[#ffb4ab] hover:text-[#690005] text-[#ffb4ab] border border-[#ffb4ab]/30 py-2 rounded-md font-mono text-[11px] font-semibold transition-all"
                onClick={() => controller.handleMudarStatus('faltou')}
              >
                Faltou
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#38342b] pt-4 mt-6">
          <button
            type="button"
            className="bg-[#93000a]/20 hover:bg-[#93000a] text-[#ffb4ab] px-3 py-2 rounded-md text-xs font-medium transition-all"
            onClick={controller.excluirAgendamento}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold px-5 py-2 rounded-md text-xs transition-all cursor-pointer"
            onClick={controller.handleAbrirComanda}
          >
            {apt.comandaId ? `Ver Comanda ${apt.comandaNumero || ''}` : 'Abrir Comanda'}
          </button>
        </div>
      </div>
    </div>
  );
}
