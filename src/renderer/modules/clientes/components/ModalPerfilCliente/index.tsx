import React from 'react';
import { useModalPerfilClienteController } from './controller';
import { formatarCelular, formatarCPF, formatarDataBR } from '@shared/lib/formatters';

export function ModalPerfilCliente() {
  const controller = useModalPerfilClienteController();

  if (!controller.modalAberto || !controller.cliente) return null;

  const { cliente } = controller;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b]">
          <h2 className="font-sora font-bold text-lg text-[#eae2d3]">Perfil do Cliente</h2>
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
        <div className="p-6 space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">NOME COMPLETO</label>
            <input
              type="text"
              readOnly
              value={cliente.nome}
              className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2.5 text-xs text-[#eae2d3] font-inter outline-none cursor-default"
            />
          </div>

          {/* Telefone & Data de Nascimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">TELEFONE</label>
              <input
                type="text"
                readOnly
                value={formatarCelular(cliente.telefone)}
                className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2.5 text-xs font-mono text-[#eae2d3] outline-none cursor-default"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">DATA DE NASCIMENTO</label>
              <input
                type="text"
                readOnly
                value={formatarDataBR(cliente.dataNascimento)}
                className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2.5 text-xs font-mono text-[#eae2d3] outline-none cursor-default"
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">CPF</label>
            <input
              type="text"
              readOnly
              value={cliente.cpf ? formatarCPF(cliente.cpf) : 'Não informado'}
              className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2.5 text-xs font-mono text-[#eae2d3] outline-none cursor-default"
            />
          </div>


          {/* Status da Conta */}
          <div>
            <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1.5">STATUS DA CONTA</label>
            <span
              className={`inline-block font-mono text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${
                cliente.status === 'ativo'
                  ? 'bg-[#e9c340]/15 text-[#e9c340] border-[#e9c340]/30'
                  : 'bg-[#99907b]/15 text-[#99907b] border-[#38342b]'
              }`}
            >
              {cliente.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-t border-[#38342b]">
          <button
            type="button"
            onClick={controller.handleExcluir}
            className="flex items-center gap-1.5 text-xs text-[#ffb4ab] hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#ffb4ab]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Excluir Cliente
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={controller.handleFechar}
              className="px-4 py-2 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={controller.handleEditar}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] transition-all cursor-pointer shadow-md"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Editar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
