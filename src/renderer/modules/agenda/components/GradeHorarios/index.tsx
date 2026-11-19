import React from 'react';
import { useGradeHorariosController } from './controller';
import { hexToRgba } from '../../store/statusCores.store';

function ThreeDotsIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2.3" />
      <circle cx="12" cy="12" r="2.3" />
      <circle cx="19" cy="12" r="2.3" />
    </svg>
  );
}

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
          {controller.profFiltrados.map((prof) => {
            const isBeingDragged = controller.draggedProfId === prof.id;
            const isOver = controller.dragOverProfId === prof.id;
            const side = controller.dropIndicatorSide;
            const isDestinoAnim = controller.movimentoAnimacao?.destinoProfissionalId === prof.id;

            return (
              <div
                key={prof.id}
                draggable
                onDragStart={(e) => controller.handleDragStart(e, prof.id)}
                onDragOver={(e) => controller.handleDragOver(e, prof.id)}
                onDragEnter={(e) => controller.handleDragOver(e, prof.id)}
                onDragLeave={(e) => controller.handleDragLeave(e, prof.id)}
                onDrop={(e) => controller.handleDrop(e, prof.id)}
                onDragEnd={controller.handleDragEnd}
                className={`w-60 min-w-[240px] px-3.5 py-2 flex items-center justify-between border-r border-[#1e1e1e] cursor-grab active:cursor-grabbing select-none group transition-all relative ${
                  isBeingDragged ? 'opacity-40 bg-[#2d2a20]' : 'hover:bg-[#1a160d]'
                } ${
                  isDestinoAnim ? 'bg-[#e9c340]/15 border-b-2 border-b-[#e9c340]' : ''
                } ${
                  isOver && side === 'left' ? 'border-l-4 border-l-[#e9c340] bg-[#e9c340]/15' : ''
                } ${
                  isOver && side === 'right' ? 'border-r-4 border-r-[#e9c340] bg-[#e9c340]/15' : ''
                }`}
                title="Segure e arraste para organizar os funcionários"
              >
                <div className="flex flex-col justify-center min-w-0 pr-2 pointer-events-none">
                  <span className="font-sora font-semibold text-xs text-[#eae2d3] group-hover:text-[#e9c340] transition-colors truncate">
                    {prof.nome}
                  </span>
                  <span className="font-inter text-[11px] text-[#99907b] truncate">
                    {prof.especialidade}
                  </span>
                </div>

                {/* Ícone de Arrastar (Grip) */}
                <div
                  className="text-[#99907b]/40 group-hover:text-[#e9c340] transition-colors shrink-0 pointer-events-none flex items-center"
                  title="Segure e arraste"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corpo da grade */}
      <div className="flex flex-1 relative">
        {/* Coluna de horários */}
        <div className="w-16 min-w-[64px] flex flex-col bg-[#110e06] border-r border-[#1e1e1e] select-none">
          {controller.slots.map((slot) => (
            <div key={slot} className="h-[76px] flex items-start justify-center pt-1.5 border-b border-[#1e1e1e]/40">
              <span className="font-mono text-[11px] text-[#99907b]">{slot}</span>
            </div>
          ))}
        </div>

        {/* Colunas dos profissionais com cards */}
        <div className="flex flex-1 overflow-visible">
          {controller.profFiltrados.map((prof) => {
            const apts = controller.getAgendamentosDoProf(prof.id);
            const isBeingDragged = controller.draggedProfId === prof.id;
            const isOver = controller.dragOverProfId === prof.id;
            const side = controller.dropIndicatorSide;
            const isColunaDestinoAnim =
              controller.movimentoAnimacao?.destinoProfissionalId === prof.id;

            return (
              <div
                key={prof.id}
                className={`w-60 min-w-[240px] relative border-r border-[#1e1e1e] transition-all ${
                  isColunaDestinoAnim ? 'z-30' : ''
                } ${
                  isBeingDragged ? 'opacity-30 bg-[#2d2a20]/30' : ''
                } ${
                  isOver && side === 'left' ? 'border-l-4 border-l-[#e9c340] bg-[#e9c340]/5' : ''
                } ${
                  isOver && side === 'right' ? 'border-r-4 border-r-[#e9c340] bg-[#e9c340]/5' : ''
                }`}
                style={{ height: `${controller.gradeAltura}px` }}
                onDragOver={(e) => controller.handleDragOver(e, prof.id)}
                onDragEnter={(e) => controller.handleDragOver(e, prof.id)}
                onDragLeave={(e) => controller.handleDragLeave(e, prof.id)}
                onDrop={(e) => controller.handleDrop(e, prof.id)}
              >
                {/* Slots clicáveis / indisponíveis */}
                {controller.slots.map((slot) => {
                  const { disponivel, isAtendimentoExtra, isBloqueado, motivoExcecao } =
                    controller.getDisponibilidadeProfissionalNoSlot(prof.id, slot);
                  const isSlotDestinoAnim =
                    isColunaDestinoAnim &&
                    controller.movimentoAnimacao?.destinoHorarioInicio &&
                    controller.movimentoAnimacao.destinoHorarioInicio.slice(0, 2) === slot.slice(0, 2) &&
                    ((Number(controller.movimentoAnimacao.destinoHorarioInicio.slice(3, 5)) < 30 && slot.endsWith(':00')) ||
                      (Number(controller.movimentoAnimacao.destinoHorarioInicio.slice(3, 5)) >= 30 && slot.endsWith(':30')));

                  if (!disponivel) {
                    return (
                      <div
                        key={slot}
                        className={`h-[76px] border-b border-[#1e1e1e]/40 cursor-pointer select-none flex items-center justify-center transition-colors group relative ${
                          isBloqueado ? 'bg-[#1e1517]/90 text-[#ffb4ab]/60 hover:bg-[#2b1d20]' : 'bg-[#0f0d07]/90 text-[#99907b]/30 hover:bg-[#1a160d]'
                        } ${isSlotDestinoAnim ? 'animate-dest-pulse ring-1 ring-inset ring-[#e9c340]/50' : ''}`}
                        title={
                          isBloqueado
                            ? (motivoExcecao || 'Exceção (Bloqueado) — Clique para agendar em exceção')
                            : 'Profissional não atende neste horário — Clique para abrir Exceção neste horário'
                        }
                        onClick={() => controller.handleDisabledSlotClick(prof, slot)}
                      >
                        {isBloqueado ? (
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab]/80 truncate max-w-[90%]">
                            🚫 Exceção ({motivoExcecao || 'Bloqueado'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded border border-dashed border-[#38342b]/60 text-[#99907b]/60 group-hover:text-[#e9c340] group-hover:border-[#e9c340]/50 transition-colors">
                            <ThreeDotsIcon className="w-3 h-3" />
                            <span>Exceção</span>
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={slot}
                      className={`h-[76px] border-b border-[#1e1e1e]/40 transition-colors cursor-pointer relative group ${
                        isAtendimentoExtra
                          ? 'bg-[#221c10]/60 border-l-2 border-l-[#e9c340] hover:bg-[#2e2615]'
                          : 'hover:bg-[#1f1b13]'
                      } ${isSlotDestinoAnim ? 'animate-dest-pulse ring-1 ring-inset ring-[#e9c340]/50' : ''}`}
                      aria-label={`${slot} — ${prof.nome}`}
                      title={isAtendimentoExtra ? `••• Exceção: ${motivoExcecao || 'Atendimento Extra'}` : undefined}
                      onClick={() => controller.handleSlotClick(prof.id, slot, disponivel)}
                    >
                      {isAtendimentoExtra && (
                        <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#e9c340]/15 text-[#e9c340] border border-[#e9c340]/30 font-medium">
                          <ThreeDotsIcon className="w-2.5 h-2.5" />
                          <span>Exceção</span>
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Cards de agendamento */}
                {apts.map((apt) => {
                  const { top, height } = controller.calcGeometry(apt.horarioInicio, apt.horarioFim);
                  const { isExcecao: isHorarioExcecao } = controller.getDisponibilidadeProfissionalNoSlot(
                    apt.profissionalId,
                    apt.horarioInicio
                  );
                  const statusCfg = controller.getStatusConfig(apt.status);
                  const corStatus = statusCfg.cor;
                  const statusLabel = statusCfg.label.toUpperCase();
                  const isEmAtendimento = apt.status === 'em_atendimento';

                  const [hIni, mIni] = apt.horarioInicio.split(':').map(Number);
                  const [hFim, mFim] = apt.horarioFim.split(':').map(Number);
                  const inicioMin = (hIni || 0) * 60 + (mIni || 0);
                  const fimMin = (hFim || 0) * 60 + (mFim || 0);
                  const duracaoMin = Math.max(5, fimMin - inicioMin);

                  // Verifica se há outro agendamento logo abaixo para evitar sobreposição
                  const proxInicioMin = apts
                    .filter((other) => other.id !== apt.id)
                    .map((other) => {
                      const [oh, om] = other.horarioInicio.split(':').map(Number);
                      return (oh || 0) * 60 + (om || 0);
                    })
                    .filter((otherIni) => otherIni >= fimMin)
                    .sort((a, b) => a - b)[0];

                  const espacoAteProximoPx =
                    proxInicioMin != null ? ((proxInicioMin - inicioMin) / 30) * 76 : 76;

                  const alturaMinimaDesejada =
                    duracaoMin < 25 ? Math.min(38, Math.max(24, espacoAteProximoPx - 4)) : 36;
                  const cardHeight = Math.max(height - 5, alturaMinimaDesejada);
                  const isCompactoLinhaUnica = duracaoMin <= 15 || cardHeight < 42;
                  const isCompactoDuasLinhas = !isCompactoLinhaUnica && (duracaoMin < 30 || cardHeight < 60);

                  const tooltipCard = `${apt.clienteNome} — ${apt.servico} (${apt.horarioInicio} - ${apt.horarioFim}) • ${statusCfg.label}${
                    apt.observacoes ? `\nObs: ${apt.observacoes}` : ''
                  }`;

                  const moveAnim = controller.getCardMoveAnimation(apt, top);
                  const cardStyle: React.CSSProperties & Record<string, string | number> = {
                    top: `${top + 2}px`,
                    height: `${cardHeight}px`,
                    minHeight: `${cardHeight}px`,
                    backgroundColor: '#15120b',
                    backgroundImage: `linear-gradient(135deg, ${hexToRgba(corStatus, 0.34)} 0%, ${hexToRgba(corStatus, 0.18)} 100%)`,
                    borderColor: moveAnim.isMoving ? '#e9c340' : hexToRgba(corStatus, 0.6),
                    borderLeftColor: corStatus,
                  };
                  if (moveAnim.isMoving) {
                    cardStyle['--move-from-x'] = `${moveAnim.moveFromX}px`;
                    cardStyle['--move-from-y'] = `${moveAnim.moveFromY}px`;
                  }

                  return (
                    <div
                      key={apt.id}
                      ref={moveAnim.isMoving ? controller.movingCardRef : undefined}
                      className={`group/card absolute left-1.5 right-1.5 rounded-lg overflow-hidden text-xs cursor-pointer transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-0.5 hover:z-40 hover:!h-auto hover:shadow-[0_12px_28px_rgba(0,0,0,0.75)] border border-l-4 text-[#eae2d3] shadow-md ${
                        moveAnim.isMoving ? 'animate-card-glide z-[45] ring-2 ring-[#e9c340]/70' : 'z-10'
                      } ${
                        isCompactoLinhaUnica
                          ? 'px-2.5 py-1 flex items-center justify-between gap-2 hover:py-2'
                          : isCompactoDuasLinhas
                          ? 'px-3 py-1.5 flex flex-col justify-center gap-1'
                          : 'px-3 py-2 flex flex-col justify-between gap-1'
                      }`}
                      style={cardStyle}
                      role="button"
                      title={tooltipCard}
                      aria-label={`Agendamento de ${apt.clienteNome} — ${apt.servico}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        controller.handleCardClick(apt);
                      }}
                    >
                      {isCompactoLinhaUnica ? (
                        <>
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${isEmAtendimento ? 'animate-ping' : ''}`}
                              style={{ backgroundColor: corStatus }}
                              title={statusLabel}
                            />
                            <span className="font-sora font-semibold text-[11px] text-[#eae2d3] truncate group-hover/card:whitespace-normal leading-tight">
                              {apt.clienteNome}
                            </span>
                            <span className="font-inter text-[10px] text-[#eae2d3]/80 truncate leading-tight">
                              • {apt.servico}
                            </span>
                            {apt.observacoes && (
                              <span className="text-[10px] shrink-0" title={`Observação: ${apt.observacoes}`}>
                                📝
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono text-[9px] text-[#eae2d3]/90 font-medium whitespace-nowrap">
                              {apt.horarioInicio}
                            </span>
                            {apt.comandaNumero ? (
                              <button
                                type="button"
                                className="bg-[#110e06]/85 hover:bg-[#10b981] hover:text-[#000] text-[#6ee7b7] border border-[#10b981]/50 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold transition-all cursor-pointer z-20 leading-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  controller.handleAbrirComandaDireta(apt);
                                }}
                                title="Clique para ver detalhes da Comanda"
                              >
                                {apt.comandaNumero}
                              </button>
                            ) : (
                              <span
                                className="font-mono text-[8px] px-1.5 py-0.5 rounded border font-bold tracking-tight shrink-0 leading-none"
                                style={{
                                  backgroundColor: hexToRgba(corStatus, 0.24),
                                  borderColor: hexToRgba(corStatus, 0.55),
                                  color: corStatus,
                                }}
                              >
                                {statusLabel}
                              </span>
                            )}
                          </div>
                        </>
                      ) : isCompactoDuasLinhas ? (
                        <>
                          <div className="flex items-center justify-between gap-1.5 min-w-0">
                            <span className="font-sora font-semibold text-xs text-[#eae2d3] truncate group-hover/card:whitespace-normal leading-tight">
                              {apt.clienteNome}
                            </span>
                            <div className="flex items-center gap-1 shrink-0 font-mono text-[9px]">
                              <span className="text-[#eae2d3]/90 font-medium">{apt.horarioInicio}</span>
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-bold tracking-tight shrink-0 leading-none"
                                style={{
                                  backgroundColor: hexToRgba(corStatus, 0.24),
                                  borderColor: hexToRgba(corStatus, 0.55),
                                  color: corStatus,
                                }}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${isEmAtendimento ? 'animate-ping' : ''}`}
                                  style={{ backgroundColor: corStatus }}
                                />
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-1.5 min-w-0">
                            <span className="font-inter text-[11px] text-[#eae2d3]/85 truncate leading-tight">
                              {apt.servico} {apt.observacoes ? '📝' : ''}
                            </span>
                            {apt.comandaNumero && (
                              <button
                                type="button"
                                className="bg-[#110e06]/85 hover:bg-[#10b981] hover:text-[#000] text-[#6ee7b7] border border-[#10b981]/50 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold transition-all cursor-pointer z-20 shrink-0 leading-none"
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
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-1 font-mono text-[9px] min-w-0">
                            <span className="text-[#eae2d3]/95 font-medium whitespace-nowrap shrink-0">
                              {apt.horarioInicio} - {apt.horarioFim}
                            </span>
                            <div className="flex items-center gap-1 shrink-0 min-w-0">
                              {isHorarioExcecao && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#e9c340]/20 text-[#e9c340] border border-[#e9c340]/45 font-bold text-[8px] leading-none shrink-0"
                                  title="Exceção: profissional fora do horário padrão"
                                >
                                  <ThreeDotsIcon className="w-2.5 h-2.5" />
                                  <span>EXCEÇÃO</span>
                                </span>
                              )}
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-bold tracking-tight text-[8px] leading-none shrink-0"
                                style={{
                                  backgroundColor: hexToRgba(corStatus, 0.24),
                                  borderColor: hexToRgba(corStatus, 0.55),
                                  color: corStatus,
                                }}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${isEmAtendimento ? 'animate-ping' : ''}`}
                                  style={{ backgroundColor: corStatus }}
                                />
                                {statusLabel}
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0 my-0.5">
                            <div className="font-sora font-semibold text-[13px] text-[#eae2d3] truncate group-hover/card:whitespace-normal leading-snug">
                              {apt.clienteNome}
                            </div>
                            <div className="font-inter text-[11px] text-[#eae2d3]/85 truncate leading-snug flex items-center gap-1 mt-0.5">
                              <span className="truncate">{apt.servico}</span>
                              {apt.observacoes && (
                                <span className="text-[10px] shrink-0" title={`Observação: ${apt.observacoes}`}>
                                  📝
                                </span>
                              )}
                            </div>
                          </div>

                          {apt.comandaNumero && (
                            <div className="flex items-center justify-end pt-0.5">
                              <button
                                type="button"
                                className="bg-[#110e06]/85 hover:bg-[#10b981] hover:text-[#000] text-[#6ee7b7] border border-[#10b981]/50 px-2 py-0.5 rounded font-mono text-[9px] font-bold transition-all cursor-pointer z-20 leading-tight"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  controller.handleAbrirComandaDireta(apt);
                                }}
                                title="Clique para ver detalhes da Comanda"
                              >
                                Comanda {apt.comandaNumero}
                              </button>
                            </div>
                          )}
                        </>
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
                <ThreeDotsIcon className="w-3.5 h-3.5" />
                <span>Criar Exceção e Agendar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
