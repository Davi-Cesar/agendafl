import React from 'react';
import { useAgendaViewController } from './controller';
import { GradeHorarios } from '../../components/GradeHorarios';
import { ModalNovoAgendamento } from '../../components/ModalNovoAgendamento';
import { ModalDetalhesAgendamento } from '../../components/ModalDetalhesAgendamento';
import { ModalAddExcecao } from '@modules/profissionais';
import { CriarComandaView, DetalhesComandaView } from '@modules/comandas';
import { ModalAbrirCaixa } from '@modules/caixa';

export function AgendaView() {
  const controller = useAgendaViewController();

  if (controller.comandaAtivaView) {
    if (controller.comandaAtivaView.tipo === 'criar') {
      return <CriarComandaView dados={controller.comandaAtivaView.dados} />;
    }
    return <DetalhesComandaView dados={controller.comandaAtivaView.dados} />;
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter overflow-hidden relative">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e] bg-[#110e06]">
        <div className="flex flex-col">
          <h1 className="font-sora font-bold text-xl text-[#eae2d3]">Agenda — Visão Geral</h1>
          <span className="font-inter text-xs text-[#99907b] mt-0.5">
            {controller.dataFormatada || 'Carregando data...'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Badge de Status do Caixa em Tempo Real */}
          {controller.isCaixaAberto ? (
            <div className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-[#10b981] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Caixa Aberto</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-[#ffb4ab] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]" />
              <span>Caixa Fechado</span>
            </div>
          )}

          {/* Busca por profissional */}
          <div className="relative flex items-center bg-[#1f1b13] border border-[#38342b] focus-within:border-[#e9c340] rounded-md px-3 py-1.5 w-64 transition-all">
            <svg className="w-4 h-4 text-[#99907b] mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="bg-transparent border-none outline-none text-xs text-[#eae2d3] placeholder-[#99907b] w-full"
              placeholder="Procurar profissional..."
              autoComplete="off"
              value={controller.filtroProfissional}
              onChange={controller.handleSearchInput}
            />
          </div>
        </div>
      </header>

      {/* Grade de Horários */}
      <div className="flex-1 overflow-auto relative">
        <GradeHorarios />
      </div>

      {/* FAB — Novo Agendamento */}
      <button
        type="button"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] rounded-full flex items-center justify-center shadow-2xl transition-all z-30 cursor-pointer font-bold hover:scale-105"
        aria-label="Criar novo agendamento"
        title="Novo agendamento"
        onClick={() => controller.abrirModalNovo()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Modais do Módulo Agenda */}
      <ModalNovoAgendamento />
      <ModalDetalhesAgendamento />
      <ModalAddExcecao />

      {/* Modal Alerta Caixa Fechado */}
      {controller.modalAlertaCaixaFechadoAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg w-full max-w-md shadow-2xl p-6 font-inter text-[#eae2d3] relative animate-in fade-in zoom-in duration-150 text-center">
            <div className="w-14 h-14 rounded-full bg-[#2d2a20] border border-[#e9c340]/40 flex items-center justify-center text-[#e9c340] mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h3 className="font-sora font-bold text-lg text-[#eae2d3] mb-2">Caixa Fechado</h3>
            <p className="font-inter text-xs text-[#99907b] leading-relaxed mb-6">
              O caixa precisa estar aberto para criar novos agendamentos e garantir a conciliação financeira do estabelecimento.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="text-xs text-[#99907b] hover:text-[#eae2d3] px-4 py-2.5 transition-colors cursor-pointer"
                onClick={controller.fecharAlertaCaixa}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                onClick={controller.handleAbrirCaixaNoAlerta}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Abrir Caixa Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Abertura de Caixa acionada a partir da Agenda */}
      <ModalAbrirCaixa aberto={controller.modalAbrirCaixaAberto} />
    </main>
  );
}
