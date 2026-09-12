import React from 'react';
import { useCaixaViewController } from './controller';
import { ResumoCaixa } from '../../components/ResumoCaixa';
import { ComissoesDoDia } from '../../components/ComissoesDoDia';
import { CaixasAnteriores } from '../../components/CaixasAnteriores';
import { ModalRelatorioDetalhado } from '../../components/ModalRelatorioDetalhado';
import { ModalAbrirCaixa } from '../../components/ModalAbrirCaixa';
import { ModalFecharCaixa } from '../../components/ModalFecharCaixa';

export function CaixaView() {
  const controller = useCaixaViewController();
  const { isCaixaAberto, abaAtiva, setAbaAtiva, erro, handleAcaoCabecalho, handleToggleAnteriores } = controller;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter overflow-y-auto p-6">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b border-[#38342b] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">Caixa e Financeiro</h1>
          {isCaixaAberto ? (
            <span className="flex items-center gap-1.5 bg-[#2d2a20] text-[#e9c340] border border-[#e9c340]/40 text-xs font-mono font-semibold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#e9c340] animate-pulse" />
              Caixa Aberto
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-[#1f1b13] text-[#99907b] border border-[#38342b] text-xs font-mono font-semibold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#99907b]" />
              Caixa Fechado
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold px-5 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow-md"
            onClick={handleAcaoCabecalho}
          >
            {isCaixaAberto ? 'Fechar Caixa' : 'Abrir Caixa'}
          </button>

          <button
            type="button"
            className={`font-inter font-medium px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer border ${
              abaAtiva === 'anteriores'
                ? 'bg-[#e9c340] text-[#3c2f00] font-bold border-[#e9c340]'
                : 'bg-[#1f1b13] hover:bg-[#2d2a20] text-[#eae2d3] border-[#38342b]'
            }`}
            onClick={handleToggleAnteriores}
          >
            {abaAtiva === 'anteriores' ? 'Voltar ao Caixa Atual' : 'Ver Caixas Anteriores'}
          </button>
        </div>
      </header>

      {erro && (
        <div className="mb-4 bg-[#3c1313] border border-[#7a2222] text-[#f8a5a5] px-4 py-3 rounded-lg text-xs font-inter leading-relaxed">
          {erro}
        </div>
      )}

      {/* Alternância de Abas (Transações, Comissões, Caixas Anteriores) */}
      <div className="flex items-center gap-2 mb-6 bg-[#1f1b13] p-1.5 rounded-lg w-fit border border-[#38342b]">
        <button
          type="button"
          className={`px-5 py-2 rounded-md font-inter font-medium text-xs transition-all cursor-pointer ${
            abaAtiva === 'transacoes'
              ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-sm'
              : 'text-[#d0c6af] hover:text-[#eae2d3]'
          }`}
          onClick={() => setAbaAtiva('transacoes')}
        >
          Transações
        </button>

        <button
          type="button"
          className={`px-5 py-2 rounded-md font-inter font-medium text-xs transition-all cursor-pointer ${
            abaAtiva === 'comissoes'
              ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-sm'
              : 'text-[#d0c6af] hover:text-[#eae2d3]'
          }`}
          onClick={() => setAbaAtiva('comissoes')}
        >
          Comissões do Dia
        </button>

        <button
          type="button"
          className={`px-5 py-2 rounded-md font-inter font-medium text-xs transition-all cursor-pointer ${
            abaAtiva === 'anteriores'
              ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-sm'
              : 'text-[#d0c6af] hover:text-[#eae2d3]'
          }`}
          onClick={() => setAbaAtiva('anteriores')}
        >
          Caixas Anteriores
        </button>
      </div>

      {/* Conteúdo Principal (Empty State vs Abas) */}
      {!isCaixaAberto && abaAtiva !== 'anteriores' ? (
        /* Empty State quando o Caixa está Fechado e não estamos na aba Anteriores */
        <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-12 flex flex-col items-center justify-center text-center my-auto min-h-[320px]">
          <div className="w-14 h-14 rounded-full bg-[#2d2a20] border border-[#e9c340]/40 flex items-center justify-center text-[#e9c340] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h3 className="font-sora font-bold text-base text-[#eae2d3] mb-2">Nenhuma movimentação em aberto</h3>
          <p className="font-inter text-xs text-[#99907b] max-w-md leading-relaxed mb-6">
            O caixa está fechado no momento. Abra um novo caixa para iniciar o expediente, registrar comandas e transações, ou consulte o histórico dos fechamentos anteriores.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold px-6 py-3 rounded-lg text-xs transition-all cursor-pointer shadow-lg hover:scale-[1.01] flex items-center gap-2"
              onClick={controller.abrirModalAbrir}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Abrir Caixa Agora
            </button>

            <button
              type="button"
              className="bg-[#1f1b13] hover:bg-[#2d2a20] text-[#eae2d3] border border-[#38342b] font-inter font-medium px-5 py-3 rounded-lg text-xs transition-colors cursor-pointer"
              onClick={() => setAbaAtiva('anteriores')}
            >
              Ver Caixas Anteriores
            </button>
          </div>
        </div>
      ) : abaAtiva === 'transacoes' ? (
        <ResumoCaixa />
      ) : abaAtiva === 'comissoes' ? (
        <ComissoesDoDia />
      ) : (
        <CaixasAnteriores />
      )}

      {/* Modais do Módulo */}
      <ModalAbrirCaixa aberto={controller.modalAbrirAberto} />
      <ModalFecharCaixa aberto={controller.modalFecharAberto} />
      <ModalRelatorioDetalhado />
    </div>
  );
}
