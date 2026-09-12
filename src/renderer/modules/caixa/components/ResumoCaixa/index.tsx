import React from 'react';
import { useResumoCaixaController } from './controller';
import { formatCurrency } from '@shared/lib/utils';

export function ResumoCaixa() {
  const controller = useResumoCaixaController();
  const { isCaixaAberto, totaisMeios, transacoes, handleVerRelatorio } = controller;

  return (
    <div className="flex flex-col gap-6">
      {/* Grid de 6 Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: FUNDO DE CAIXA */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium">FUNDO DE CAIXA</span>
            <div className="text-[#e9c340]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="8" x2="6" y2="8" />
                <line x1="10" y1="8" x2="18" y2="8" />
              </svg>
            </div>
          </div>
          <div className="font-mono font-bold text-2xl text-[#eae2d3] mb-1">
            {isCaixaAberto ? formatCurrency(totaisMeios.fundoCaixa) : '---'}
          </div>
          <span className="font-inter text-xs text-[#99907b]">Saldo inicial do dia</span>
        </div>

        {/* Card 2: DINHEIRO */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium">DINHEIRO</span>
            <div className="text-[#e9c340]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </div>
          </div>
          <div className="font-mono font-bold text-2xl text-[#eae2d3] mb-1">
            {isCaixaAberto ? formatCurrency(totaisMeios.dinheiro) : '---'}
          </div>
          <span className="font-inter text-xs text-[#99907b]">
            {isCaixaAberto ? totaisMeios.dinheiroVariacaoStr : 'Caixa fechado'}
          </span>
        </div>

        {/* Card 3: PIX BRICIA */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium">PIX BRICIA</span>
            <div className="text-[#e9c340]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
          </div>
          <div className="font-mono font-bold text-2xl text-[#eae2d3] mb-1">
            {isCaixaAberto ? formatCurrency(totaisMeios.pixBricia) : '---'}
          </div>
          <span className="font-inter text-xs text-[#99907b]">
            {isCaixaAberto ? `${totaisMeios.pixBriciaQtd} transações` : '0 transações'}
          </span>
        </div>

        {/* Card 4: PIX FLAVIA */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium">PIX FLAVIA</span>
            <div className="text-[#e9c340]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
          </div>
          <div className="font-mono font-bold text-2xl text-[#eae2d3] mb-1">
            {isCaixaAberto ? formatCurrency(totaisMeios.pixFlavia) : '---'}
          </div>
          <span className="font-inter text-xs text-[#99907b]">
            {isCaixaAberto ? `${totaisMeios.pixFlaviaQtd} transações` : '0 transações'}
          </span>
        </div>

        {/* Card 5: CARTÃO CRÉDITO */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium">CARTÃO CRÉDITO</span>
            <div className="text-[#e9c340]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
          </div>
          <div className="font-mono font-bold text-2xl text-[#eae2d3] mb-1">
            {isCaixaAberto ? formatCurrency(totaisMeios.cartaoCredito) : '---'}
          </div>
          <span className="font-inter text-xs text-[#99907b]">
            {isCaixaAberto ? 'Parcelados e à vista' : 'Sem movimentação'}
          </span>
        </div>

        {/* Card 6: CARTÃO DÉBITO */}
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 flex flex-col justify-between shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#99907b] uppercase font-medium">CARTÃO DÉBITO</span>
            <div className="text-[#e9c340]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
          </div>
          <div className="font-mono font-bold text-2xl text-[#eae2d3] mb-1">
            {isCaixaAberto ? formatCurrency(totaisMeios.cartaoDebito) : '---'}
          </div>
          <span className="font-inter text-xs text-[#99907b]">
            {isCaixaAberto ? 'Recebimento imediato' : 'Sem movimentação'}
          </span>
        </div>
      </div>

      {/* Tabela de Transações Recentes */}
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg overflow-hidden shadow-md flex flex-col">
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
                    Nenhuma transação registrada no caixa atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela com Link para Relatório Detalhado (RN-36) */}
        <div className="border-t border-[#38342b] py-3 text-center bg-[#110e06]/60">
          <button
            type="button"
            className="text-xs font-inter text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer"
            onClick={handleVerRelatorio}
          >
            Ver relatório detalhado
          </button>
        </div>
      </div>
    </div>
  );
}
