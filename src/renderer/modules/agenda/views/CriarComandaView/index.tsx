import React from 'react';
import { useCriarComandaViewController } from './controller';
import { formatCurrency } from '@shared/lib/utils';

export function CriarComandaView({ dados }: { dados: any }) {
  const controller = useCriarComandaViewController(dados);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter overflow-y-auto p-6">
      <header className="flex items-center justify-between border-b border-[#38342b] pb-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs font-mono text-[#99907b] hover:text-[#e9c340] flex items-center gap-1 transition-colors cursor-pointer"
            onClick={controller.handleVoltar}
          >
            &larr; Voltar para Agenda
          </button>
          <h1 className="font-sora font-bold text-xl text-[#eae2d3]">
            Comanda {controller.dados?.comandaNumero || '#0000'}
          </h1>
          <span className="bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 font-mono text-[11px] px-2.5 py-0.5 rounded-md uppercase font-semibold">
            RASCUNHO
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Card Cliente */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5">
            <h3 className="font-sora font-semibold text-sm text-[#e9c340] mb-3">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block font-mono text-[10px] text-[#99907b] mb-1">CLIENTE</span>
                <span className="font-medium text-[#eae2d3]">{controller.dados?.clienteNome}</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-[#99907b] mb-1">HORÁRIO</span>
                <span className="font-mono text-[#eae2d3]">{controller.dados?.horarioInicio} - {controller.dados?.horarioFim}</span>
              </div>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 overflow-hidden">
            <h3 className="font-sora font-semibold text-sm text-[#e9c340] mb-4">Itens da Comanda</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#38342b] font-mono text-[#99907b]">
                    <th className="pb-3 px-2 font-medium">DESCRIÇÃO</th>
                    <th className="pb-3 px-2 font-medium">PROFISSIONAL</th>
                    <th className="pb-3 px-2 font-medium">QTD</th>
                    <th className="pb-3 px-2 font-medium">UNITÁRIO</th>
                    <th className="pb-3 px-2 font-medium">TOTAL</th>
                    <th className="pb-3 px-2 font-medium text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38342b]">
                  {controller.itens.map((item) => (
                    <tr key={item.id} className="hover:bg-[#2d2a20]/50 transition-colors">
                      <td className="py-3 px-2 font-medium text-[#eae2d3]">{item.descricao}</td>
                      <td className="py-3 px-2 text-[#d0c6af]">{item.profissional}</td>
                      <td className="py-3 px-2 font-mono text-[#eae2d3]">{item.quantidade}</td>
                      <td className="py-3 px-2 font-mono text-[#eae2d3]">{formatCurrency(item.valorUnitario)}</td>
                      <td className="py-3 px-2 font-mono font-semibold text-[#e9c340]">
                        {formatCurrency(item.quantidade * item.valorUnitario)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          type="button"
                          className="text-[#ffb4ab] hover:text-[#93000a] text-xs transition-colors cursor-pointer"
                          onClick={() => controller.handleRemoverItem(item.id)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Resumo */}
        <div>
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 space-y-4">
            <h3 className="font-sora font-semibold text-sm text-[#e9c340] mb-2">Resumo Financeiro</h3>

            <div className="space-y-3 text-xs border-b border-[#38342b] pb-4">
              <div className="flex justify-between items-center text-[#d0c6af]">
                <span>Subtotal:</span>
                <span className="font-mono text-[#eae2d3]">{formatCurrency(controller.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-[#d0c6af]">
                <span>Desconto:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono">R$</span>
                  <input
                    type="number"
                    min="0"
                    className="w-20 bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded px-2 py-1 text-xs text-right font-mono text-[#eae2d3]"
                    value={controller.desconto}
                    onChange={(e) => controller.setDesconto(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 font-sora font-bold text-base text-[#eae2d3]">
              <span>Total:</span>
              <span className="font-mono text-xl text-[#e9c340]">{formatCurrency(controller.total)}</span>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                className="w-full bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold py-2.5 rounded-md text-xs transition-all cursor-pointer"
                onClick={controller.handleFinalizar}
              >
                Finalizar Comanda
              </button>

              <button
                type="button"
                className="w-full bg-transparent border border-[#38342b] hover:bg-[#2d2a20] text-[#eae2d3] py-2 rounded-md text-xs transition-all cursor-pointer"
                onClick={controller.handleVoltar}
              >
                Salvar Rascunho
              </button>

              <button
                type="button"
                className="w-full bg-[#93000a]/20 hover:bg-[#93000a] text-[#ffb4ab] py-2 rounded-md text-xs transition-all cursor-pointer"
                onClick={controller.handleCancelarExcluir}
              >
                Cancelar Comanda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
