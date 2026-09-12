import React from 'react';
import { useModalRelatorioDetalhadoController } from './controller';
import { formatCurrency } from '@shared/lib/utils';

export function ModalRelatorioDetalhado() {
  const controller = useModalRelatorioDetalhadoController();
  const {
    modalAberto,
    fecharModal,
    relatorioItens,
    filtroProfissional,
    setFiltroProfissional,
    filtroFormaPagamento,
    setFiltroFormaPagamento,
    busca,
    setBusca,
    listaProfissionais,
    totalFiltrado,
    totalCount,
    handleLimparFiltros,
  } = controller;

  if (!modalAberto) return null;

  const formatFormaLabel = (forma: string, detalhe?: string) => {
    if (forma === 'pix') {
      return detalhe ? `PIX (${detalhe})` : 'PIX';
    }
    if (forma === 'dinheiro') return 'Dinheiro';
    if (forma === 'cartao_credito') return 'Cartão Crédito';
    if (forma === 'cartao_debito') return 'Cartão Débito';
    return forma.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-[#eae2d3]">
        {/* Cabeçalho da Modal */}
        <div className="flex items-center justify-between border-b border-[#38342b] px-6 py-4 bg-[#16130b]">
          <div>
            <h2 className="font-sora font-bold text-lg text-[#eae2d3]">
              Relatório Detalhado de Transações (RN-36)
            </h2>
            <p className="font-inter text-xs text-[#99907b]">
              Extrato analítico de comandas e pagamentos registrados no caixa.
            </p>
          </div>
          <button
            type="button"
            className="text-[#99907b] hover:text-[#eae2d3] p-1 rounded-md transition-colors cursor-pointer"
            onClick={fecharModal}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filtros da Tabela */}
        <div className="p-4 bg-[#16130b]/60 border-b border-[#38342b] flex flex-wrap items-center gap-3 text-xs">
          {/* Busca por Texto */}
          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="Buscar por cliente, serviço ou comanda..."
              className="w-full bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] text-xs rounded px-3 py-2 focus:outline-none focus:border-[#e9c340]"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Filtro por Profissional */}
          <div>
            <select
              className="bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] text-xs rounded px-3 py-2 focus:outline-none focus:border-[#e9c340] cursor-pointer"
              value={filtroProfissional}
              onChange={(e) => setFiltroProfissional(e.target.value)}
            >
              <option value="todos">Todos os Profissionais</option>
              {listaProfissionais.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Forma de Pagamento */}
          <div>
            <select
              className="bg-[#1f1b13] border border-[#38342b] text-[#eae2d3] text-xs rounded px-3 py-2 focus:outline-none focus:border-[#e9c340] cursor-pointer"
              value={filtroFormaPagamento}
              onChange={(e) => setFiltroFormaPagamento(e.target.value)}
            >
              <option value="todas">Todas as Formas de Pgto</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartão Crédito</option>
              <option value="cartao_debito">Cartão Débito</option>
            </select>
          </div>

          {(busca || filtroProfissional !== 'todos' || filtroFormaPagamento !== 'todas') && (
            <button
              type="button"
              className="text-[#e9c340] hover:underline px-2 py-1 cursor-pointer font-inter text-xs"
              onClick={handleLimparFiltros}
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Tabela de Extrato */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#38342b] font-mono text-[#99907b] bg-[#16130b]/40">
                <th className="py-2.5 px-3 font-medium">HORÁRIO</th>
                <th className="py-2.5 px-3 font-medium">COMANDA</th>
                <th className="py-2.5 px-3 font-medium">CLIENTE</th>
                <th className="py-2.5 px-3 font-medium">SERVIÇO</th>
                <th className="py-2.5 px-3 font-medium">PROFISSIONAL</th>
                <th className="py-2.5 px-3 font-medium">FORMA PGTO</th>
                <th className="py-2.5 px-3 font-medium text-right">VALOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38342b]/40">
              {relatorioItens.map((item, idx) => (
                <tr key={`${item.comandaId}-${idx}`} className="hover:bg-[#2d2a20]/30 transition-colors">
                  <td className="py-3 px-3 font-mono text-[#99907b]">{item.horario}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#e9c340]">{item.comandaNumero}</td>
                  <td className="py-3 px-3 font-sora font-semibold text-[#eae2d3]">{item.clienteNome}</td>
                  <td className="py-3 px-3 text-[#d0c6af]">{item.servicoNome}</td>
                  <td className="py-3 px-3 text-[#d0c6af]">{item.profissionalNome}</td>
                  <td className="py-3 px-3 font-mono text-xs text-[#eae2d3]">
                    {formatFormaLabel(item.formaPagamento, item.detalheConta)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#eae2d3]">
                    {formatCurrency(item.valor)}
                  </td>
                </tr>
              ))}
              {relatorioItens.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#99907b] font-mono text-xs">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Totais Filtrados */}
        <div className="border-t border-[#38342b] px-6 py-4 bg-[#16130b] flex items-center justify-between">
          <div className="font-mono text-xs text-[#99907b]">
            Total de Lançamentos: <strong className="text-[#eae2d3]">{totalCount}</strong>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-inter text-xs text-[#99907b] block">Total Filtrado:</span>
              <span className="font-mono font-bold text-lg text-[#e9c340]">
                {formatCurrency(totalFiltrado)}
              </span>
            </div>

            <button
              type="button"
              className="bg-[#1f1b13] hover:bg-[#2d2a20] text-[#eae2d3] border border-[#38342b] font-inter font-medium px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
              onClick={fecharModal}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
