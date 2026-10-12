import React from 'react';
import { useModalServicosProfissionalController } from './controller';

export function ModalServicosProfissional() {
  const controller = useModalServicosProfissionalController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b] shrink-0">
          <div>
            <h2 className="font-sora font-bold text-lg text-[#eae2d3]">Serviços Habilitados</h2>
            <p className="font-mono text-xs text-[#e9c340] mt-0.5">{controller.profissionalAtual?.nome}</p>
          </div>
          <button
            type="button"
            onClick={controller.handleFechar}
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors rounded-md cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Barra de Ações Rápidas */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#16130b] border-b border-[#38342b] text-xs shrink-0">
          <span className="text-[#99907b]">
            Total: <strong className="text-[#e9c340] font-mono">{controller.totalSelecionados}</strong> de {controller.totalTodosServicos} serviços
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={controller.selecionarTodos}
              className="text-[11px] font-mono text-[#e9c340] hover:underline cursor-pointer"
            >
              Marcar todos
            </button>
            <span className="text-[#38342b]">•</span>
            <button
              type="button"
              onClick={controller.limparSelecao}
              className="text-[11px] font-mono text-[#99907b] hover:text-[#eae2d3] cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Lista de Serviços Agrupados por Categoria */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {controller.categoriasComServicos.map((cat) => {
            if (cat.totalServicos === 0) return null;

            return (
              <div key={cat.id} className="border border-[#38342b] rounded-lg overflow-hidden bg-[#110e06]/60">
                {/* Cabeçalho da Categoria com Botão de Selecionar Toda Categoria */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#110e06] border-b border-[#38342b]">
                  <div className="flex items-center gap-2">
                    <span className="font-sora font-semibold text-xs text-[#eae2d3]">{cat.nome}</span>
                    <span className="text-[10px] font-mono text-[#99907b]">
                      ({cat.totalSelecionados}/{cat.totalServicos})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => controller.toggleCategoria(cat.id)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      cat.isTodas
                        ? 'bg-[#e9c340]/20 border-[#e9c340] text-[#e9c340]'
                        : 'border-[#38342b] text-[#99907b] hover:text-[#eae2d3] hover:border-[#99907b]'
                    }`}
                  >
                    {cat.isTodas ? '✓ Categoria selecionada' : cat.isParcial ? 'Completar categoria' : '+ Selecionar categoria'}
                  </button>
                </div>

                {/* Itens da Categoria */}
                <div className="divide-y divide-[#38342b]/50">
                  {cat.servicos.map((servico) => {
                    const isChecked = !!controller.selecionadosMap[servico.id];
                    return (
                      <label
                        key={servico.id}
                        className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-all ${
                          isChecked ? 'bg-[#2d2a20]/40 text-[#e9c340]' : 'hover:bg-[#1f1b13]/40 text-[#eae2d3]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => controller.toggleServico(servico.id)}
                            className="w-4 h-4 accent-[#e9c340] rounded border-[#38342b] bg-[#110e06] cursor-pointer"
                          />
                          <span className="font-medium text-xs">{servico.nome}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#99907b]">
                          {servico.precoPadrao != null && servico.precoPadrao > 0 && (
                            <span>R$ {servico.precoPadrao.toFixed(2)}</span>
                          )}
                          {servico.duracaoMinutos && (
                            <span>{servico.duracaoMinutos}m</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Serviços sem categoria */}
          {controller.servicosSemCategoria.length > 0 && (
            <div className="border border-[#38342b] rounded-lg overflow-hidden bg-[#110e06]/60">
              <div className="px-4 py-2.5 bg-[#110e06] border-b border-[#38342b]">
                <span className="font-sora font-semibold text-xs text-[#eae2d3]">Outros / Sem Categoria</span>
                <span className="text-[10px] font-mono text-[#99907b] ml-2">
                  ({controller.servicosSemCategoria.length})
                </span>
              </div>
              <div className="divide-y divide-[#38342b]/50">
                {controller.servicosSemCategoria.map((servico) => {
                  const isChecked = !!controller.selecionadosMap[servico.id];
                  return (
                    <label
                      key={servico.id}
                      className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-all ${
                        isChecked ? 'bg-[#2d2a20]/40 text-[#e9c340]' : 'hover:bg-[#1f1b13]/40 text-[#eae2d3]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => controller.toggleServico(servico.id)}
                          className="w-4 h-4 accent-[#e9c340] rounded border-[#38342b] bg-[#110e06] cursor-pointer"
                        />
                        <span className="font-medium text-xs">{servico.nome}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#99907b]">
                        {servico.precoPadrao != null && servico.precoPadrao > 0 && (
                          <span>R$ {servico.precoPadrao.toFixed(2)}</span>
                        )}
                        {servico.duracaoMinutos && (
                          <span>{servico.duracaoMinutos}m</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {controller.todosServicos.length === 0 && (
            <p className="text-center text-xs text-[#99907b] py-8">Nenhum serviço cadastrado no catálogo.</p>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#110e06] border-t border-[#38342b] shrink-0">
          <button
            type="button"
            onClick={controller.handleFechar}
            className="px-4 py-2 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] transition-colors cursor-pointer"
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
