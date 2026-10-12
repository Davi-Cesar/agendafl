import React from 'react';
import { useDetalhesComandaViewController, DetalhesComandaViewProps } from './controller';
import { FORMAS_PAGAMENTO_OPTIONS } from '../../types/comandas.types';
import { formatCurrency } from '@shared/lib/utils';

export function DetalhesComandaView({ dados }: DetalhesComandaViewProps) {
  const controller = useDetalhesComandaViewController(dados);
  const { dados: dadosComanda, itensParaExibir, temAniversariante } = controller;

  const pagamentos = dadosComanda?.pagamentos || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter overflow-y-auto p-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b border-[#38342b] pb-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs font-mono text-[#99907b] hover:text-[#e9c340] flex items-center gap-1 transition-colors cursor-pointer"
            onClick={controller.handleVoltarAgenda}
          >
            &larr; Voltar para Agenda
          </button>
          <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">
            Comanda {dadosComanda?.comandaNumero || '#0001'}
          </h1>
          <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 font-mono text-[11px] px-3 py-0.5 rounded-full uppercase font-semibold">
            FINALIZADA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-[#110e06] border border-[#38342b] hover:border-[#99907b] text-[#eae2d3] text-xs font-mono rounded-lg transition-colors cursor-pointer"
            onClick={controller.handleImprimirComprovante}
          >
            🖨️ Imprimir Comprovante
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] text-xs font-sora font-bold rounded-lg transition-colors cursor-pointer"
            onClick={controller.handleIrParaComandas}
          >
            Voltar para Comandas &rarr;
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Coluna Esquerda: Dados do Cliente e Serviços Realizados */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Cliente */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 shadow-md">
            <h3 className="font-sora font-semibold text-sm text-[#e9c340] mb-3">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">CLIENTE</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-[#eae2d3] text-sm">
                    {dadosComanda?.clienteNome || 'Cliente'}
                  </span>
                  {temAniversariante && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e9c340]/20 text-[#e9c340] border border-[#e9c340]/50 shadow-sm">
                      <span>🎂</span>
                      <span>Aniversariante</span>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">HORÁRIO</span>
                <span className="font-mono text-[#eae2d3] text-sm">
                  {dadosComanda?.horarioInicio || '09:00'} às {dadosComanda?.horarioFim || '10:00'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Serviços Realizados */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 shadow-md">
            <h3 className="font-sora font-semibold text-sm text-[#e9c340] mb-4">Serviços Realizados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#38342b] font-mono text-[#99907b]">
                    <th className="pb-3 px-2 font-medium">DESCRIÇÃO</th>
                    <th className="pb-3 px-2 font-medium">PROFISSIONAL</th>
                    <th className="pb-3 px-2 font-medium text-center">QTD</th>
                    <th className="pb-3 px-2 font-medium text-center">DESCONTO</th>
                    <th className="pb-3 px-2 font-medium text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38342b]/50">
                  {itensParaExibir.map((item: any) => {
                    const qtd = Number(item.quantidade || 1);
                    const precoUnit = Number(item.valorUnitario || item.preco_unitario || item.valor || 0);
                    const valBruto = qtd * precoUnit;

                    let descValor = 0;
                    if (item.desconto) {
                      if (item.desconto.tipo === 'percentual') {
                        descValor = valBruto * (item.desconto.valor / 100);
                      } else {
                        descValor = Math.min(valBruto, item.desconto.valor);
                      }
                    } else if (item.desconto_valor) {
                      if (item.desconto_tipo === 'percentual') {
                        descValor = valBruto * (item.desconto_valor / 100);
                      } else {
                        descValor = Math.min(valBruto, item.desconto_valor);
                      }
                    }

                    const valLiquido = Math.max(0, valBruto - descValor);
                    const temDesconto = descValor > 0;
                    const isAniversario =
                      item.desconto?.origem === 'aniversario' || item.desconto_origem === 'aniversario';

                    return (
                      <tr key={item.id} className="hover:bg-[#2d2a20]/40 transition-colors">
                        <td className="py-3 px-2 font-medium text-[#eae2d3]">
                          {item.descricao || item.servicos?.nome || 'Serviço'}
                        </td>
                        <td className="py-3 px-2 text-[#d0c6af]">
                          {item.profissional || item.profissionais?.nome || 'Profissional'}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[#eae2d3]">
                          {qtd}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {temDesconto ? (
                            isAniversario ? (
                              <span className="px-2 py-0.5 rounded bg-[#e9c340]/20 text-[#e9c340] border border-[#e9c340]/40 font-mono text-[11px] font-semibold">
                                🎂 Aniversário (-10%)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[#2d2a20] text-[#d0c6af] border border-[#38342b] font-mono text-[11px] font-semibold">
                                🏷️ -{formatCurrency(descValor)}
                              </span>
                            )
                          ) : (
                            <span className="text-[#99907b] text-[11px] font-mono">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-semibold">
                          {temDesconto ? (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-[#99907b] line-through font-normal">
                                {formatCurrency(valBruto)}
                              </span>
                              <span className="text-[#e9c340]">
                                {formatCurrency(valLiquido)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#e9c340]">
                              {formatCurrency(valBruto)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Resumo de Valores e Comprovante de Pagamento */}
        <div className="space-y-6">
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 space-y-4 shadow-md">
            <h3 className="font-sora font-semibold text-sm text-[#e9c340] mb-2">Resumo da Quitação</h3>

            <div className="space-y-2 text-xs border-b border-[#38342b] pb-3">
              <div className="flex justify-between items-center text-[#d0c6af]">
                <span>Subtotal:</span>
                <span className="font-mono text-[#eae2d3]">
                  {formatCurrency(dadosComanda?.subtotal || dadosComanda?.valorTotal || dadosComanda?.valor || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#d0c6af]">
                <span>Desconto:</span>
                <span className="font-mono text-[#eae2d3]">
                  {formatCurrency(dadosComanda?.desconto || 0)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 font-sora font-bold text-base text-[#eae2d3]">
              <span>Total Quitado:</span>
              <span className="font-mono text-xl text-[#10b981]">
                {formatCurrency(dadosComanda?.valorTotal || dadosComanda?.valor || 0)}
              </span>
            </div>

            {/* Badges dos Meios de Pagamento Utilizados */}
            <div className="pt-3 border-t border-[#38342b] space-y-2">
              <span className="block font-mono text-[10px] text-[#99907b] uppercase">
                FORMA(S) DE PAGAMENTO
              </span>
              {pagamentos.length > 0 ? (
                pagamentos.map((p: any, idx: number) => {
                  let label = p.detalheConta || p.forma;
                  const opt = FORMAS_PAGAMENTO_OPTIONS.find((o) => o.id === p.forma);
                  if (opt) {
                    label = opt.label;
                  } else if (p.forma === 'dinheiro') {
                    label = 'DINHEIRO';
                  } else if (p.forma === 'cartao_credito' || p.forma === 'credito') {
                    label = 'CARTÃO CRÉDITO';
                  } else if (p.forma === 'cartao_debito' || p.forma === 'debito') {
                    label = 'CARTÃO DÉBITO';
                  } else if (p.forma === 'pix') {
                    label = p.detalheConta || 'PIX';
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#110e06] border border-[#10b981]/40 rounded px-3 py-2 text-xs font-mono"
                    >
                      <span className="text-[#10b981] font-bold">✓ {label}</span>
                      <span className="text-[#eae2d3]">{formatCurrency(p.valor)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-between bg-[#110e06] border border-[#10b981]/40 rounded px-3 py-2 text-xs font-mono">
                  <span className="text-[#10b981] font-bold">✓ REGISTRADO NO CAIXA</span>
                  <span className="text-[#eae2d3]">
                    {formatCurrency(dadosComanda?.valorTotal || dadosComanda?.valor || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
