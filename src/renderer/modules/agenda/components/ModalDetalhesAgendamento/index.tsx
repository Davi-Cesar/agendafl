import React from 'react';
import { useModalDetalhesAgendamentoController } from './controller';
import { hexToRgba } from '../../store/statusCores.store';

export function ModalDetalhesAgendamento() {
  const controller = useModalDetalhesAgendamentoController();
  const apt = controller.agendamento;

  if (!apt) return null;

  const stAtual = controller.statusAtualConfig;
  const isEmAtendimento = apt.status === 'em_atendimento';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg w-full max-w-md shadow-2xl p-6 font-inter text-[#eae2d3] relative animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#38342b] pb-3 mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-sora font-semibold text-lg text-[#eae2d3]">
              {controller.editando ? 'Alterar Agendamento' : 'Detalhes do Agendamento'}
            </h2>
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border"
              style={{
                backgroundColor: hexToRgba(stAtual.cor, 0.2),
                borderColor: hexToRgba(stAtual.cor, 0.55),
                color: stAtual.cor,
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isEmAtendimento ? 'animate-ping' : ''}`}
                style={{ backgroundColor: stAtual.cor }}
              />
              {stAtual.label}
            </span>
            {apt.comandaNumero && (
              <span className="bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                Comanda {apt.comandaNumero}
              </span>
            )}
          </div>
          <button
            type="button"
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors cursor-pointer"
            onClick={controller.fecharModal}
            aria-label="Fechar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {controller.editando ? (
          <form id="modal-editar-agendamento-form" onSubmit={controller.handleSalvarEdicao} className="space-y-4">
            {controller.erroEdicao && (
              <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs p-3 rounded-md">
                {controller.erroEdicao}
              </div>
            )}

            <div className="bg-[#110e06] border border-[#38342b] rounded-md px-4 py-3">
              <span className="block font-mono text-[10px] text-[#99907b] mb-0.5">CLIENTE</span>
              <div className="font-sora font-bold text-sm text-[#e9c340]">{apt.clienteNome}</div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">
                PROFISSIONAL
              </label>
              <select
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] transition-all"
                value={controller.profissionalIdEdit}
                onChange={(e) => controller.handleProfissionalEditChange(e.target.value)}
                required
              >
                {controller.profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#99907b] mb-1">
                  SERVIÇO
                </label>
                <select
                  className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] transition-all disabled:opacity-60"
                  value={controller.servicoEdit}
                  onChange={(e) => controller.setServicoEdit(e.target.value)}
                  disabled={
                    controller.carregandoServicosEdit ||
                    (controller.servicosList.length === 0 && !controller.servicoEdit)
                  }
                  required
                >
                  {controller.carregandoServicosEdit ? (
                    <option value="" disabled>
                      Carregando serviços...
                    </option>
                  ) : controller.servicosList.length === 0 && !controller.servicoEdit ? (
                    <option value="" disabled>
                      Nenhum serviço vinculado
                    </option>
                  ) : (
                    <>
                      {controller.servicoEdit &&
                        !controller.servicosList.some((s) => s.nome === controller.servicoEdit) && (
                          <option value={controller.servicoEdit}>{controller.servicoEdit}</option>
                        )}
                      {controller.servicosList.map((s) => (
                        <option key={s.id} value={s.nome}>
                          {s.nome} ({s.duracaoMinutos} min)
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {!controller.carregandoServicosEdit && controller.servicosList.length === 0 && (
                  <p className="mt-1 text-[10px] text-[#ffb4ab]">
                    Sem serviços vinculados a este profissional.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono text-[#99907b]">
                    HORÁRIO
                  </label>
                  <span className="font-mono text-[10px] text-[#99907b]">
                    até {controller.horarioFimEditCalculado}
                  </span>
                </div>
                <input
                  className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] transition-all"
                  type="time"
                  step="300"
                  value={controller.horarioInicioEdit}
                  onChange={(e) => controller.setHorarioInicioEdit(e.target.value)}
                  required
                />
              </div>
            </div>

            {controller.isHorarioExcecaoEdit && (
              <div className="bg-[#e9c340]/10 border border-[#e9c340]/40 rounded-md px-3 py-2 text-xs text-[#eae2d3]">
                <strong className="text-[#e9c340] font-semibold">Exceção nesse horário:</strong> O profissional selecionado não atende normalmente às{' '}
                <span className="font-mono font-semibold text-[#e9c340]">{controller.horarioInicioEdit}</span> nesta data.
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">
                OBSERVAÇÕES (OPCIONAL)
              </label>
              <textarea
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md p-3 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all h-20 resize-none"
                placeholder="Adicione notas sobre o agendamento..."
                value={controller.observacoesEdit}
                onChange={(e) => controller.setObservacoesEdit(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#38342b] pt-4 mt-4">
              <button
                type="button"
                className="bg-transparent border border-[#38342b] hover:bg-[#2d2a20] text-[#eae2d3] px-4 py-2 rounded-md text-xs font-medium transition-all cursor-pointer"
                onClick={controller.cancelarEdicao}
                disabled={controller.salvandoEdicao}
              >
                Voltar
              </button>
              <button
                type="submit"
                className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold px-5 py-2 rounded-md text-xs transition-all cursor-pointer"
                disabled={controller.salvandoEdicao}
              >
                {controller.salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-4">
              <div className="bg-[#110e06] border border-[#38342b] rounded-md p-4">
                <div className="font-sora font-bold text-base text-[#e9c340] mb-1">{apt.clienteNome}</div>
                <div className="font-inter text-xs text-[#d0c6af]">{apt.servico}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#110e06] p-3 rounded-md border border-[#38342b] flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] text-[#99907b] mb-0.5">PROFISSIONAL</span>
                    <span className="font-medium text-[#eae2d3] truncate block">{controller.profissionalNome}</span>
                  </div>
                  {controller.podeEditar && (
                    <button
                      type="button"
                      onClick={controller.iniciarEdicao}
                      className="text-[#99907b] hover:text-[#e9c340] p-1 rounded hover:bg-[#2d2a20] transition-colors cursor-pointer shrink-0"
                      title="Trocar profissional ou alterar agendamento"
                      aria-label="Alterar profissional"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="bg-[#110e06] p-3 rounded-md border border-[#38342b]">
                  <span className="block font-mono text-[10px] text-[#99907b] mb-0.5">HORÁRIO</span>
                  <span className="font-mono text-[#eae2d3]">
                    {apt.horarioInicio} às {apt.horarioFim}
                  </span>
                </div>
              </div>

              {apt.observacoes && (
                <div className="bg-[#110e06] p-3 rounded-md border border-[#e9c340]/40 text-xs">
                  <span className="block font-mono text-[10px] text-[#e9c340] uppercase mb-1">
                    📝 OBSERVAÇÕES DO AGENDAMENTO
                  </span>
                  <p className="text-[#eae2d3] whitespace-pre-wrap leading-relaxed">{apt.observacoes}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="block font-mono text-[10px] text-[#99907b]">ALTERAR STATUS DA AGENDA</span>
                  <button
                    type="button"
                    onClick={controller.abrirModalStatusCores}
                    className="font-mono text-[10px] text-[#e9c340] hover:underline cursor-pointer"
                  >
                    + Cores / Status
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {controller.statusList.map((st) => {
                    const ativo = apt.status === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        className="py-2 px-1.5 rounded-md font-mono text-[11px] font-semibold transition-all cursor-pointer border truncate"
                        style={
                          ativo
                            ? {
                                backgroundColor: st.cor,
                                borderColor: st.cor,
                                color: '#110e06',
                                boxShadow: `0 0 10px ${hexToRgba(st.cor, 0.5)}`,
                              }
                            : {
                                backgroundColor: hexToRgba(st.cor, 0.14),
                                borderColor: hexToRgba(st.cor, 0.45),
                                color: st.cor,
                              }
                        }
                        onClick={() => controller.handleMudarStatus(st.id)}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#38342b] pt-4 mt-6">
              <button
                type="button"
                className="bg-[#93000a]/20 hover:bg-[#93000a] text-[#ffb4ab] px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer"
                onClick={controller.excluirAgendamento}
              >
                Cancelar
              </button>

              <div className="flex items-center gap-2">
                {controller.podeEditar && (
                  <button
                    type="button"
                    className="bg-transparent border border-[#38342b] hover:border-[#e9c340] hover:bg-[#2d2a20] text-[#eae2d3] px-3.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer"
                    onClick={controller.iniciarEdicao}
                  >
                    Alterar
                  </button>
                )}

                <button
                  type="button"
                  className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold px-5 py-2 rounded-md text-xs transition-all cursor-pointer"
                  onClick={controller.handleAbrirComanda}
                >
                  {apt.comandaId ? `Ver Comanda ${apt.comandaNumero || ''}` : 'Abrir Comanda'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
