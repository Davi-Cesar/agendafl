import React from 'react';
import { useProfissionaisViewController } from './controller';
import { ModalNovoProfissional } from '../../components/ModalNovoProfissional';
import { ModalServicosProfissional } from '../../components/ModalServicosProfissional';
import { ModalAddExcecao } from '../../components/ModalAddExcecao';

export function ProfissionaisView() {
  const controller = useProfissionaisViewController();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-6 py-4 bg-[#110e06] border-b border-[#38342b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-bold text-2xl text-[#eae2d3]">Gestão de Profissionais</h1>
          <p className="font-inter text-xs text-[#99907b] mt-0.5">Controle de horários e equipes</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Input de Busca */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar profissional..."
              value={controller.busca}
              onChange={(e) => controller.setBusca(e.target.value)}
              className="w-full bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md pl-9 pr-3 py-1.5 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all"
            />
            <svg
              className="w-4 h-4 text-[#99907b] absolute left-3 top-1/2 -translate-y-1/2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Botão Novo Profissional */}
          <button
            type="button"
            onClick={controller.handleNovoProfissional}
            className="flex items-center gap-2 px-4 py-2 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold text-xs rounded-md shadow-md transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Profissional
          </button>
        </div>
      </header>

      {/* Main Master-Detail Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Coluna Esquerda: Lista de Profissionais Registrados */}
        <aside className="w-72 min-w-[280px] bg-[#110e06] border-r border-[#38342b] flex flex-col">
          <div className="px-4 py-3 border-b border-[#38342b]">
            <span className="font-mono text-[11px] text-[#99907b] font-medium tracking-wider uppercase">
              REGISTRADOS ({controller.totalRegistrados})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#38342b]/40">
            {controller.profissionais.map((p) => {
              const isSelected = p.id === controller.profissionalAtual?.id;
              const isAtivo = p.status === 'ativo';

              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => controller.setProfissionalSelecionadoId(p.id)}
                  className={`w-full text-left px-5 py-4 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#1f1b13] border-l-4 border-[#e9c340]'
                      : 'hover:bg-[#1f1b13]/60'
                  }`}
                >
                  <h3
                    className={`font-sora font-semibold text-sm ${
                      isSelected ? 'text-[#eae2d3]' : 'text-[#d0c6af]'
                    }`}
                  >
                    {p.nome}
                  </h3>
                  {p.especialidade && (
                    <span className="block font-mono text-[10px] text-[#e9c340] uppercase mt-1 tracking-wider">
                      {p.especialidade}
                    </span>
                  )}
                  {!isAtivo && (
                    <span className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b]">
                      INATIVO
                    </span>
                  )}
                </button>
              );
            })}

            {controller.profissionais.length === 0 && (
              <div className="p-6 text-center text-xs text-[#99907b]">
                {controller.carregando ? 'Carregando equipe...' : 'Nenhum profissional cadastrado.'}
              </div>
            )}
          </div>
        </aside>

        {/* Coluna Direita: Detalhes & Horários do Profissional Selecionado */}
        <main className="flex-1 bg-[#16130b] p-6 overflow-y-auto">
          {controller.profissionalAtual ? (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header do Profissional Selecionado */}
              <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-sora font-bold text-2xl text-[#eae2d3]">
                      {controller.profissionalAtual.nome}
                    </h2>
                    <span
                      className={`font-mono text-[10px] px-2.5 py-1 rounded-full uppercase font-semibold border ${
                        controller.profissionalAtual.status === 'ativo'
                          ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
                          : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30'
                      }`}
                    >
                      ● {controller.profissionalAtual.status === 'ativo' ? 'Ativo no Sistema' : 'Inativo'}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#e9c340]/15 text-[#e9c340] border border-[#e9c340]/30 font-bold">
                      Comissão: 60%
                    </span>
                  </div>

                  {controller.profissionalAtual.email && (
                    <p className="font-inter text-xs text-[#99907b] mt-1">
                      {controller.profissionalAtual.email}
                    </p>
                  )}

                  {/* Badges de Serviços Habilitados */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {controller.servicosDoProfissional.map((s) => (
                      <span
                        key={s.id}
                        className="font-mono text-[10px] uppercase px-2.5 py-1 rounded-md bg-[#2d2a20] border border-[#38342b] text-[#e9c340] font-medium"
                      >
                        {s.nome}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={controller.handleAbrirServicos}
                      className="font-mono text-[10px] uppercase px-2 py-1 rounded-md bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer"
                    >
                      + Serviços
                    </button>
                  </div>
                </div>

                {/* Ações do Profissional (Editar / Excluir) */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={controller.handleEditarProfissional}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#2d2a20] hover:bg-[#3d392f] border border-[#38342b] text-[#eae2d3] transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    EDITAR
                  </button>

                  <button
                    type="button"
                    onClick={() => controller.excluirProfissional(controller.profissionalAtual!.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#93000a]/20 hover:bg-[#93000a]/40 border border-[#ffb4ab]/30 text-[#ffb4ab] transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    EXCLUIR
                  </button>
                </div>
              </div>

              {/* Seção: Horários de Trabalho */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-sora font-bold text-lg text-[#eae2d3]">Horários de Trabalho</h3>
                    {controller.horariosSalvosSucesso && (
                      <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold animate-in fade-in">
                        ✓ Horários salvos e atualizados na agenda!
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => controller.replicarHorariosSemana(1)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 font-mono text-xs uppercase font-semibold px-3 py-2 rounded-md bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] text-[#99907b] hover:text-[#eae2d3] transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      REPLICAR HORÁRIOS
                    </button>

                    <button
                      type="button"
                      onClick={controller.salvarHorarios}
                      disabled={controller.salvandoHorarios}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 font-sora font-semibold text-xs px-4 py-2 rounded-md bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] disabled:opacity-50 transition-all cursor-pointer shadow-md"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      {controller.salvandoHorarios ? 'Salvando...' : 'Salvar Horários'}
                    </button>
                  </div>
                </div>

                {/* Grade de 7 Cards dos Dias da Semana (Seg a Sáb + Dom) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5">
                  {[1, 2, 3, 4, 5, 6, 0].map((diaNum) => {
                    const isDomingo = diaNum === 0;
                    const horario = controller.horariosDoProfissional.find((h) => h.diaSemana === diaNum) || {
                      diaSemana: diaNum,
                      ativo: !isDomingo,
                      manhaInicio: isDomingo ? '' : '08:00',
                      manhaFim: isDomingo ? '' : '11:00',
                      tardeInicio: isDomingo ? '' : '13:30',
                      tardeFim: isDomingo ? '' : '17:00',
                      intervaloAlmoco: isDomingo ? '' : '11:00 - 13:30',
                      excecoes: [],
                    };

                    const nomeDia = controller.diasSemanaNomes[diaNum] || 'Dia';

                    return (
                      <div
                        key={diaNum}
                        className={`bg-[#1f1b13] border rounded-lg p-3.5 shadow-md transition-all duration-200 flex flex-col justify-between ${
                          horario.ativo
                            ? 'border-[#38342b] hover:border-[#e9c340]/40'
                            : 'border-[#38342b]/40 opacity-75 hover:opacity-90'
                        }`}
                      >
                        <div>
                          {/* Header do Card */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-[#38342b] mb-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-sora font-bold text-sm text-[#eae2d3] truncate">{nomeDia}</span>
                              {isDomingo && (
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#99907b]/20 text-[#99907b] shrink-0">
                                  Exceções
                                </span>
                              )}
                            </div>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0" title={horario.ativo ? 'Dia com expediente' : 'Dia sem expediente'}>
                              <span className="font-mono text-[10px] text-[#99907b]">
                                {horario.ativo ? 'Ativo' : 'Off'}
                              </span>
                              <input
                                type="checkbox"
                                checked={horario.ativo}
                                onChange={(e) => {
                                  controller.atualizarHorarioSemanal(diaNum, 'ativo', e.target.checked);
                                }}
                                className="w-4 h-4 accent-[#e9c340] rounded border-[#38342b] bg-[#110e06] cursor-pointer"
                              />
                            </label>
                          </div>

                          {/* Turno Manhã */}
                          <div className="space-y-1.5 mb-3">
                            <span className="block font-mono text-[10px] text-[#99907b] uppercase">MANHÃ</span>
                            <div className="flex items-center justify-between gap-1.5">
                              <input
                                type="text"
                                value={horario.manhaInicio}
                                placeholder="08:00"
                                disabled={!horario.ativo}
                                onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'manhaInicio', e.target.value)}
                                className="flex-1 min-w-[65px] bg-[#110e06] border border-[#38342b] rounded px-2 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none focus:border-[#e9c340] disabled:opacity-40 transition-colors"
                              />
                              <span className="text-[11px] text-[#99907b] font-inter shrink-0">até</span>
                              <input
                                type="text"
                                value={horario.manhaFim}
                                placeholder="11:00"
                                disabled={!horario.ativo}
                                onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'manhaFim', e.target.value)}
                                className="flex-1 min-w-[65px] bg-[#110e06] border border-[#38342b] rounded px-2 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none focus:border-[#e9c340] disabled:opacity-40 transition-colors"
                              />
                            </div>
                          </div>

                          {/* Turno Tarde */}
                          <div className="space-y-1.5 mb-3">
                            <span className="block font-mono text-[10px] text-[#99907b] uppercase">TARDE</span>
                            <div className="flex items-center justify-between gap-1.5">
                              <input
                                type="text"
                                value={horario.tardeInicio}
                                placeholder="13:30"
                                disabled={!horario.ativo}
                                onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'tardeInicio', e.target.value)}
                                className="flex-1 min-w-[65px] bg-[#110e06] border border-[#38342b] rounded px-2 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none focus:border-[#e9c340] disabled:opacity-40 transition-colors"
                              />
                              <span className="text-[11px] text-[#99907b] font-inter shrink-0">até</span>
                              <input
                                type="text"
                                value={horario.tardeFim}
                                placeholder="17:00"
                                disabled={!horario.ativo}
                                onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'tardeFim', e.target.value)}
                                className="flex-1 min-w-[65px] bg-[#110e06] border border-[#38342b] rounded px-2 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none focus:border-[#e9c340] disabled:opacity-40 transition-colors"
                              />
                            </div>
                          </div>

                          {/* Pausa para Almoço */}
                          <div className="pt-2 pb-1.5 border-t border-[#38342b]/60 text-[11px] font-inter">
                            <div className="flex items-center justify-between text-[#99907b]">
                              <span>Pausa Almoço:</span>
                              <span className="font-mono text-[#e9c340] font-semibold text-[10px] sm:text-[11px]">
                                {horario.intervaloAlmoco || (isDomingo ? 'Sem expediente' : '11:00 - 13:30')}
                              </span>
                            </div>
                          </div>

                          {/* Exceções de Horário Registradas para esta Data */}
                          {horario.excecoes && horario.excecoes.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#38342b]/40 space-y-1.5">
                              <span className="block font-mono text-[9px] text-[#99907b] uppercase">
                                EXCEÇÕES NESTE DIA:
                              </span>
                              {horario.excecoes.map((exc) => {
                                const isExtra = exc.tipo === 'atendimento_extra';
                                return (
                                  <div
                                    key={exc.id}
                                    className={`flex items-start justify-between rounded p-1.5 text-[10px] border gap-1 transition-all ${
                                      isExtra
                                        ? 'bg-[#e9c340]/15 border-[#e9c340]/40 text-[#e9c340]'
                                        : 'bg-[#93000a]/15 border-[#ffb4ab]/30 text-[#ffb4ab]'
                                    }`}
                                  >
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-mono font-bold truncate">
                                        {isExtra ? '⚡ Extra:' : '🚫 Indisp:'} {exc.inicio} - {exc.fim}
                                      </span>
                                      {exc.data && <span className="font-mono text-[9px] opacity-80">Data: {exc.data}</span>}
                                      {exc.motivo && <span className="text-[9px] opacity-90 truncate">{exc.motivo}</span>}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => controller.removerExcecaoHorario(diaNum, exc.id)}
                                      className="hover:text-white shrink-0 cursor-pointer font-bold text-xs p-0.5"
                                      title="Remover exceção"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Botão Adicionar Exceção (SEMPRE HABILITADO MESMO COM CARD DESLIGADO) */}
                        <button
                          type="button"
                          onClick={() => controller.handleAbrirExcecao(diaNum)}
                          className="w-full mt-3 py-1.5 border border-dashed border-[#38342b] hover:border-[#e9c340] rounded text-[11px] font-mono text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer"
                        >
                          + Nova Exceção de Horário
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#99907b] text-xs">
              <svg className="w-12 h-12 mb-3 text-[#38342b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Selecione um profissional na lista para ver seus horários e detalhes.
            </div>
          )}
        </main>
      </div>

      {/* Modais */}
      <ModalNovoProfissional />
      <ModalServicosProfissional />
      <ModalAddExcecao />
    </div>
  );
}
