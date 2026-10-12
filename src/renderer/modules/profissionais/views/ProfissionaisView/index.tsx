import React from 'react';
import { useProfissionaisViewController } from './controller';
import { ModalNovoProfissional } from '../../components/ModalNovoProfissional';
import { ModalServicosProfissional } from '../../components/ModalServicosProfissional';
import { ModalAddExcecao } from '../../components/ModalAddExcecao';
import { ModalExcluirProfissional } from '../../components/ModalExcluirProfissional';

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
          <div className="p-3 border-b border-[#38342b]">
            <div className="flex items-center w-full gap-1 bg-[#16130b] p-1 rounded-lg border border-[#38342b]">
              <button
                type="button"
                onClick={() => controller.setFiltroStatus('ativo')}
                className={`flex-1 py-1 rounded text-center text-xs font-mono cursor-pointer transition-colors ${
                  controller.filtroStatus === 'ativo'
                    ? 'bg-[#e9c340] text-[#110e06] font-bold shadow-sm'
                    : 'text-[#99907b] hover:text-[#eae2d3]'
                }`}
                title="Mostrar apenas ativos"
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => controller.setFiltroStatus('inativo')}
                className={`flex-1 py-1 rounded text-center text-xs font-mono cursor-pointer transition-colors ${
                  controller.filtroStatus === 'inativo'
                    ? 'bg-[#e9c340] text-[#110e06] font-bold shadow-sm'
                    : 'text-[#99907b] hover:text-[#eae2d3]'
                }`}
                title="Mostrar inativos"
              >
                Inativos
              </button>
              <button
                type="button"
                onClick={() => controller.setFiltroStatus('todos')}
                className={`flex-1 py-1 rounded text-center text-xs font-mono cursor-pointer transition-colors ${
                  controller.filtroStatus === 'todos'
                    ? 'bg-[#e9c340] text-[#110e06] font-bold shadow-sm'
                    : 'text-[#99907b] hover:text-[#eae2d3]'
                }`}
                title="Mostrar todos"
              >
                Todos
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#38342b]/40">
            {controller.profissionais.map((p) => {
              const isSelected = p.id === controller.profissionalAtual?.id;
              const isAtivo = p.status === 'ativo';
              const initials = p.nome
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => controller.setProfissionalSelecionadoId(p.id)}
                  className={`w-full text-left px-4 py-3.5 transition-all cursor-pointer relative flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#1f1b13] border-l-4 border-[#e9c340] shadow-inner'
                      : 'hover:bg-[#1f1b13]/60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-sora font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#e9c340] text-[#110e06] shadow-sm'
                        : 'bg-[#2d2a20] text-[#e9c340] border border-[#38342b]'
                    }`}
                  >
                    {initials || 'P'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3
                        className={`font-sora font-semibold text-sm truncate ${
                          isSelected ? 'text-[#eae2d3]' : 'text-[#d0c6af]'
                        }`}
                      >
                        {p.nome}
                      </h3>
                      {!isAtivo && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] shrink-0">
                          OFF
                        </span>
                      )}
                    </div>
                    {p.especialidade && (
                      <span className="block font-mono text-[10px] text-[#e9c340] uppercase mt-0.5 tracking-wider truncate">
                        {p.especialidade}
                      </span>
                    )}
                  </div>
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
            <div className="space-y-6 w-full max-w-[1600px] mx-auto">
              {/* Header do Profissional Selecionado */}
              <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#e9c340]/20 border border-[#e9c340]/40 flex items-center justify-center font-sora font-bold text-lg text-[#e9c340] shrink-0 shadow-md">
                    {controller.profissionalAtual.nome
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'P'}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
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
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#e9c340]/15 text-[#e9c340] border border-[#e9c340]/30 font-bold">
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
                        className="font-mono text-[10px] uppercase px-2.5 py-1 rounded-md bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer"
                      >
                        + Serviços
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ações do Profissional (Editar / Excluir) */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={controller.handleEditarProfissional}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2d2a20] hover:bg-[#3d392f] border border-[#38342b] text-[#eae2d3] transition-colors cursor-pointer shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    EDITAR
                  </button>

                  <button
                    type="button"
                    onClick={() => controller.handleAbrirModalExcluir(controller.profissionalAtual)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#93000a]/20 hover:bg-[#93000a]/40 border border-[#ffb4ab]/30 text-[#ffb4ab] transition-colors cursor-pointer shadow-sm"
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
              <div className="space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#1f1b13]/60 border border-[#38342b] rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#e9c340]/15 border border-[#e9c340]/30 flex items-center justify-center text-[#e9c340]">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-sora font-bold text-lg text-[#eae2d3]">Horários de Trabalho</h3>
                        <p className="text-[11px] text-[#99907b]">Defina a rotina semanal e turnos de atendimento</p>
                      </div>
                    </div>

                    {/* Filtro de Visualização de Dias */}
                    <div className="flex items-center bg-[#110e06] p-1 rounded-lg border border-[#38342b] ml-0 sm:ml-2">
                      <button
                        type="button"
                        onClick={() => controller.setFiltroDias('todos')}
                        className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                          controller.filtroDias === 'todos'
                            ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-sm'
                            : 'text-[#99907b] hover:text-[#eae2d3]'
                        }`}
                      >
                        Todos (7)
                      </button>
                      <button
                        type="button"
                        onClick={() => controller.setFiltroDias('uteis')}
                        className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                          controller.filtroDias === 'uteis'
                            ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-sm'
                            : 'text-[#99907b] hover:text-[#eae2d3]'
                        }`}
                      >
                        Seg a Sex (5)
                      </button>
                      <button
                        type="button"
                        onClick={() => controller.setFiltroDias('fim_de_semana')}
                        className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                          controller.filtroDias === 'fim_de_semana'
                            ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-sm'
                            : 'text-[#99907b] hover:text-[#eae2d3]'
                        }`}
                      >
                        Fim de Semana (2)
                      </button>
                    </div>

                    {controller.horariosSalvosSucesso && (
                      <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold animate-in fade-in flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Horários salvos com sucesso!
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => controller.replicarHorariosSemana(1)}
                      className="flex items-center justify-center gap-1.5 font-mono text-xs uppercase font-semibold px-3.5 py-2 rounded-lg bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] text-[#d0c6af] hover:text-[#eae2d3] transition-all cursor-pointer shadow-sm"
                      title="Copia os horários de Segunda-feira para Terça a Sábado"
                    >
                      <svg className="w-3.5 h-3.5 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      REPLICAR HORÁRIOS
                    </button>

                    <button
                      type="button"
                      onClick={controller.salvarHorarios}
                      disabled={controller.salvandoHorarios}
                      className="flex items-center justify-center gap-1.5 font-sora font-semibold text-xs px-4 py-2 rounded-lg bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] disabled:opacity-50 transition-all cursor-pointer shadow-md"
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

                {/* Grade Elegante e Responsiva de Cards dos Dias da Semana */}
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  }}
                >
                  {controller.diasExibidos.map((diaNum) => {
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

                    const diaInfo = controller.diasSemanaInfo[diaNum] || {
                      sigla: 'DIA',
                      nome: controller.diasSemanaNomes[diaNum] || 'Dia',
                      subtitulo: '',
                      tipo: 'dia_util' as const,
                    };

                    return (
                      <div
                        key={diaNum}
                        className={`border rounded-xl p-4 shadow-lg transition-all duration-200 flex flex-col justify-between ${
                          horario.ativo
                            ? 'bg-[#1f1b13] border-[#38342b] hover:border-[#e9c340]/50'
                            : 'bg-[#18150e] border-[#2d2920] opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="space-y-3.5">
                          {/* Header do Card */}
                          <div className="flex items-center justify-between pb-3 border-b border-[#38342b]">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  horario.ativo
                                    ? 'bg-[#e9c340]/20 text-[#e9c340] border border-[#e9c340]/30'
                                    : 'bg-[#2d2a20] text-[#99907b] border border-[#38342b]'
                                }`}
                              >
                                {diaInfo.sigla}
                              </span>
                              <div>
                                <h4 className="font-sora font-bold text-sm text-[#eae2d3]">
                                  {diaInfo.nome}
                                </h4>
                                <span className="font-inter text-[10px] text-[#99907b]">
                                  {diaInfo.subtitulo}
                                </span>
                              </div>
                            </div>

                            {/* Botão de Toggle Ativo / Folga */}
                            <button
                              type="button"
                              onClick={() => controller.atualizarHorarioSemanal(diaNum, 'ativo', !horario.ativo)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
                                horario.ativo
                                  ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/25'
                                  : 'bg-[#2d2a20] text-[#99907b] border border-[#38342b] hover:text-[#eae2d3] hover:border-[#e9c340]/40'
                              }`}
                              title={horario.ativo ? 'Clique para desativar este dia (Folga)' : 'Clique para ativar expediente'}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  horario.ativo ? 'bg-[#10b981]' : 'bg-[#99907b]'
                                }`}
                              />
                              {horario.ativo ? 'Ativo' : 'Folga'}
                            </button>
                          </div>

                          {/* Conteúdo Principal do Card */}
                          {horario.ativo ? (
                            <div className="space-y-3">
                              {/* Turno Manhã */}
                              <div className="bg-[#110e06] border border-[#38342b]/70 rounded-lg p-2.5 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-[#99907b] font-mono">
                                  <span className="flex items-center gap-1.5 text-[#d0c6af] font-semibold">
                                    <svg className="w-3.5 h-3.5 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="4" />
                                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                    </svg>
                                    MANHÃ
                                  </span>
                                  <span className="text-[10px] text-[#99907b]">Turno 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={horario.manhaInicio}
                                    placeholder="08:00"
                                    onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'manhaInicio', e.target.value)}
                                    className="flex-1 min-w-0 bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] focus:ring-1 focus:ring-[#e9c340]/30 rounded-md px-2.5 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none transition-all"
                                  />
                                  <span className="text-xs text-[#99907b] shrink-0 font-inter">até</span>
                                  <input
                                    type="text"
                                    value={horario.manhaFim}
                                    placeholder="11:00"
                                    onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'manhaFim', e.target.value)}
                                    className="flex-1 min-w-0 bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] focus:ring-1 focus:ring-[#e9c340]/30 rounded-md px-2.5 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none transition-all"
                                  />
                                </div>
                              </div>

                              {/* Turno Tarde */}
                              <div className="bg-[#110e06] border border-[#38342b]/70 rounded-lg p-2.5 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-[#99907b] font-mono">
                                  <span className="flex items-center gap-1.5 text-[#d0c6af] font-semibold">
                                    <svg className="w-3.5 h-3.5 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                    </svg>
                                    TARDE
                                  </span>
                                  <span className="text-[10px] text-[#99907b]">Turno 2</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={horario.tardeInicio}
                                    placeholder="13:30"
                                    onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'tardeInicio', e.target.value)}
                                    className="flex-1 min-w-0 bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] focus:ring-1 focus:ring-[#e9c340]/30 rounded-md px-2.5 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none transition-all"
                                  />
                                  <span className="text-xs text-[#99907b] shrink-0 font-inter">até</span>
                                  <input
                                    type="text"
                                    value={horario.tardeFim}
                                    placeholder="17:00"
                                    onChange={(e) => controller.atualizarHorarioSemanal(diaNum, 'tardeFim', e.target.value)}
                                    className="flex-1 min-w-0 bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] focus:ring-1 focus:ring-[#e9c340]/30 rounded-md px-2.5 py-1.5 text-xs text-center font-mono text-[#eae2d3] outline-none transition-all"
                                  />
                                </div>
                              </div>

                              {/* Pausa para Almoço */}
                              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#110e06]/80 border border-[#38342b]/60 text-xs">
                                <span className="flex items-center gap-1.5 text-[#99907b] text-[11px]">
                                  <span>☕</span> Pausa Almoço:
                                </span>
                                <span className="font-mono text-[#e9c340] font-semibold text-xs">
                                  {horario.intervaloAlmoco || '11:00 - 13:30'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Estado Limpo quando o Dia é Folga */
                            <div className="py-7 px-3 flex flex-col items-center justify-center text-center rounded-lg bg-[#110e06]/50 border border-dashed border-[#38342b]/60">
                              <div className="w-10 h-10 rounded-full bg-[#16130b] border border-[#38342b] flex items-center justify-center text-[#99907b] mb-2.5">
                                <svg className="w-5 h-5 text-[#99907b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                </svg>
                              </div>
                              <span className="font-sora font-semibold text-xs text-[#d0c6af]">Dia de Folga</span>
                              <span className="font-inter text-[11px] text-[#99907b] mt-0.5">Sem expediente programado</span>
                              <button
                                type="button"
                                onClick={() => controller.atualizarHorarioSemanal(diaNum, 'ativo', true)}
                                className="mt-3 px-3 py-1.5 bg-[#2d2a20] hover:bg-[#3d392f] border border-[#38342b] hover:border-[#e9c340]/50 text-[#e9c340] text-xs font-medium rounded-md transition-all cursor-pointer"
                              >
                                + Ativar Expediente
                              </button>
                            </div>
                          )}

                          {/* Exceções de Horário Registradas para esta Data */}
                          {horario.excecoes && horario.excecoes.length > 0 && (
                            <div className="pt-2 border-t border-[#38342b]/60 space-y-1.5">
                              <span className="block font-mono text-[9px] text-[#99907b] uppercase font-bold tracking-wider">
                                EXCEÇÕES NESTE DIA ({horario.excecoes.length}):
                              </span>
                              {horario.excecoes.map((exc) => {
                                const isExtra = exc.tipo === 'atendimento_extra';
                                return (
                                  <div
                                    key={exc.id}
                                    className={`flex items-start justify-between rounded-lg p-2 text-xs border gap-1.5 transition-all ${
                                      isExtra
                                        ? 'bg-[#e9c340]/15 border-[#e9c340]/40 text-[#e9c340]'
                                        : 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]'
                                    }`}
                                  >
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-mono font-bold truncate">
                                        {isExtra ? '⚡ Atendimento Extra:' : '🚫 Bloqueio/Ausência:'} {exc.inicio} - {exc.fim}
                                      </span>
                                      {exc.data && <span className="font-mono text-[10px] opacity-80 mt-0.5">Data: {exc.data}</span>}
                                      {exc.motivo && <span className="text-[10px] opacity-90 truncate mt-0.5">{exc.motivo}</span>}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => controller.removerExcecaoHorario(diaNum, exc.id)}
                                      className="hover:opacity-80 shrink-0 cursor-pointer font-bold text-xs p-1"
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

                        {/* Botão Adicionar Exceção */}
                        <button
                          type="button"
                          onClick={() => controller.handleAbrirExcecao(diaNum)}
                          className="w-full mt-3.5 py-2 border border-dashed border-[#38342b] hover:border-[#e9c340] rounded-lg text-xs font-mono text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Nova Exceção de Horário
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
      <ModalExcluirProfissional />
    </div>
  );
}
