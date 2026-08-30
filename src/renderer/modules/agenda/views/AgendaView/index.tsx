import React from 'react';
import { useAgendaViewController } from './controller';
import { GradeHorarios } from '../../components/GradeHorarios';
import { ModalNovoAgendamento } from '../../components/ModalNovoAgendamento';
import { ModalDetalhesAgendamento } from '../../components/ModalDetalhesAgendamento';
import { CriarComandaView } from '../CriarComandaView';
import { DetalhesComandaView } from '../DetalhesComandaView';

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
          {/* Badge Caixa Aberto */}
          <div className="flex items-center gap-2 bg-[#1f1b13] border border-[#38342b] px-3 py-1.5 rounded-full text-xs font-mono text-[#e9c340]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>Caixa Aberto</span>
          </div>

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
    </main>
  );
}
