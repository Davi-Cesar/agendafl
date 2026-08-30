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
                {/* Slots clicáveis */}
                {controller.slots.map((slot) => (
                  <div
                    key={slot}
                    className="h-[56px] border-b border-[#1e1e1e]/40 hover:bg-[#1f1b13] transition-colors cursor-pointer"
                    aria-label={`${slot} — ${prof.nome}`}
                    onClick={() => controller.handleSlotClick(prof.id, slot)}
                  />
                ))}

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
                        <div className="font-mono text-[10px] text-[#99907b]">
                          {apt.horarioInicio} - {apt.horarioFim}
                        </div>
                      )}
                      <div className="font-sora font-semibold text-xs text-[#eae2d3] truncate">{apt.clienteNome}</div>
                      <div className="font-inter text-[11px] text-[#d0c6af] truncate">{apt.servico}</div>
                      {apt.countdown && <div className="font-mono text-[10px] text-[#e9c340] font-medium mt-1">{apt.countdown}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
