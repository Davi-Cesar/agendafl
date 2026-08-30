import React from 'react';
import { useComandasViewController } from './controller';
import { formatCurrency } from '@shared/lib/utils';

export function ComandasView() {
  const controller = useComandasViewController();

  return (
    <main className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter p-6 overflow-y-auto">
      <header className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">Listagem de Comandas</h1>
        <p className="font-inter text-xs text-[#99907b] mt-1">Gerencie comandas ativas, rascunhos e históricos finalizados</p>
      </header>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-4">
          <span className="block font-mono text-[11px] text-[#99907b]">COMANDAS EM RASCUNHO</span>
          <h2 className="font-sora font-bold text-2xl text-[#f59e0b] mt-1">{controller.metricas.totalRascunhos}</h2>
        </div>

        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-4">
          <span className="block font-mono text-[11px] text-[#99907b]">COMANDAS FINALIZADAS</span>
          <h2 className="font-sora font-bold text-2xl text-[#10b981] mt-1">{controller.metricas.totalFinalizadas}</h2>
        </div>

        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-4">
          <span className="block font-mono text-[11px] text-[#99907b]">FATURAMENTO DO DIA</span>
          <h2 className="font-sora font-bold text-2xl text-[#e9c340] mt-1">{formatCurrency(controller.metricas.faturamentoTotal)}</h2>
        </div>
      </div>

      {/* Controles de Busca e Filtro */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por cliente, comanda ou profissional..."
          value={controller.busca}
          onChange={(e) => controller.setBusca(e.target.value)}
          className="flex-1 bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-4 py-2 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all"
        />

        <select
          value={controller.filtroStatus}
          onChange={(e) => controller.setFiltroStatus(e.target.value as any)}
          className="bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-4 py-2 text-xs text-[#eae2d3] transition-all cursor-pointer"
        >
          <option value="todas">Todas as Comandas</option>
          <option value="rascunho">Apenas Rascunhos</option>
          <option value="finalizada">Apenas Finalizadas</option>
        </select>
      </div>

      {/* Tabela de Comandas */}
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#110e06] border-b border-[#38342b] font-mono text-[#99907b]">
                <th className="py-3 px-4 font-medium">COMANDA</th>
                <th className="py-3 px-4 font-medium">CLIENTE</th>
                <th className="py-3 px-4 font-medium">SERVIÇO</th>
                <th className="py-3 px-4 font-medium">PROFISSIONAL</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium">VALOR</th>
                <th className="py-3 px-4 font-medium text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38342b]">
              {controller.comandas.map((item) => (
                <tr key={item.comandaId} className="hover:bg-[#2d2a20]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#e9c340]">{item.comandaNumero}</td>
                  <td className="py-3.5 px-4 font-medium text-[#eae2d3]">{item.clienteNome}</td>
                  <td className="py-3.5 px-4 text-[#d0c6af]">{item.servico}</td>
                  <td className="py-3.5 px-4 text-[#d0c6af]">{item.profissionalNome}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-mono text-[10px] px-2.5 py-1 rounded-md uppercase font-semibold border ${
                        item.comandaStatus === 'finalizada'
                          ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
                          : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30'
                      }`}
                    >
                      {item.comandaStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#eae2d3]">{formatCurrency(item.valor)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => controller.handleItemClick(item)}
                      className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {controller.comandas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#99907b] text-xs">
                    Nenhuma comanda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
