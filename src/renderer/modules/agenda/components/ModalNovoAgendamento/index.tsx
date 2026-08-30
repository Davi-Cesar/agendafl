import React from 'react';
import { useModalNovoAgendamentoController } from './controller';

export function ModalNovoAgendamento() {
  const controller = useModalNovoAgendamentoController();

  if (!controller.aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg w-full max-w-lg shadow-2xl p-6 font-inter text-[#eae2d3] relative animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#38342b] pb-4 mb-4">
          <h2 className="font-sora font-semibold text-lg text-[#eae2d3]">
            Novo Agendamento
          </h2>
          <button
            type="button"
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors"
            onClick={controller.fecharModal}
            aria-label="Fechar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Mensagem de Erro */}
        {controller.erro && (
          <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs p-3 rounded-md mb-4">
            {controller.erro}
          </div>
        )}

        {/* Form Body */}
        <form id="modal-agendamento-form" onSubmit={controller.handleSubmit} className="space-y-4" autoComplete="off">
          {/* CLIENTE */}
          <div className="relative">
            <label className="block text-xs font-mono text-[#99907b] mb-1">
              CLIENTE
            </label>
            <div className="relative flex items-center">
              <svg className="w-4 h-4 text-[#99907b] absolute left-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md pl-9 pr-3 py-2 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all"
                type="text"
                placeholder="Buscar cliente por nome ou telefone..."
                value={controller.clienteNome}
                onChange={(e) => {
                  controller.setClienteNome(e.target.value);
                  controller.setAutocompleteVisible(true);
                }}
                required
              />
            </div>

            {controller.autocompleteVisible && controller.matchesAutocomplete.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-[#1f1b13] border border-[#38342b] rounded-md shadow-xl max-h-40 overflow-y-auto z-20 divide-y divide-[#38342b]">
                {controller.matchesAutocomplete.map((item) => (
                  <li
                    key={item.id}
                    className="px-3 py-2 text-xs hover:bg-[#2d2a20] cursor-pointer flex justify-between items-center"
                    onClick={() => controller.handleSelectCliente(item.nome)}
                  >
                    <span className="font-medium text-[#eae2d3]">{item.nome}</span>
                    <span className="font-mono text-[11px] text-[#99907b]">{item.telefone}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* SERVIÇO & PROFISSIONAL (2 colunas) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">
                SERVIÇO
              </label>
              <select
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] transition-all"
                value={controller.servico}
                onChange={(e) => controller.setServico(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione o serviço
                </option>
                {controller.servicosList.map((s) => (
                  <option key={s.id} value={s.nome}>
                    {s.nome} ({s.duracaoMinutos} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">
                PROFISSIONAL
              </label>
              <select
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] transition-all"
                value={controller.profissionalId}
                onChange={(e) => controller.setProfissionalId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione o profissional
                </option>
                {controller.profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {p.especialidade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DATA & HORÁRIO (2 colunas) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">
                DATA
              </label>
              <input
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] transition-all"
                type="date"
                value={controller.data}
                onChange={(e) => controller.setData(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">
                HORÁRIO INÍCIO
              </label>
              <input
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] transition-all"
                type="time"
                step="1800"
                value={controller.horarioInicio}
                onChange={(e) => controller.setHorarioInicio(e.target.value)}
                required
              />
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div>
            <label className="block text-xs font-mono text-[#99907b] mb-1">
              OBSERVAÇÕES (OPCIONAL)
            </label>
            <textarea
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md p-3 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all h-20 resize-none"
              placeholder="Adicione notas sobre o agendamento..."
              value={controller.observacoes}
              onChange={(e) => controller.setObservacoes(e.target.value)}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#38342b] pt-4 mt-6">
          <button
            type="button"
            className="bg-transparent border border-[#38342b] hover:bg-[#2d2a20] text-[#eae2d3] px-4 py-2 rounded-md text-xs font-medium transition-all"
            onClick={controller.fecharModal}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="modal-agendamento-form"
            className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold px-5 py-2 rounded-md text-xs transition-all flex items-center gap-2 cursor-pointer"
            disabled={controller.carregando}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {controller.carregando ? 'Salvando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
