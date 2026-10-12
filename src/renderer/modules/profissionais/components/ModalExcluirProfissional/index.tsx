import React from 'react';
import { useModalExcluirProfissionalController } from './controller';

export function ModalExcluirProfissional() {
  const controller = useModalExcluirProfissionalController();

  if (!controller.modalAberto || !controller.profissional) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-center">
        {/* Ícone de Alerta */}
        <div className="w-12 h-12 rounded-full bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] mx-auto mb-4">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Título do Modal */}
        <h3 className="font-sora font-bold text-xl text-[#eae2d3] mb-2">Remover Profissional</h3>

        {/* Mensagem de Confirmação */}
        <p className="font-inter text-xs text-[#99907b] leading-relaxed mb-5">
          Tem certeza que deseja remover o profissional{' '}
          <strong className="text-[#eae2d3] font-semibold">{controller.profissional.nome}</strong> da equipe?
          <br /><br />
          Ele será inativado e deixará de receber novos agendamentos. Todo o histórico de atendimentos, comandas já criadas e dados financeiros continuará <span className="text-[#eae2d3] font-medium">100% preservado e visível</span>.
        </p>

        {/* Alerta de erro caso ocorra falha de rede/banco */}
        {controller.erro && (
          <div className="mb-5 bg-[#3c1313] border border-[#7a2222] text-[#f8a5a5] p-3 rounded-lg text-xs leading-relaxed text-left flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 text-[#fca5a5] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[11px] text-[#fca5a5]/90">
              {controller.erro}
            </p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={controller.salvando}
            onClick={controller.handleConfirmarExclusao}
            className="w-full py-2.5 px-4 rounded-md font-semibold text-xs bg-[#ffb4ab]/90 hover:bg-[#ffb4ab] text-[#690005] transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {controller.salvando ? 'Removendo...' : 'Sim, Remover da Equipe'}
          </button>

          <button
            type="button"
            disabled={controller.salvando}
            onClick={controller.handleFechar}
            className="w-full py-2 px-4 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
