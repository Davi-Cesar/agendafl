import React from 'react';
import { useCaixasAnterioresController } from './controller';
import { formatCurrency } from '@shared/lib/utils';

export function CaixasAnteriores() {
  const controller = useCaixasAnterioresController();
  const {
    historicoCaixas,
    caixaSelecionado,
    carregando,
    erro,
    handleSelecionarCaixa,
    handleVoltarLista,
    handleVerRelatorioHistorico,
  } = controller;

  const formatDateStr = (isoStr?: string) => {
    if (!isoStr) return '---';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Se um caixa histórico estiver selecionado, exibe os Detalhes do Fechamento
  if (caixaSelecionado) {
    const { caixa, transacoes, comissoes, totaisPix } = caixaSelecionado;

    return (
      <div className="flex flex-col gap-6">
        {/* Barra Superior do Detalhe */}
        <div className="flex items-center justify-between border-b border-[#38342b] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-[#1f1b13] hover:bg-[#2d2a20] text-[#eae2d3] border border-[#38342b] font-inter font-medium px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              onClick={handleVoltarLista}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Voltar para Lista
            </button>
            <div>
              <h2 className="font-sora font-bold text-lg text-[#eae2d3]">
                Fechamento de {formatDateStr(caixa.fechadoEm)}
              </h2>
              <span className="font-inter text-xs text-[#99907b]">
                Aberto em: {formatDateStr(caixa.abertoEm)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-[#2d2a20] text-[#e9c340] border border-[#e9c340]/40 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase">
              STATUS: FECHADO
            </span>
            <button
              type="button"
              className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md"
              onClick={() => handleVerRelatorioHistorico(caixa.id)}
            >
              Ver Relatório Detalhado
            </button>
          </div>
        </div>

        {/* Cards de Saldo Congelado no Fechamento (RN-29 / RN-32) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium mb-1">FUNDO INICIAL</span>
            <div className="font-mono font-bold text-2xl text-[#eae2d3]">
              {formatCurrency(caixa.saldoInicial)}
            </div>
            <span className="font-inter text-xs text-[#99907b] mt-1">Troco de abertura</span>
          </div>

          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium mb-1">DINHEIRO</span>
            <div className="font-mono font-bold text-2xl text-[#eae2d3]">
              {formatCurrency(caixa.saldoFinalDinheiro || 0)}
            </div>
            <span className="font-inter text-xs text-[#99907b] mt-1">Total em espécie</span>
          </div>

          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium mb-1">TOTAL PIX</span>
            <div className="font-mono font-bold text-2xl text-[#eae2d3]">
              {formatCurrency(caixa.saldoFinalPix || 0)}
            </div>
            <span className="font-inter text-xs text-[#99907b] mt-1">Total recebido via PIX</span>
          </div>

          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium mb-1">CARTÃO CRÉDITO</span>
            <div className="font-mono font-bold text-2xl text-[#eae2d3]">
              {formatCurrency(caixa.saldoFinalCartaoCredito || 0)}
            </div>
            <span className="font-inter text-xs text-[#99907b] mt-1">Crédito parcelado / à vista</span>
          </div>

          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium mb-1">CARTÃO DÉBITO</span>
            <div className="font-mono font-bold text-2xl text-[#eae2d3]">
              {formatCurrency(caixa.saldoFinalCartaoDebito || 0)}
            </div>
            <span className="font-inter text-xs text-[#99907b] mt-1">Débito imediato</span>
          </div>

          <div className="bg-[#1f1b13] border border-[#e9c340]/40 rounded-lg p-5 flex flex-col justify-between bg-gradient-to-br from-[#1f1b13] to-[#2d2a20]/40">
            <span className="font-mono text-[11px] text-[#e9c340] uppercase font-bold mb-1">FATURAMENTO BRUTO</span>
            <div className="font-mono font-bold text-2xl text-[#e9c340]">
              {formatCurrency(caixa.totalGeral || 0)}
            </div>
            <span className="font-inter text-xs text-[#d0c6af] mt-1">
              Líquido: {formatCurrency(caixa.valorLiquido || 0)}
            </span>
          </div>
        </div>

        {/* Snapshot Granular por Conta PIX (RN-32) */}
        {totaisPix.length > 0 && (
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5">
            <h3 className="font-sora font-semibold text-sm text-[#eae2d3] mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#e9c340]">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Detalhamento de Contas PIX no Fechamento (Snapshot RN-32)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {totaisPix.map((pix) => (
                <div key={pix.nomeConta} className="bg-[#16130b] border border-[#38342b] p-3 rounded flex flex-col">
                  <span className="font-mono text-xs text-[#e9c340] font-semibold">{pix.nomeConta}</span>
                  <span className="font-mono font-bold text-base text-[#eae2d3] mt-1">
                    {formatCurrency(pix.total)}
                  </span>
                  <span className="font-inter text-[11px] text-[#99907b]">
                    {pix.quantidade} {pix.quantidade === 1 ? 'transação' : 'transações'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela de Transações Individuais do Caixa Fechado (Ponto 2 do Usuário) */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg overflow-hidden shadow-md flex flex-col">
          <div className="py-3 px-4 bg-[#110e06]/60 border-b border-[#38342b] flex items-center justify-between">
            <h3 className="font-sora font-semibold text-sm text-[#eae2d3]">
              Transações Registradas Neste Caixa
            </h3>
            <span className="font-mono text-xs text-[#99907b]">
              Total Transações: <strong className="text-[#eae2d3]">{transacoes.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#38342b] font-mono text-[#99907b] bg-[#110e06]/50">
                  <th className="py-3 px-4 font-medium">HORÁRIO</th>
                  <th className="py-3 px-4 font-medium">CLIENTE / SERVIÇO</th>
                  <th className="py-3 px-4 font-medium">MÉTODO</th>
                  <th className="py-3 px-4 font-medium text-right">VALOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38342b]/50">
                {transacoes.map((item) => (
                  <tr key={item.id} className="hover:bg-[#2d2a20]/30 transition-colors">
                    <td className="py-4 px-4 font-mono text-[#99907b]">{item.horario}</td>
                    <td className="py-4 px-4">
                      <div className="font-sora font-semibold text-[#eae2d3] text-sm mb-0.5">{item.clienteNome}</div>
                      <div className="font-inter text-xs text-[#d0c6af]">{item.servicoNome}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-semibold text-[#e9c340] uppercase">
                      {item.metodo}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-[#eae2d3]">
                      {formatCurrency(item.valor)}
                    </td>
                  </tr>
                ))}
                {transacoes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[#99907b] font-mono text-xs">
                      Nenhuma transação registrada para este caixa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Snapshot Congelado de Comissões por Profissional (RN-35) */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg overflow-hidden shadow-md flex flex-col">
          <div className="py-3 px-4 bg-[#110e06]/60 border-b border-[#38342b] flex items-center justify-between">
            <h3 className="font-sora font-semibold text-sm text-[#eae2d3]">
              Comissões Congeladas no Fechamento (Snapshot RN-35)
            </h3>
            <span className="font-mono text-xs text-[#99907b]">
              Total Comissões: <strong className="text-[#e9c340]">{formatCurrency(caixa.totalComissoes || 0)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#38342b] font-mono text-[#99907b] bg-[#110e06]/50">
                  <th className="py-3 px-4 font-medium">PROFISSIONAL</th>
                  <th className="py-3 px-4 font-medium">SERVIÇOS REALIZADOS</th>
                  <th className="py-3 px-4 font-medium text-right">COMISSÃO CONGELADA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38342b]/50">
                {comissoes.map((item) => (
                  <tr key={item.profissionalId} className="hover:bg-[#2d2a20]/30 transition-colors">
                    <td className="py-4 px-4 font-sora font-semibold text-[#eae2d3] text-sm">
                      {item.profissionalNome}
                    </td>
                    <td className="py-4 px-4 font-mono text-[#d0c6af]">
                      {item.quantidadeServicos} {item.quantidadeServicos === 1 ? 'serviço' : 'serviços'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-[#eae2d3]">
                      {formatCurrency(item.totalComissao)}
                    </td>
                  </tr>
                ))}
                {comissoes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-[#99907b] font-mono text-xs">
                      Nenhuma comissão gravada neste fechamento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {caixa.observacoes && (
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-4 font-inter text-xs text-[#d0c6af]">
            <strong className="text-[#eae2d3] font-sora block mb-1">Observações do Fechamento:</strong>
            {caixa.observacoes}
          </div>
        )}
      </div>
    );
  }

  // Tabela Principal de Listagem de Caixas Anteriores (Fechados)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-sora font-semibold text-sm text-[#eae2d3]">Histórico de Caixas Fechados</h2>
        <span className="font-mono text-xs text-[#99907b]">
          Total de Fechamentos: <strong className="text-[#e9c340]">{historicoCaixas.length}</strong>
        </span>
      </div>

      {erro && (
        <div className="bg-[#3c1313] border border-[#7a2222] text-[#f8a5a5] px-4 py-3 rounded-lg text-xs font-inter">
          {erro}
        </div>
      )}

      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#38342b] font-mono text-[#99907b] bg-[#110e06]/50">
                <th className="py-3 px-4 font-medium">DATA FECHAMENTO</th>
                <th className="py-3 px-4 font-medium">FUNDO INICIAL</th>
                <th className="py-3 px-4 font-medium">FATURAMENTO BRUTO</th>
                <th className="py-3 px-4 font-medium">COMISSÕES</th>
                <th className="py-3 px-4 font-medium">VALOR LÍQUIDO</th>
                <th className="py-3 px-4 font-medium text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38342b]/50">
              {historicoCaixas.map((caixa) => (
                <tr key={caixa.id} className="hover:bg-[#2d2a20]/30 transition-colors">
                  <td className="py-4 px-4 font-mono font-semibold text-[#eae2d3]">
                    {formatDateStr(caixa.fechadoEm)}
                  </td>
                  <td className="py-4 px-4 font-mono text-[#d0c6af]">
                    {formatCurrency(caixa.saldoInicial)}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-[#e9c340]">
                    {formatCurrency(caixa.totalGeral || 0)}
                  </td>
                  <td className="py-4 px-4 font-mono text-[#d0c6af]">
                    {formatCurrency(caixa.totalComissoes || 0)}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-[#eae2d3]">
                    {formatCurrency(caixa.valorLiquido || 0)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      className="bg-[#16130b] hover:bg-[#2d2a20] text-[#e9c340] border border-[#38342b] font-inter font-medium px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
                      onClick={() => handleSelecionarCaixa(caixa.id)}
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {historicoCaixas.length === 0 && !carregando && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#99907b] font-mono text-xs">
                    Nenhum caixa fechado registrado no histórico.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
