import React from 'react';
import { useModalNovoProfissionalController } from './controller';

export function ModalNovoProfissional() {
  const controller = useModalNovoProfissionalController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b]">
          <h2 className="font-sora font-bold text-lg text-[#eae2d3]">
            {controller.isEdicao ? 'Editar Profissional' : 'Novo Profissional'}
          </h2>
          <button
            type="button"
            onClick={controller.handleFechar}
            className="text-[#99907b] hover:text-[#eae2d3] p-1 transition-colors rounded-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={controller.handleSalvar} className="p-6 space-y-4">
          {controller.erro && (
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] px-3.5 py-2.5 rounded-md text-xs">
              {controller.erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-[#99907b] mb-1">NOME COMPLETO *</label>
            <input
              type="text"
              required
              placeholder="Ex: Helena Souza"
              value={controller.nome}
              onChange={(e) => controller.setNome(e.target.value)}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3] placeholder-[#99907b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">ESPECIALIDADE / CARGO</label>
              <input
                type="text"
                placeholder="Ex: Especialista Facial"
                value={controller.especialidade}
                onChange={(e) => controller.setEspecialidade(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3] placeholder-[#99907b]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">COMISSÃO (%)</label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value="60%"
                  className="w-full bg-[#110e06]/60 border border-[#38342b] rounded-md px-3.5 py-2 text-xs text-[#e9c340] font-mono font-bold cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#99907b]">
                  FIXO
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">TELEFONE / WHATSAPP</label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={controller.telefone}
                onChange={(e) => controller.setTelefone(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3] placeholder-[#99907b]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">E-MAIL</label>
              <input
                type="email"
                placeholder="helena@aura.com"
                value={controller.email}
                onChange={(e) => controller.setEmail(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3] placeholder-[#99907b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">CPF</label>
              <input
                type="text"
                placeholder="123.456.789-00"
                value={controller.cpf}
                onChange={(e) => controller.setCpf(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3] placeholder-[#99907b]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">STATUS</label>
              <select
                value={controller.status}
                onChange={(e) => controller.setStatus(e.target.value as any)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3]"
              >
                <option value="ativo">Ativo no Sistema</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
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
              disabled={controller.salvando}
              className="px-5 py-2 rounded-md text-xs font-semibold bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {controller.salvando ? 'Salvando...' : 'Salvar Profissional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
