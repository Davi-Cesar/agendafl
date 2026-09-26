import React from 'react';
import { useModalExcluirServicoController } from './controller';

export function ModalExcluirServico() {
  const controller = useModalExcluirServicoController();

  if (!controller.modalAberto || !controller.servico) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex items-start gap-4">
        {/* Warning Icon in Red Circle */}
        <div className="w-12 h-12 rounded-full bg-[#93000a]/30 border border-[#ffb4ab]/40 flex items-center justify-center text-[#ffb4ab] shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-sora font-bold text-lg text-[#eae2d3] mb-2">Excluir Serviço</h3>
          <p className="font-inter text-xs text-[#99907b] leading-relaxed mb-6">
            Tem certeza que deseja excluir o serviço <strong className="text-[#eae2d3]">"{controller.servico.nome}"</strong>? Esta ação não pode ser desfeita.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={controller.salvando}
              onClick={controller.fecharModais}
              className="px-4 py-2 rounded-md font-semibold text-xs border border-[#38342b] text-[#e9c340] hover:bg-[#2d2a20] transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={controller.salvando}
              onClick={controller.handleConfirmarExclusao}
              className="px-4 py-2 rounded-md font-semibold text-xs bg-[#93000a] hover:bg-[#b3000f] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {controller.salvando ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
