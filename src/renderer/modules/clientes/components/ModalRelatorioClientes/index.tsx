import React from 'react';
import { useModalRelatorioClientesController } from './controller';
import { formatarDataBR } from '@shared/lib/formatters';
import { formatCurrency } from '@shared/lib/utils';
import { DatePicker } from '@shared/ui/DatePicker';

export function ModalRelatorioClientes() {
  const controller = useModalRelatorioClientesController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho da Modal */}
        <div className="flex items-center justify-between border-b border-[#38342b] px-6 py-4 bg-[#16130b] shrink-0">
          <div>
            <h2 className="font-sora font-bold text-lg text-[#eae2d3]">
              Relatório de Atendimentos de Clientes
            </h2>
            <p className="font-inter text-xs text-[#99907b]">
              Histórico consolidado de clientes, serviços realizados, datas e profissionais.
            </p>
          </div>
          <button
            type="button"
            className="text-[#99907b] hover:text-[#eae2d3] p-1 rounded-md transition-colors cursor-pointer"
            onClick={controller.handleFechar}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="p-4 bg-[#16130b]/60 border-b border-[#38342b] flex flex-wrap items-center gap-3 text-xs shrink-0">
          {/* Busca por Texto */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por cliente, serviço, profissional ou comanda..."
              className="w-full bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] text-xs rounded-md px-3 py-2 focus:outline-none focus:border-[#e9c340]"
              value={controller.busca}
              onChange={(e) => controller.setBusca(e.target.value)}
            />
          </div>

          {/* Filtro por Data */}
          <div className="w-40">
            <DatePicker
              value={controller.filtroData}
              onChange={(val) => controller.setFiltroData(val)}
              size="sm"
              placeholder="Filtrar por data"
            />
          </div>

          {/* Filtro por Profissional */}
          <div>
            <select
              className="bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] text-xs rounded-md px-3 py-2 focus:outline-none focus:border-[#e9c340] cursor-pointer"
              value={controller.filtroProfissional}
              onChange={(e) => controller.setFiltroProfissional(e.target.value)}
            >
              <option value="todos">Todos os Profissionais</option>
              {controller.listaProfissionais.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Serviço */}
          <div>
            <select
              className="bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] text-xs rounded-md px-3 py-2 focus:outline-none focus:border-[#e9c340] cursor-pointer max-w-[200px]"
              value={controller.filtroServico}
              onChange={(e) => controller.setFiltroServico(e.target.value)}
            >
              <option value="todos">Todos os Serviços</option>
              {controller.listaServicos.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {controller.temFiltrosAtivos && (
            <button
              type="button"
              className="text-[#e9c340] hover:underline px-2 py-1 cursor-pointer font-inter text-xs"
              onClick={controller.handleLimparFiltros}
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Tabela de Histórico Geral */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#38342b] font-mono text-[#99907b] bg-[#16130b]/40">
                <th className="py-2.5 px-3 font-medium">DATA / HORA</th>
                <th className="py-2.5 px-3 font-medium">CLIENTE</th>
                <th className="py-2.5 px-3 font-medium">SERVIÇO</th>
                <th className="py-2.5 px-3 font-medium">PROFISSIONAL</th>
                <th className="py-2.5 px-3 font-medium">COMANDA</th>
                <th className="py-2.5 px-3 font-medium text-right">VALOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38342b]/40">
              {controller.carregandoRelatorio ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#99907b] font-mono text-xs">
                    Carregando relatório de atendimentos...
                  </td>
                </tr>
              ) : controller.itensFiltrados.length > 0 ? (
                controller.itensFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-[#2d2a20]/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-[#d0c6af] whitespace-nowrap">
                      <span>{formatarDataBR(item.data)}</span>
                      {item.horario && (
                        <span className="text-[#99907b] text-[10px] ml-1.5">{item.horario}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sora font-semibold text-[#eae2d3]">
                      {item.clienteNome}
                    </td>
                    <td className="py-3 px-3 text-[#d0c6af]">{item.servicoNome}</td>
                    <td className="py-3 px-3 text-[#d0c6af]">{item.profissionalNome}</td>
                    <td className="py-3 px-3 font-mono text-xs">
                      {item.comandaNumero ? (
                        <span className="text-[#e9c340] font-semibold">{item.comandaNumero}</span>
                      ) : (
                        <span className="text-[#99907b]">Agenda</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#eae2d3] whitespace-nowrap">
                      {formatCurrency(item.valor)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#99907b] font-mono text-xs">
                    Nenhum atendimento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Totais */}
        <div className="border-t border-[#38342b] px-6 py-4 bg-[#16130b] flex items-center justify-between shrink-0">
          <div className="font-mono text-xs text-[#99907b]">
            Total de Atendimentos: <strong className="text-[#eae2d3]">{controller.totalCount}</strong>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-inter text-xs text-[#99907b] block">Total Filtrado:</span>
              <span className="font-mono font-bold text-lg text-[#e9c340]">
                {formatCurrency(controller.totalValorFiltrado)}
              </span>
            </div>

            <button
              type="button"
              className="bg-[#1f1b13] hover:bg-[#2d2a20] text-[#eae2d3] border border-[#38342b] font-inter font-medium px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
              onClick={controller.handleFechar}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
