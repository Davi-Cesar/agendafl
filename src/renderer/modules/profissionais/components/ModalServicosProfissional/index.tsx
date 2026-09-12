import React from 'react';
import { useModalServicosProfissionalController } from './controller';

export function ModalServicosProfissional() {
  const controller = useModalServicosProfissionalController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b]">
          <div>
            <h2 className="font-sora font-bold text-lg text-[#eae2d3]">Serviços Habilitados</h2>
            <p className="font-mono text-xs text-[#e9c340] mt-0.5">{controller.profissionalAtual?.nome}</p>
          </div>
          <button
            type="button"
            onClick={controller.handleFechar}
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors rounded-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Lista de Serviços com Checkbox */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1 divide-y divide-[#38342b]">
          {controller.todosServicos.map((servico) => {
            const isChecked = !!controller.selecionadosMap[servico.id];
            return (
              <label
                key={servico.id}
                className={`flex items-center justify-between pt-2.5 pb-2.5 px-3 rounded-md cursor-pointer transition-all ${
                  isChecked ? 'bg-[#2d2a20]/60 text-[#e9c340]' : 'hover:bg-[#110e06]/50 text-[#eae2d3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => controller.toggleServico(servico.id)}
                    className="w-4 h-4 accent-[#e9c340] rounded border-[#38342b] bg-[#110e06] cursor-pointer"
                  />
                  <span className="font-sora font-medium text-xs">{servico.nome}</span>
                </div>
                {servico.duracaoMinutos && (
                  <span className="font-mono text-[11px] text-[#99907b]">{servico.duracaoMinutos} min</span>
                )}
              </label>
            );
          })}
          {controller.todosServicos.length === 0 && (
            <p className="text-center text-xs text-[#99907b] py-8">Nenhum serviço cadastrado no catálogo.</p>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#110e06] border-t border-[#38342b]">
          <button
            type="button"
            onClick={controller.handleFechar}
            className="px-4 py-2 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={controller.handleSalvar}
            disabled={controller.salvando}
            className="px-5 py-2 rounded-md text-xs font-semibold bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] disabled:opacity-50 transition-all cursor-pointer shadow-md"
          >
            {controller.salvando ? 'Salvando...' : 'Salvar Vínculos'}
          </button>
        </div>
      </div>
    </div>
  );
}
