import React from 'react';
import { useGradeHorariosController } from './controller';

export function GradeHorarios() {
  const controller = useGradeHorariosController();

  return (
    <div className="flex flex-col min-w-max h-full bg-[#16130b] font-inter">
      {/* Cabeçalho dos profissionais (sticky) */}
      <div className="sticky top-0 z-20 flex bg-[#110e06] border-b border-[#1e1e1e]">
        {/* Célula do relógio */}
        <div className="w-16 min-w-[64px] h-12 flex items-center justify-center border-r border-[#1e1e1e]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#99907b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Colunas dos profissionais */}
        <div className="flex flex-1 overflow-x-auto">
          {controller.profFiltrados.map((prof) => (
            <div key={prof.id} className="w-48 min-w-[192px] px-3 py-2 flex flex-col justify-center border-r border-[#1e1e1e]">
              <span className="font-sora font-semibold text-xs text-[#eae2d3] truncate">{prof.nome}</span>
              <span className="font-inter text-[11px] text-[#99907b] truncate">{prof.especialidade}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Corpo da grade */}
      <div className="flex flex-1 relative">
        {/* Coluna de horários */}
        <div className="w-16 min-w-[64px] flex flex-col bg-[#110e06] border-r border-[#1e1e1e] select-none">
          {controller.slots.map((slot) => (
            <div key={slot} className="h-[56px] flex items-start justify-center pt-1 border-b border-[#1e1e1e]/40">
              <span className="font-mono text-[11px] text-[#99907b]">{slot}</span>
            </div>
          ))}
        </div>

        {/* Colunas dos profissionais com cards */}
        <div className="flex flex-1 overflow-x-auto">
          {controller.profFiltrados.map((prof) => {
            const apts = controller.getAgendamentosDoProf(prof.id);
            return (
              <div
                key={prof.id}
                className="w-48 min-w-[192px] relative border-r border-[#1e1e1e]"
                style={{ height: `${controller.gradeAltura}px` }}
              >
                {/* Slots clicáveis / indisponíveis */}
                {controller.slots.map((slot) => {
                  const { disponivel, isAtendimentoExtra, isBloqueado, motivoExcecao } =
                    controller.getDisponibilidadeProfissionalNoSlot(prof.id, slot);

                  if (!disponivel) {
                    return (
                      <div
                        key={slot}
                        className={`h-[56px] border-b border-[#1e1e1e]/40 cursor-pointer select-none flex items-center justify-center transition-colors group relative ${
                          isBloqueado ? 'bg-[#1e1517]/90 text-[#ffb4ab]/60 hover:bg-[#2b1d20]' : 'bg-[#0f0d07]/90 text-[#99907b]/30 hover:bg-[#1a160d]'
                        }`}
                        title={
                          isBloqueado
                            ? (motivoExcecao || 'Indisponível (Bloqueado) — Clique para agendar criando Atendimento Extra')
                            : 'Fora do horário de expediente — Clique para agendar criando Atendimento Extra'
                        }
                        onClick={() => controller.handleDisabledSlotClick(prof, slot)}
                      >
                        {isBloqueado && (
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab]/80 truncate max-w-[90%]">
                            🚫 {motivoExcecao || 'Bloqueado'}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={slot}
                      className={`h-[56px] border-b border-[#1e1e1e]/40 transition-colors cursor-pointer relative group ${
                        isAtendimentoExtra
                          ? 'bg-[#221c10]/60 border-l-2 border-l-[#e9c340] hover:bg-[#2e2615]'
                          : 'hover:bg-[#1f1b13]'
                      }`}
                      aria-label={`${slot} — ${prof.nome}`}
                      title={isAtendimentoExtra ? `⚡ ${motivoExcecao || 'Atendimento Extra'}` : undefined}
                      onClick={() => controller.handleSlotClick(prof.id, slot, disponivel)}
                    >
                      {isAtendimentoExtra && (
                        <span className="absolute top-1 right-1 font-mono text-[9px] px-1 py-0.2 rounded bg-[#e9c340]/15 text-[#e9c340] border border-[#e9c340]/30 font-medium">
                          ⚡ Extra
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Cards de agendamento */}
                {apts.map((apt) => {
                  const { top, height } = controller.calcGeometry(apt.horarioInicio, apt.horarioFim);
                  const isEmAtendimento = apt.status === 'em_atendimento';
                  const isConcluido = apt.status === 'concluido';
                  const isFaltou = apt.status === 'faltou';

                  let cardStyle = 'bg-[#16130b] border-dashed border-[#99907b] text-[#eae2d3]';
                  if (isEmAtendimento) {
                    cardStyle = 'bg-[#2d2a20] border-[#e9c340] text-[#eae2d3] shadow-md';
                  } else if (isConcluido) {
                    cardStyle = 'bg-[#1f1b13] border-[#38342b] text-[#d0c6af] opacity-90';
                  } else if (isFaltou) {
                    cardStyle = 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]';
                  }

                  return (
                    <div
                      key={apt.id}
                      className={`absolute left-1 right-1 rounded-md p-2 flex flex-col justify-between overflow-hidden border text-xs cursor-pointer transition-all hover:scale-[1.01] z-10 ${cardStyle}`}
                      style={{ top: `${top}px`, height: `${Math.max(height - 4, 28)}px` }}
                      role="button"
                      aria-label={`Agendamento de ${apt.clienteNome} — ${apt.servico}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        controller.handleCardClick(apt);
                      }}
                    >
                      {isEmAtendimento && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#e9c340] font-bold tracking-wider mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e9c340] animate-ping" />
                          EM ATENDIMENTO
                        </div>
                      )}
                      {!isEmAtendimento && (
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#99907b]">
                          <span>
                            {apt.horarioInicio} - {apt.horarioFim}
                          </span>
                          {apt.comandaNumero && (
                            <button
                              type="button"
                              className="bg-[#10b981]/20 hover:bg-[#10b981] hover:text-[#000] text-[#10b981] border border-[#10b981]/40 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold transition-all cursor-pointer z-20"
                              onClick={(e) => {
                                e.stopPropagation();
                                controller.handleAbrirComandaDireta(apt);
                              }}
                              title="Clique para ver detalhes da Comanda"
                            >
                              Comanda {apt.comandaNumero}
                            </button>
                          )}
                        </div>
                      )}
                      <div className="font-sora font-semibold text-xs text-[#eae2d3] truncate">{apt.clienteNome}</div>
                      <div className="font-inter text-[11px] text-[#d0c6af] truncate">{apt.servico}</div>
                      {apt.countdown && <div className="font-mono text-[10px] text-[#e9c340] font-medium mt-1">{apt.countdown}</div>}
                      {isEmAtendimento && apt.comandaNumero && (
                        <div className="mt-1">
                          <button
                            type="button"
                            className="bg-[#10b981]/20 hover:bg-[#10b981] hover:text-[#000] text-[#10b981] border border-[#10b981]/40 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold transition-all cursor-pointer z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              controller.handleAbrirComandaDireta(apt);
                            }}
                          >
                            Comanda {apt.comandaNumero}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Confirmação para Criar Exceção Atendimento Extra */}
      {controller.confirmModalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl w-full max-w-md shadow-2xl p-6 font-inter text-[#eae2d3] relative animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#e9c340]/15 border border-[#e9c340]/40 flex items-center justify-center text-[#e9c340] mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <h3 className="font-sora font-bold text-lg text-[#eae2d3] mb-2">Horário fora do expediente</h3>
            <p className="font-inter text-xs text-[#d0c6af] leading-relaxed mb-6">
              Esse horário está fora do expediente de <strong className="text-[#e9c340]">{controller.confirmModalData.profNome}</strong> ({controller.confirmModalData.horario}). Deseja criar uma exceção de Atendimento Extra para agendar aqui?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#38342b]">
              <button
                type="button"
                className="px-4 py-2 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] transition-colors cursor-pointer"
                onClick={controller.handleCancelarConfirmacao}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md text-xs font-semibold bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                onClick={controller.handleConfirmarCriarExcecao}
              >
                ⚡ Criar Exceção e Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
