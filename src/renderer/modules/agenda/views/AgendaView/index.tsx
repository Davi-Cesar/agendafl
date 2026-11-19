import React from 'react';
import { useAgendaViewController } from './controller';
import { GradeHorarios } from '../../components/GradeHorarios';
import { ModalNovoAgendamento } from '../../components/ModalNovoAgendamento';
import { ModalDetalhesAgendamento } from '../../components/ModalDetalhesAgendamento';
import { ModalCoresStatus } from '../../components/ModalCoresStatus';
import { hexToRgba } from '../../store/statusCores.store';
import { ModalAddExcecao } from '@modules/profissionais';
import { CriarComandaView, DetalhesComandaView } from '@modules/comandas';
import { ModalAbrirCaixa } from '@modules/caixa';
import { DatePicker } from '@shared/ui/DatePicker';

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
      <header className="flex flex-col gap-3 px-6 py-3.5 border-b border-[#1e1e1e] bg-[#110e06]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Título + Navegação Minimalista de Calendário */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <h1 className="font-sora font-bold text-xl text-[#eae2d3]">Agenda — Visão Geral</h1>
              <span className="font-inter text-xs text-[#99907b] mt-0.5">
                {controller.dataFormatada || 'Carregando data...'}
              </span>
            </div>

            {/* Controle Minimalista de Data / Calendário */}
            <div className="flex items-center gap-1.5 bg-[#1f1b13] border border-[#38342b] rounded-lg p-1">
              <button
                type="button"
                disabled={controller.isHoje}
                onClick={controller.handleDiaAnterior}
                className={`p-1.5 rounded-md transition-colors ${
                  controller.isHoje
                    ? 'text-[#99907b]/25 cursor-not-allowed'
                    : 'text-[#99907b] hover:text-[#e9c340] hover:bg-[#2d2a20] cursor-pointer'
                }`}
                title={controller.isHoje ? 'Dias anteriores estão bloqueados' : 'Dia anterior'}
                aria-label="Dia anterior"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <DatePicker
                value={controller.dataSelecionada}
                onChange={controller.handleSelecionarData}
                minDate={controller.hojeDate}
                size="sm"
                showActions={false}
                className="w-34"
                inputClassName="border-none bg-transparent py-1 text-center font-semibold text-[#e9c340]"
              />

              <button
                type="button"
                onClick={controller.handleProximoDia}
                className="p-1.5 rounded-md text-[#99907b] hover:text-[#e9c340] hover:bg-[#2d2a20] transition-colors cursor-pointer"
                title="Próximo dia"
                aria-label="Próximo dia"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {!controller.isHoje && (
                <button
                  type="button"
                  onClick={controller.handleIrParaHoje}
                  className="px-2.5 py-1 rounded-md bg-[#e9c340]/15 hover:bg-[#e9c340] text-[#e9c340] hover:text-[#3c2f00] border border-[#e9c340]/40 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer"
                  title="Voltar para o dia de hoje"
                >
                  Hoje
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            {/* Botão de Restaurar Ordem Original */}
            {controller.ordemPersonalizadaAtiva && (
              <button
                type="button"
                onClick={controller.resetarOrdemProfissionais}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f1b13] border border-[#38342b] hover:border-[#e9c340] text-[#99907b] hover:text-[#eae2d3] text-xs font-mono transition-colors cursor-pointer"
                title="Restaurar ordem alfabética original dos profissionais"
              >
                <svg className="w-3.5 h-3.5 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>Restaurar Ordem A-Z</span>
              </button>
            )}

            {/* Busca por profissional */}
            <div className="relative flex items-center bg-[#1f1b13] border border-[#38342b] focus-within:border-[#e9c340] rounded-md px-3 py-1.5 w-60 transition-all">
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
        </div>

        {/* Legenda Minimalista de Cores por Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[#99907b] pt-1 border-t border-[#1e1e1e]/80">
          <div className="flex flex-wrap items-center gap-4">
            <span className="uppercase text-[10px] tracking-wider text-[#99907b]/70">Status:</span>
            {controller.statusList.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={controller.abrirModalStatusCores}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                title={`Clique para alterar a cor de ${st.label}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: st.cor,
                    boxShadow: `0 0 6px ${hexToRgba(st.cor, 0.6)}`,
                  }}
                />
                <span className="font-medium" style={{ color: st.cor }}>
                  {st.label}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={controller.abrirModalStatusCores}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1f1b13] border border-[#38342b] hover:border-[#e9c340] text-[#d0c6af] hover:text-[#e9c340] text-[10px] font-mono transition-colors cursor-pointer"
            title="Adicionar novas cores de status ou alterar as cores existentes"
          >
            <svg className="w-3 h-3 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
            <span>+ Cores / Status</span>
          </button>
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
      <ModalCoresStatus />
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
