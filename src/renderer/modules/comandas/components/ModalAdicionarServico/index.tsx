import React from 'react';
import { useModalAdicionarServicoController, UseModalAdicionarServicoProps } from './controller';

export function ModalAdicionarServico(props: UseModalAdicionarServicoProps) {
  const controller = useModalAdicionarServicoController(props);

  if (!props.aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#38342b] pb-3">
          <h2 className="font-sora font-semibold text-base text-[#e9c340]">Adicionar Serviço à Comanda</h2>
          <button
            type="button"
            className="text-[#99907b] hover:text-[#eae2d3] text-lg font-bold transition-colors cursor-pointer"
            onClick={controller.onFechar}
          >
            &times;
          </button>
        </div>

        {controller.carregando ? (
          <div className="py-8 text-center text-xs text-[#99907b]">Carregando catálogo de serviços...</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Seleção do Serviço */}
            <div>
              <label className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">
                SELECIONAR SERVIÇO
              </label>
              <select
                value={controller.servicoSelecionadoId}
                onChange={(e) => controller.handleSelectServico(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded px-3 py-2 text-xs text-[#eae2d3]"
              >
                {controller.servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} — R$ {s.preco.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção do Profissional Executante */}
            <div>
              <label className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">
                PROFISSIONAL EXECUTANTE
              </label>
              <select
                value={controller.profissionalSelecionado}
                onChange={(e) => controller.setProfissionalSelecionado(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded px-3 py-2 text-xs text-[#eae2d3]"
              >
                {controller.profissionais.map((p) => (
                  <option key={p.id} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor do Serviço */}
            <div>
              <label className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">
                VALOR DO SERVIÇO (R$)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={controller.valorCustomizado}
                onChange={(e) => controller.setValorCustomizado(Number(e.target.value))}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded px-3 py-2 text-xs text-[#eae2d3] font-mono"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#38342b]">
          <button
            type="button"
            className="px-4 py-2 bg-transparent border border-[#38342b] hover:bg-[#2d2a20] text-[#eae2d3] rounded text-xs transition-colors cursor-pointer"
            onClick={controller.onFechar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold rounded text-xs transition-colors cursor-pointer"
            onClick={controller.handleConfirmar}
            disabled={controller.carregando}
          >
            Adicionar à Comanda
          </button>
        </div>
      </div>
    </div>
  );
}
