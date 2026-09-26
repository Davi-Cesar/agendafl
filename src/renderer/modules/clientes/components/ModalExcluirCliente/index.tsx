import React from 'react';
import { useModalExcluirClienteController } from './controller';

export function ModalExcluirCliente() {
  const controller = useModalExcluirClienteController();

  if (!controller.modalAberto || !controller.cliente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-center">
        {/* Warning Triangle Icon */}
        <div className="w-12 h-12 rounded-full bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] mx-auto mb-4">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Modal Title */}
        <h3 className="font-sora font-bold text-xl text-[#eae2d3] mb-2">Remover Cliente</h3>

        {/* Message */}
        <p className="font-inter text-xs text-[#99907b] leading-relaxed mb-6">
          Tem certeza que deseja remover o cliente <strong className="text-[#eae2d3] font-semibold">{controller.cliente.nome}</strong>? Este cliente será removido da listagem e não poderá mais ser selecionado para novos agendamentos. Agendamentos futuros já marcados serão cancelados. O histórico de atendimentos e comandas permanece intacto para fins de registro financeiro.
        </p>

        {/* Action Buttons */}
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
            {controller.salvando ? 'Removendo...' : 'Remover Cliente'}
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
