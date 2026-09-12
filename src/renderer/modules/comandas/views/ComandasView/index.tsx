import React from 'react';
import { useComandasViewController } from './controller';
import { CriarComandaView } from '../CriarComandaView';
import { DetalhesComandaView } from '../DetalhesComandaView';
import { formatCurrency } from '@shared/lib/utils';

export function ComandasView() {
  const controller = useComandasViewController();

  if (controller.comandaAtivaView) {
    if (controller.comandaAtivaView.tipo === 'criar') {
      return <CriarComandaView dados={controller.comandaAtivaView.dados} />;
    }
    return <DetalhesComandaView dados={controller.comandaAtivaView.dados} />;
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter p-6 overflow-y-auto">
      {/* Cabeçalho */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">Gestão de Comandas</h1>
          <p className="font-inter text-xs text-[#99907b] mt-1">
            Consulta de comandas ativas, rascunhos e controle de faturamento
          </p>
        </div>
      </header>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-4 shadow-md">
          <span className="block font-mono text-[11px] text-[#99907b]">COMANDAS FINALIZADAS</span>
          <h2 className="font-sora font-bold text-2xl text-[#10b981] mt-1">{controller.metricas.totalFinalizadas}</h2>
        </div>

        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-4 shadow-md">
          <span className="block font-mono text-[11px] text-[#99907b]">FATURAMENTO CONCLUÍDO</span>
          <h2 className="font-sora font-bold text-2xl text-[#e9c340] mt-1">{formatCurrency(controller.metricas.faturamentoTotal)}</h2>
        </div>

        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-4 shadow-md">
          <span className="block font-mono text-[11px] text-[#99907b]">COMANDAS EM RASCUNHO</span>
          <h2 className="font-sora font-bold text-2xl text-[#f59e0b] mt-1">{controller.metricas.totalRascunhos}</h2>
        </div>
      </div>

      {/* Controles de Busca e Abas de Filtro */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Abas */}
        <div className="flex items-center gap-1 bg-[#110e06] p-1 border border-[#38342b] rounded-md">
          <button
            type="button"
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              controller.filtroStatus === 'todas'
                ? 'bg-[#2d2a20] text-[#e9c340] font-semibold border-b-2 border-[#e9c340]'
                : 'text-[#99907b] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.setFiltroStatus('todas')}
          >
            Todas ({controller.totalComandas})
          </button>

          <button
            type="button"
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              controller.filtroStatus === 'rascunho'
                ? 'bg-[#2d2a20] text-[#f59e0b] font-semibold border-b-2 border-[#f59e0b]'
                : 'text-[#99907b] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.setFiltroStatus('rascunho')}
          >
            Rascunhos ({controller.metricas.totalRascunhos})
          </button>

          <button
            type="button"
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              controller.filtroStatus === 'finalizada'
                ? 'bg-[#2d2a20] text-[#10b981] font-semibold border-b-2 border-[#10b981]'
                : 'text-[#99907b] hover:text-[#eae2d3]'
            }`}
            onClick={() => controller.setFiltroStatus('finalizada')}
          >
            Finalizadas ({controller.metricas.totalFinalizadas})
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Buscar cliente, comanda ou profissional..."
            value={controller.busca}
            onChange={(e) => controller.setBusca(e.target.value)}
            className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-4 py-2 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all"
          />
        </div>
      </div>

      {/* Tabela de Comandas */}
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#110e06] border-b border-[#38342b] font-mono text-[#99907b]">
                <th className="py-3 px-4 font-medium">Nº COMANDA</th>
                <th className="py-3 px-4 font-medium">CLIENTE</th>
                <th className="py-3 px-4 font-medium">SERVIÇO</th>
                <th className="py-3 px-4 font-medium">PROFISSIONAL</th>
                <th className="py-3 px-4 font-medium">HORÁRIO</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium">VALOR TOTAL</th>
                <th className="py-3 px-4 font-medium text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38342b]">
              {controller.comandas.map((item) => {
                const isFinalizada = item.comandaStatus === 'finalizada';
                return (
                  <tr key={item.comandaId} className="hover:bg-[#2d2a20]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#e9c340]">{item.comandaNumero}</td>
                    <td className="py-3.5 px-4 font-sora font-semibold text-[#eae2d3]">{item.clienteNome}</td>
                    <td className="py-3.5 px-4 text-[#d0c6af]">{item.servico}</td>
                    <td className="py-3.5 px-4 text-[#d0c6af]">{item.profissionalNome}</td>
                    <td className="py-3.5 px-4 font-mono text-[#99907b]">{item.horarioInicio} - {item.horarioFim}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-[10px] px-2.5 py-1 rounded-md uppercase font-semibold border ${
                          isFinalizada
                            ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
                            : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30'
                        }`}
                      >
                        {isFinalizada ? 'FINALIZADA' : 'RASCUNHO'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#eae2d3]">{formatCurrency(item.valor)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => controller.handleItemClick(item)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          isFinalizada
                            ? 'bg-[#2d2a20] hover:bg-[#3d392f] border border-[#38342b] text-[#eae2d3]'
                            : 'bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00]'
                        }`}
                      >
                        {isFinalizada ? 'Ver Detalhes' : 'Abrir Comanda'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {controller.comandas.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#99907b] text-xs">
                    {controller.carregando ? 'Carregando comandas...' : 'Nenhuma comanda encontrada.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        {controller.totalComandasFiltradas > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-[#110e06] border-t border-[#38342b] text-xs text-[#99907b]">
            {/* Informações de quantidade e seletor */}
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Mostrando <strong className="text-[#eae2d3] font-mono">{controller.inicioItem}</strong> a{' '}
                <strong className="text-[#eae2d3] font-mono">{controller.fimItem}</strong> de{' '}
                <strong className="text-[#eae2d3] font-mono">{controller.totalItens}</strong> comandas
              </span>

              <div className="flex items-center gap-1.5 ml-2 border-l border-[#38342b] pl-3">
                <span>Exibir:</span>
                <select
                  value={controller.itensPorPagina}
                  onChange={(e) => controller.setItensPorPagina(Number(e.target.value))}
                  className="bg-[#1f1b13] border border-[#38342b] rounded px-2 py-1 text-xs text-[#eae2d3] focus:border-[#e9c340] outline-none cursor-pointer"
                >
                  <option value={5}>5 por pág.</option>
                  <option value={10}>10 por pág.</option>
                  <option value={20}>20 por pág.</option>
                  <option value={50}>50 por pág.</option>
                </select>
              </div>
            </div>

            {/* Controles de Navegação de Página */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => controller.setPaginaAtual(1)}
                disabled={controller.paginaAtual === 1}
                className="px-2.5 py-1 rounded bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] hover:bg-[#2d2a20] disabled:opacity-40 disabled:hover:bg-[#1f1b13] disabled:cursor-not-allowed transition-all font-mono"
                title="Primeira Página"
              >
                &laquo;
              </button>
              <button
                type="button"
                onClick={controller.paginaAnterior}
                disabled={controller.paginaAtual === 1}
                className="px-3 py-1 rounded bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] hover:bg-[#2d2a20] disabled:opacity-40 disabled:hover:bg-[#1f1b13] disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1 px-2 font-mono text-xs">
                <span className="text-[#e9c340] font-bold">{controller.paginaAtual}</span>
                <span>/</span>
                <span>{controller.totalPaginas}</span>
              </div>

              <button
                type="button"
                onClick={controller.proximaPagina}
                disabled={controller.paginaAtual >= controller.totalPaginas}
                className="px-3 py-1 rounded bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] hover:bg-[#2d2a20] disabled:opacity-40 disabled:hover:bg-[#1f1b13] disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Próxima
              </button>
              <button
                type="button"
                onClick={() => controller.setPaginaAtual(controller.totalPaginas)}
                disabled={controller.paginaAtual >= controller.totalPaginas}
                className="px-2.5 py-1 rounded bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] hover:bg-[#2d2a20] disabled:opacity-40 disabled:hover:bg-[#1f1b13] disabled:cursor-not-allowed transition-all font-mono"
                title="Última Página"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
