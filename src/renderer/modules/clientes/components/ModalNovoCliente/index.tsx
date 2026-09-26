import React from 'react';
import { useModalNovoClienteController } from './controller';
import { DatePicker } from '@shared/ui/DatePicker';

export function ModalNovoCliente() {
  const controller = useModalNovoClienteController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b]">
          <h2 className="font-sora font-bold text-lg text-[#eae2d3]">
            {controller.isEdicao ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
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

        {/* Form Body */}
        <form onSubmit={controller.handleSalvar} className="p-6 space-y-4">
          {controller.erro && (
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] px-3.5 py-2.5 rounded-md text-xs">
              {controller.erro}
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-mono text-[#99907b] mb-1">NOME COMPLETO *</label>
            <input
              type="text"
              required
              placeholder="Ex: Alice Sampaio"
              value={controller.nome}
              onChange={(e) => controller.setNome(e.target.value)}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3]"
            />
          </div>

          {/* Telefone & Data de Nascimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">TELEFONE / WHATSAPP *</label>
              <input
                type="text"
                required
                maxLength={15}
                placeholder="(11) 98765-4321"
                value={controller.telefone}
                onChange={(e) => controller.setTelefone(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs font-mono text-[#eae2d3]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#99907b] mb-1">DATA DE NASCIMENTO</label>
              <DatePicker
                value={controller.dataNascimento}
                onChange={(val) => controller.setDataNascimento(val)}
                maxDate={new Date()}
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs font-mono text-[#99907b] mb-1">CPF</label>
            <input
              type="text"
              maxLength={14}
              placeholder="000.000.000-00"
              value={controller.cpf}
              onChange={(e) => controller.setCpf(e.target.value)}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs font-mono text-[#eae2d3]"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-mono text-[#99907b] mb-1">OBSERVAÇÕES / PREFERÊNCIAS</label>
            <textarea
              rows={2}
              placeholder="Preferências de atendimento, restrições ou notas livres..."
              value={controller.observacoes}
              onChange={(e) => controller.setObservacoes(e.target.value)}
              className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-3.5 py-2 text-xs text-[#eae2d3] resize-none"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 pt-1">
            <label className="text-xs font-mono text-[#99907b]">STATUS DO CADASTRO:</label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="radio"
                name="status_cliente"
                checked={controller.status === 'ativo'}
                onChange={() => controller.setStatus('ativo')}
                className="accent-[#e9c340]"
              />
              <span className="text-[#e9c340] font-semibold">Ativo</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="radio"
                name="status_cliente"
                checked={controller.status === 'inativo'}
                onChange={() => controller.setStatus('inativo')}
                className="accent-[#e9c340]"
              />
              <span className="text-[#99907b]">Inativo</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#38342b]">
            <button
              type="button"
              disabled={controller.salvando}
              onClick={controller.handleFechar}
              className="px-4 py-2 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={controller.salvando}
              className="px-5 py-2 rounded-md text-xs font-semibold bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {controller.salvando ? 'Salvando...' : controller.isEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
