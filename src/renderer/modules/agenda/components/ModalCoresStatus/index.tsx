import React from 'react';
import { useModalCoresStatusController } from './controller';
import { hexToRgba } from '../../store/statusCores.store';

export function ModalCoresStatus() {
  const controller = useModalCoresStatusController();

  if (!controller.modalAberto) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-inter text-[#eae2d3]"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#38342b] pb-3.5 mb-4">
          <div>
            <h2 className="font-sora font-bold text-lg text-[#eae2d3]">
              Cores e Status da Agenda
            </h2>
            <p className="text-xs text-[#99907b] mt-0.5">
              Altere as cores dos status existentes ou adicione novos status personalizados
            </p>
          </div>
          <button
            type="button"
            onClick={controller.fecharModal}
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Lista de Status Existentes */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-[#99907b]">
            Status Atuais ({controller.statusList.length})
          </span>

          {controller.statusList.map((st) => (
            <div
              key={st.id}
              className="bg-[#110e06] border border-[#38342b] rounded-lg p-3 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase border"
                    style={{
                      backgroundColor: hexToRgba(st.cor, 0.2),
                      borderColor: hexToRgba(st.cor, 0.55),
                      color: st.cor,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: st.cor }}
                    />
                    {st.label}
                  </span>
                  {st.fixo && (
                    <span className="font-mono text-[10px] text-[#99907b]">Padrão</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Seletor livre de cor */}
                  <label
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1f1b13] border border-[#38342b] hover:border-[#e9c340] cursor-pointer text-[11px] font-mono text-[#eae2d3]"
                    title="Escolher qualquer cor personalizada"
                  >
                    <input
                      type="color"
                      value={st.cor}
                      onChange={(e) => controller.alterarCorStatus(st.id, e.target.value)}
                      className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer p-0"
                    />
                    <span>{st.cor.toUpperCase()}</span>
                  </label>

                  {!st.fixo && (
                    <button
                      type="button"
                      onClick={() => controller.removerStatus(st.id)}
                      className="px-2 py-1 rounded bg-[#93000a]/20 hover:bg-[#93000a] text-[#ffb4ab] text-[11px] font-mono transition-colors cursor-pointer"
                      title="Remover status personalizado"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {/* Paleta rápida de cores para clicar e trocar na hora */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#38342b]/40">
                <span className="text-[10px] font-mono text-[#99907b] mr-1">Cores rápidas:</span>
                {controller.coresPreset.map((corHex) => {
                  const selecionada = st.cor.toLowerCase() === corHex.toLowerCase();
                  return (
                    <button
                      key={corHex}
                      type="button"
                      onClick={() => controller.alterarCorStatus(st.id, corHex)}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        selecionada ? 'scale-125 ring-2 ring-white' : 'hover:scale-110 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: corHex }}
                      title={`Mudar cor de ${st.label} para ${corHex}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Formulário para Adicionar Novo Status e Cor */}
        <form
          onSubmit={controller.handleAdicionarNovoStatus}
          className="mt-4 pt-4 border-t border-[#38342b] space-y-3"
        >
          <span className="block font-mono text-[10px] uppercase tracking-wider text-[#e9c340] font-semibold">
            + Adicionar Novo Status / Cor
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Nome do novo status (ex: Confirmado, Aguardando...)"
              value={controller.novoNome}
              onChange={(e) => controller.setNovoNome(e.target.value)}
              className="flex-1 min-w-[180px] bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3 py-2 text-xs text-[#eae2d3] placeholder-[#99907b]"
            />

            <label
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] cursor-pointer text-xs font-mono text-[#eae2d3]"
              title="Escolher cor do novo status"
            >
              <input
                type="color"
                value={controller.novaCor}
                onChange={(e) => controller.setNovaCor(e.target.value)}
                className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer p-0"
              />
              <span>{controller.novaCor.toUpperCase()}</span>
            </label>

            <button
              type="submit"
              className="bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-semibold px-4 py-2 rounded-md text-xs transition-all cursor-pointer shrink-0"
            >
              + Adicionar
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#99907b] mr-1">Sugestões de cor:</span>
            {controller.coresPreset.map((corHex) => (
              <button
                key={corHex}
                type="button"
                onClick={() => controller.setNovaCor(corHex)}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  controller.novaCor.toLowerCase() === corHex.toLowerCase()
                    ? 'scale-125 ring-2 ring-white'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: corHex }}
              />
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#38342b] pt-4 mt-4">
          <button
            type="button"
            onClick={controller.restaurarPadrao}
            className="text-xs font-mono text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer"
          >
            Restaurar cores padrão
          </button>

          <button
            type="button"
            onClick={controller.fecharModal}
            className="bg-[#2d2a20] hover:bg-[#38342b] text-[#eae2d3] font-semibold px-5 py-2 rounded-md text-xs transition-all cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
