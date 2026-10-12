import React from 'react';
import { useCriarComandaViewController, CriarComandaViewProps } from './controller';
import { ModalAdicionarServico } from '../../components/ModalAdicionarServico';
import { ModalDescontoItem } from '../../components/ModalDescontoItem';
import { FORMAS_PAGAMENTO_OPTIONS } from '../../types/comandas.types';
import { formatCurrency } from '@shared/lib/utils';

export function CriarComandaView({ dados }: CriarComandaViewProps) {
  const controller = useCriarComandaViewController(dados);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter overflow-y-auto p-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b border-[#38342b] pb-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs font-mono text-[#99907b] hover:text-[#e9c340] flex items-center gap-1 transition-colors cursor-pointer"
            onClick={controller.handleVoltar}
          >
            &larr; Voltar para Agenda
          </button>
          <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">
            Comanda {controller.dados?.comandaNumero || '#6094'}
          </h1>
          <span className="bg-[#e9c340]/15 text-[#e9c340] border border-[#e9c340]/40 font-mono text-[11px] px-3 py-0.5 rounded-full uppercase font-semibold">
            RASCUNHO
          </span>
        </div>
      </header>

      {/* Banner de Aniversário de HOJE (mesmo se já tiver usado o cupom) */}
      {controller.isAniversarianteHoje && !controller.elegibilidadeAniversario.elegivel && (
        <div className="mb-6 bg-[#2d2a20] border-2 border-[#e9c340]/80 rounded-xl p-4 shadow-lg flex items-center gap-3.5 animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-[#e9c340]/20 border border-[#e9c340]/60 flex items-center justify-center text-xl shrink-0">
            🎂
          </div>
          <div>
            <h4 className="font-sora font-bold text-sm text-[#e9c340] flex items-center gap-2">
              🎉 Hoje é o Aniversário de {controller.dados?.clienteNome || controller.cliente?.nome || 'este cliente'}!
            </h4>
            <p className="text-xs text-[#d0c6af] mt-0.5">
              Não se esqueça de desejar um <strong>Feliz Aniversário</strong> em nome de toda a equipe do salão! 🥳
            </p>
          </div>
        </div>
      )}

      {/* Banner de Sugestão de Aniversário (quando elegível ao cupom) */}
      {controller.elegibilidadeAniversario.elegivel && (
        <div className="mb-6">
          {!controller.itemComCupomAniversario ? (
            <div className="bg-[#2d2a20] border border-[#e9c340]/50 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#e9c340]/20 border border-[#e9c340]/40 flex items-center justify-center text-xl shrink-0">
                  🎂
                </div>
                <div>
                  <h4 className="font-sora font-bold text-sm text-[#e9c340] flex items-center gap-2">
                    {controller.isAniversarianteHoje
                      ? '🎉 Hoje é Aniversário do Cliente!'
                      : '🎂 Cliente Aniversariante deste Mês!'}
                    {controller.isAniversarianteHoje && (
                      <span className="text-[10px] font-bold font-mono uppercase bg-[#e9c340] text-[#3c2f00] px-2 py-0.5 rounded-full shadow-sm">
                        É HOJE!
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#d0c6af] mt-0.5">
                    {controller.isAniversarianteHoje
                      ? `Deseje parabéns e aplique o cupom comemorativo de 10% de desconto em um serviço!`
                      : 'Ofereça 10% de desconto de aniversário em um dos serviços desta comanda (uso único no ano).'}
                  </p>
                </div>
              </div>

              {controller.itens.length === 1 ? (
                <button
                  type="button"
                  onClick={() => controller.handleAplicarCupomAniversario(controller.itens[0].id)}
                  className="px-4 py-2 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer shrink-0"
                >
                  Aplicar 10% no Serviço
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#99907b] hidden md:inline">Clique em "+ Desconto" na tabela abaixo para escolher o item.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#10b981]/15 border border-[#10b981]/40 rounded-xl p-4 shadow-md flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎉</span>
                <div>
                  <span className="font-sora font-bold text-xs text-[#10b981] block">
                    Cupom de Aniversário (10%) Aplicado!
                  </span>
                  <span className="text-xs text-[#d0c6af]">
                    Serviço contemplado: <strong>{controller.itemComCupomAniversario.descricao}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={controller.handleRemoverCupomAniversario}
                className="px-3 py-1.5 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Remover Cupom
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid Principal (2 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Dados do Cliente + Tabela de Itens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Dados do Cliente */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 shadow-md">
            <h3 className="font-sora font-semibold text-sm text-[#e9c340] mb-4">Dados do Cliente</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">CLIENTE</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-[#eae2d3] text-sm">
                    {controller.dados?.clienteNome || controller.cliente?.nome || 'Cliente não identificado'}
                  </span>
                  {controller.isAniversarianteHoje && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e9c340]/20 text-[#e9c340] border border-[#e9c340]/60 shadow-[0_0_12px_rgba(233,195,64,0.35)]"
                      title="Hoje é o aniversário deste cliente!"
                    >
                      <span>🎂</span>
                      <span>Aniversariante do dia!</span>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">HORÁRIO</span>
                <span className="font-mono text-[#eae2d3] text-sm">
                  {controller.dados?.horarioInicio || '09:30'} - {controller.dados?.horarioFim || '11:00'}
                </span>
              </div>
              {controller.cliente?.dataNascimento && (
                <div>
                  <span className="block font-mono text-[10px] text-[#99907b] uppercase mb-1">ANIVERSÁRIO</span>
                  <span className="font-mono text-[#eae2d3] text-sm flex items-center gap-1.5">
                    {controller.cliente.dataNascimento.split('-').reverse().join('/')}
                    {controller.isAniversarianteHoje ? (
                      <span className="text-[#e9c340] font-bold text-xs bg-[#e9c340]/20 px-2 py-0.5 rounded border border-[#e9c340]/50 flex items-center gap-1">
                        🎂 É HOJE!
                      </span>
                    ) : controller.elegibilidadeAniversario.elegivel ? (
                      <span className="text-[#e9c340] text-xs font-mono" title="Aniversariante deste mês">
                        🎂 (este mês)
                      </span>
                    ) : null}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Itens da Comanda */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora font-semibold text-sm text-[#e9c340]">Itens da Comanda</h3>
              <span className="font-mono text-xs text-[#99907b]">
                {controller.itens.length} {controller.itens.length === 1 ? 'Item' : 'Itens'}
              </span>
            </div>

            {/* Tabela de Itens */}
            <div className="overflow-x-auto border-b border-[#38342b] pb-4 mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#38342b] font-mono text-[#99907b]">
                    <th className="pb-3 px-2 font-medium">DESCRIÇÃO</th>
                    <th className="pb-3 px-2 font-medium">PROFISSIONAL</th>
                    <th className="pb-3 px-2 font-medium text-center">QTD</th>
                    <th className="pb-3 px-2 font-medium text-right">UNITÁRIO</th>
                    <th className="pb-3 px-2 font-medium text-center">DESCONTO</th>
                    <th className="pb-3 px-2 font-medium text-right">TOTAL</th>
                    <th className="pb-3 px-2 font-medium text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38342b]/50">
                  {controller.itens.map((item) => {
                    const descValor = controller.calcularDescontoItem(item);
                    const totalLinhaBruto = item.quantidade * item.valorUnitario;
                    const totalLinhaLiquido = Math.max(0, totalLinhaBruto - descValor);
                    const temDesconto = descValor > 0;
                    const isAniversario = item.desconto?.origem === 'aniversario';

                    return (
                      <tr key={item.id} className="hover:bg-[#2d2a20]/40 transition-colors">
                        <td className="py-3.5 px-2 font-medium text-[#eae2d3]">
                          {item.descricao}
                        </td>
                        <td className="py-3.5 px-2 text-[#d0c6af]">{item.profissional}</td>
                        <td className="py-3.5 px-2 text-center font-mono text-[#eae2d3]">
                          {item.quantidade}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono text-[#eae2d3]">
                          {formatCurrency(item.valorUnitario)}
                        </td>

                        {/* Coluna Desconto por Item */}
                        <td className="py-3.5 px-2 text-center">
                          {temDesconto ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => controller.abrirModalDesconto(item)}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border cursor-pointer transition-all ${
                                  isAniversario
                                    ? 'bg-[#e9c340]/20 text-[#e9c340] border-[#e9c340]/40 hover:bg-[#e9c340]/30'
                                    : 'bg-[#2d2a20] text-[#d0c6af] border-[#38342b] hover:border-[#e9c340]'
                                }`}
                                title="Clique para editar este desconto"
                              >
                                {isAniversario ? '🎂 Aniversário (-10%)' : `🏷️ -${formatCurrency(descValor)}`}
                              </button>
                              <button
                                type="button"
                                onClick={() => controller.handleRemoverDescontoItem(item.id)}
                                className="text-[#ffb4ab] hover:text-[#93000a] text-xs font-bold p-0.5 cursor-pointer"
                                title="Remover desconto deste item"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => controller.abrirModalDesconto(item)}
                              className="px-2 py-1 rounded border border-dashed border-[#38342b] hover:border-[#e9c340] text-[#99907b] hover:text-[#e9c340] text-[11px] font-mono transition-colors cursor-pointer"
                            >
                              + Desconto
                            </button>
                          )}
                        </td>

                        {/* Total da Linha (Líquido) */}
                        <td className="py-3.5 px-2 text-right font-mono font-semibold">
                          {temDesconto ? (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-[#99907b] line-through font-normal">
                                {formatCurrency(totalLinhaBruto)}
                              </span>
                              <span className="text-[#e9c340]">
                                {formatCurrency(totalLinhaLiquido)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#eae2d3]">
                              {formatCurrency(totalLinhaBruto)}
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-2 text-right">
                          <button
                            type="button"
                            className="text-[#ffb4ab] hover:text-[#93000a] text-xs font-medium transition-colors cursor-pointer"
                            onClick={() => controller.handleRemoverItem(item.id)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {controller.itens.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#99907b] text-xs">
                        Nenhum item adicionado à comanda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Botão + ADICIONAR SERVIÇO */}
            <button
              type="button"
              className="w-full py-3 border-2 border-dashed border-[#38342b] hover:border-[#e9c340] bg-[#110e06]/50 hover:bg-[#110e06] rounded-lg text-xs font-mono text-[#eae2d3] flex items-center justify-center gap-2 transition-all cursor-pointer group"
              onClick={() => controller.setModalAdicionarAberto(true)}
            >
              <span className="w-5 h-5 rounded-full border border-[#99907b] group-hover:border-[#e9c340] flex items-center justify-center text-sm font-bold text-[#99907b] group-hover:text-[#e9c340]">
                +
              </span>
              <span>ADICIONAR SERVIÇO</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita: Resumo Financeiro & Forma de Pagamento */}
        <div>
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 space-y-6 shadow-md">
            <div>
              <span className="block font-mono text-[10px] text-[#99907b] uppercase tracking-wider mb-3">
                RESUMO DE VALORES
              </span>

              <div className="space-y-3 text-xs border-b border-[#38342b] pb-4">
                <div className="flex justify-between items-center text-[#d0c6af]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#eae2d3] font-semibold">
                    {formatCurrency(controller.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#d0c6af]">
                  <span>Descontos</span>
                  <span className={`font-mono font-semibold ${controller.desconto > 0 ? 'text-[#e9c340]' : 'text-[#eae2d3]'}`}>
                    {controller.desconto > 0 ? `- ${formatCurrency(controller.desconto)}` : 'R$ 0,00'}
                  </span>
                </div>

                {controller.itemComCupomAniversario && (
                  <div className="bg-[#e9c340]/10 border border-[#e9c340]/30 rounded px-2.5 py-1.5 text-[11px] text-[#e9c340] flex items-center justify-between">
                    <span>🎂 Cupom de Aniversário (10%)</span>
                    <span className="font-mono font-bold">
                      - {formatCurrency(controller.calcularDescontoItem(controller.itemComCupomAniversario))}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Geral */}
              <div className="flex justify-between items-center pt-3">
                <span className="font-sora font-semibold text-sm text-[#eae2d3]">Total a Pagar</span>
                <span className="font-mono text-2xl font-bold text-[#e9c340]">
                  {formatCurrency(controller.total)}
                </span>
              </div>
            </div>

            {/* Seção Forma de Pagamento */}
            <div className="border-t border-[#38342b] pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="block font-mono text-[10px] text-[#99907b] uppercase tracking-wider">
                  FORMA DE PAGAMENTO
                </span>
                <button
                  type="button"
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    controller.dividirPagamento
                      ? 'bg-[#e9c340]/20 text-[#e9c340] border-[#e9c340]/50 font-bold'
                      : 'bg-[#110e06] text-[#99907b] border-[#38342b] hover:text-[#eae2d3]'
                  }`}
                  onClick={() => controller.setDividirPagamento(!controller.dividirPagamento)}
                >
                  {controller.dividirPagamento ? '✓ Dividir em 2 Formas' : '+ Dividir Pagamento'}
                </button>
              </div>

              {/* Seção 1ª Forma de Pagamento */}
              <div className="space-y-2">
                {controller.dividirPagamento && (
                  <span className="block font-mono text-[10px] text-[#e9c340]">1ª FORMA DE PAGAMENTO:</span>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {FORMAS_PAGAMENTO_OPTIONS.map((opt) => {
                    const ativo = controller.formaPagamento1 === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          ativo
                            ? 'bg-[#2d2a20] border-[#e9c340] text-[#e9c340] font-bold shadow-md'
                            : 'bg-[#110e06] border-[#38342b] text-[#99907b] hover:border-[#99907b] hover:text-[#eae2d3]'
                        }`}
                        onClick={() => controller.setFormaPagamento1(opt.id)}
                      >
                        <span className="font-mono text-[11px] uppercase tracking-wider">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {controller.dividirPagamento && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-xs text-[#99907b]">Valor 1ª Forma: R$</span>
                    <input
                      type="number"
                      min="0"
                      max={controller.total}
                      value={controller.valorForma1}
                      onChange={(e) => controller.handleAlterarValorForma1(Number(e.target.value))}
                      className="flex-1 bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded px-2 py-1 text-xs font-mono text-[#eae2d3]"
                    />
                  </div>
                )}
              </div>

              {/* Seção 2ª Forma de Pagamento (se divisão ativa) */}
              {controller.dividirPagamento && (
                <div className="space-y-2 pt-3 border-t border-[#38342b]/60">
                  <span className="block font-mono text-[10px] text-[#e9c340]">2ª FORMA DE PAGAMENTO:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {FORMAS_PAGAMENTO_OPTIONS.map((opt) => {
                      const ativo = controller.formaPagamento2 === opt.id;
                      return (
                        <button
                          key={`2nd-${opt.id}`}
                          type="button"
                          className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            ativo
                              ? 'bg-[#2d2a20] border-[#e9c340] text-[#e9c340] font-bold shadow-md'
                              : 'bg-[#110e06] border-[#38342b] text-[#99907b] hover:border-[#99907b] hover:text-[#eae2d3]'
                          }`}
                          onClick={() => controller.setFormaPagamento2(opt.id)}
                        >
                          <span className="font-mono text-[11px] uppercase tracking-wider">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-xs text-[#99907b]">Valor 2ª Forma: R$</span>
                    <input
                      type="number"
                      min="0"
                      max={controller.total}
                      value={controller.valorForma2}
                      onChange={(e) => controller.setValorForma2(Number(e.target.value))}
                      className="flex-1 bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded px-2 py-1 text-xs font-mono text-[#eae2d3]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alerta de Erro de Finalização */}
            {controller.erroFinalizacao && (
              <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/40 rounded-lg text-xs text-[#ffb4ab]">
                <strong>Erro ao finalizar:</strong> {controller.erroFinalizacao}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="space-y-3 pt-4 border-t border-[#38342b]">
              <button
                type="button"
                disabled={controller.salvandoFinalizacao}
                className="w-full bg-[#e9c340] hover:bg-[#b8960c] disabled:opacity-50 text-[#3c2f00] font-sora font-bold py-3.5 rounded-lg text-sm transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
                onClick={controller.handleFinalizar}
              >
                {controller.salvandoFinalizacao ? 'FINALIZANDO...' : 'FINALIZAR COMANDA'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-[#ffb4ab] hover:text-[#93000a] font-mono text-xs uppercase font-semibold transition-colors cursor-pointer"
                  onClick={controller.descartarComandaEmEdicao}
                >
                  CANCELAR / DESCARTAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Serviço */}
      <ModalAdicionarServico
        aberto={controller.modalAdicionarAberto}
        onFechar={() => controller.setModalAdicionarAberto(false)}
        onAdicionar={controller.handleAdicionarItem}
      />

      {/* Modal Desconto no Item */}
      <ModalDescontoItem
        aberto={controller.modalDescontoAberto}
        onClose={controller.fecharModalDesconto}
        item={controller.itemSelecionadoDesconto}
        cliente={controller.cliente}
        itemComAniversarioId={controller.itemComCupomAniversario?.id || null}
        onAplicarAniversario={controller.handleAplicarCupomAniversario}
        onAplicarManual={controller.handleAplicarDescontoManual}
        onRemoverDesconto={controller.handleRemoverDescontoItem}
      />
    </div>
  );
}
