import React from 'react';
import { useModalAddExcecaoController } from './controller';

export function ModalAddExcecao() {
  const controller = useModalAddExcecaoController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b]">
          <div>
            <h2 className="font-sora font-bold text-lg text-[#eae2d3]">Nova Exceção de Horário</h2>
            {controller.profissionalNome && (
              <p className="font-mono text-xs text-[#d0c6af] font-medium mt-0.5">Profissional: {controller.profissionalNome}</p>
            )}
            {controller.nomeDiaCalculado && (
              <p className="font-mono text-xs text-[#e9c340] font-semibold mt-0.5">{controller.nomeDiaCalculado}</p>
            )}
          </div>
          <button
            type="button"
            onClick={controller.handleFechar}
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors rounded-md cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={controller.handleSalvar} className="p-6 space-y-4">
          {controller.erro && (
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] px-3.5 py-2 rounded-md text-xs">
              {controller.erro}
            </div>
          )}

          {/* Seletor de Data Específica */}
          <div>
            <label className="block text-xs font-mono text-[#99907b] mb-1">DATA ESPECÍFICA (EXCEÇÃO PONTUAL) *</label>
            <input
              type="date"
              required
              value={controller.dataStr}
              onChange={(e) => controller.setDataStr(e.target.value)}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs font-mono text-[#eae2d3]"
            />
          </div>

          {/* Tipo de Exceção */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono text-[#99907b]">TIPO DE EXCEÇÃO *</label>
              {controller.tipoTravado && (
                <span className="font-mono text-[10px] text-[#e9c340] font-semibold">
                  🔒 Travado em Atendimento Extra
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={controller.tipoTravado}
                onClick={() => !controller.tipoTravado && controller.setTipo('atendimento_extra')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  controller.tipo === 'atendimento_extra'
                    ? 'bg-[#e9c340]/15 border-[#e9c340] text-[#e9c340]'
                    : 'bg-[#110e06] border-[#38342b] text-[#99907b]'
                } ${controller.tipoTravado ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:text-[#eae2d3]'}`}
              >
                <div className="flex items-center gap-1.5 font-sora font-bold text-xs">
                  <span>⚡ Atendimento Extra</span>
                </div>
                <span className="text-[10px] mt-1 text-inherit font-normal">
                  Abre exceção de horário (ex: Domingo ou fora do expediente).
                </span>
              </button>

              <button
                type="button"
                disabled={controller.tipoTravado}
                onClick={() => !controller.tipoTravado && controller.setTipo('indisponibilidade')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  controller.tipo === 'indisponibilidade'
                    ? 'bg-[#93000a]/20 border-[#ffb4ab] text-[#ffb4ab]'
                    : 'bg-[#110e06] border-[#38342b] text-[#99907b]'
                } ${controller.tipoTravado ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:text-[#eae2d3]'}`}
              >
                <div className="flex items-center gap-1.5 font-sora font-bold text-xs">
                  <span>🚫 Indisponibilidade</span>
                </div>
                <span className="text-[10px] mt-1 text-inherit font-normal">
                  Bloqueia atendimento nesta data (não trabalho/folga).
                </span>
              </button>
            </div>
          </div>

          {/* Horários Início e Fim */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">INÍCIO DA EXCEÇÃO *</label>
              <input
                type="text"
                placeholder="11:30"
                required
                value={controller.inicio}
                onChange={(e) => controller.setInicio(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs font-mono text-center text-[#eae2d3]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">FIM DA EXCEÇÃO *</label>
              <input
                type="text"
                placeholder="15:00"
                required
                value={controller.fim}
                onChange={(e) => controller.setFim(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs font-mono text-center text-[#eae2d3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#99907b] mb-1">MOTIVO / OBSERVAÇÃO</label>
            <input
              type="text"
              placeholder={
                controller.tipo === 'atendimento_extra'
                  ? 'Ex: Atendimento pontual Domingo, Cliente VIP'
                  : 'Ex: Consulta médica, Folga parcial'
              }
              value={controller.motivo}
              onChange={(e) => controller.setMotivo(e.target.value)}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3] placeholder-[#99907b]"
            />
          </div>

          {/* Rodapé do Modal */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#38342b]">
            <button
              type="button"
              onClick={controller.handleFechar}
              className="px-4 py-2 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-xs font-semibold bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] transition-all cursor-pointer shadow-md"
            >
              Salvar Exceção
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
