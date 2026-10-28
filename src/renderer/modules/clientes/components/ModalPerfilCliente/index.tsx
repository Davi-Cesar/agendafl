import React from 'react';
import { useModalPerfilClienteController } from './controller';
import { formatarCelular, formatarCPF, formatarDataBR } from '@shared/lib/formatters';
import { formatCurrency } from '@shared/lib/utils';

export function ModalPerfilCliente() {
  const controller = useModalPerfilClienteController();

  if (!controller.modalAberto || !controller.cliente) return null;

  const { cliente } = controller;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b] shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-sora font-bold text-lg text-[#eae2d3]">Perfil do Cliente</h2>
            <span
              className={`inline-block font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                cliente.status === 'ativo'
                  ? 'bg-[#e9c340]/15 text-[#e9c340] border-[#e9c340]/30'
                  : 'bg-[#99907b]/15 text-[#99907b] border-[#38342b]'
              }`}
            >
              {cliente.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
            </span>
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Dados Cadastrais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nome Completo */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">NOME COMPLETO</label>
              <input
                type="text"
                readOnly
                value={cliente.nome}
                className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2 text-xs text-[#eae2d3] font-inter outline-none cursor-default"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">TELEFONE</label>
              <input
                type="text"
                readOnly
                value={formatarCelular(cliente.telefone)}
                className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2 text-xs font-mono text-[#eae2d3] outline-none cursor-default"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">DATA DE NASCIMENTO</label>
              <input
                type="text"
                readOnly
                value={formatarDataBR(cliente.dataNascimento)}
                className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2 text-xs font-mono text-[#eae2d3] outline-none cursor-default"
              />
            </div>

            {/* CPF */}
            <div className={cliente.observacoes ? '' : 'sm:col-span-2'}>
              <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">CPF</label>
              <input
                type="text"
                readOnly
                value={cliente.cpf ? formatarCPF(cliente.cpf) : 'Não informado'}
                className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2 text-xs font-mono text-[#eae2d3] outline-none cursor-default"
              />
            </div>

            {/* Observações (se houver) */}
            {cliente.observacoes && (
              <div>
                <label className="block text-[10px] font-mono text-[#99907b] uppercase mb-1">OBSERVAÇÕES</label>
                <input
                  type="text"
                  readOnly
                  value={cliente.observacoes}
                  className="w-full bg-[#110e06] border border-[#38342b] rounded-md px-3.5 py-2 text-xs text-[#eae2d3] outline-none cursor-default"
                />
              </div>
            )}
          </div>

          {/* Seção: Histórico de Atendimentos do Cliente */}
          <div className="border-t border-[#38342b] pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-sora font-semibold text-sm text-[#e9c340]">
                  Histórico de Serviços Realizados
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#110e06] text-[#99907b] border border-[#38342b]">
                  {controller.historicoFiltrado.length}
                </span>
              </div>

              {/* Seletores clicáveis de Serviço e Profissional */}
              {controller.historicoCliente.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={controller.filtroServico}
                    onChange={(e) => controller.setFiltroServico(e.target.value)}
                    className="bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-2.5 py-1.5 text-xs text-[#eae2d3] cursor-pointer"
                  >
                    <option value="todos">Todos os Serviços</option>
                    {controller.listaServicos.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>

                  <select
                    value={controller.filtroProfissional}
                    onChange={(e) => controller.setFiltroProfissional(e.target.value)}
                    className="bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-2.5 py-1.5 text-xs text-[#eae2d3] cursor-pointer"
                  >
                    <option value="todos">Selecionar Profissional (Todos)</option>
                    {controller.listaProfissionais.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Tabela de Histórico com Scroll Vertical */}
            <div className="bg-[#110e06] border border-[#38342b] rounded-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#16130b] border-b border-[#38342b] font-mono text-[10px] text-[#99907b] uppercase">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">DATA</th>
                      <th className="py-2.5 px-3 font-medium">SERVIÇO</th>
                      <th className="py-2.5 px-3 font-medium">PROFISSIONAL</th>
                      <th className="py-2.5 px-3 font-medium text-right">VALOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#38342b]/40">
                    {controller.carregandoHistorico ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#99907b] font-mono text-xs">
                          Carregando histórico do cliente...
                        </td>
                      </tr>
                    ) : controller.historicoFiltrado.length > 0 ? (
                      controller.historicoFiltrado.map((item) => (
                        <tr key={item.id} className="hover:bg-[#2d2a20]/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[#d0c6af] whitespace-nowrap">
                            <span>{formatarDataBR(item.data)}</span>
                            {item.horario && (
                              <span className="text-[#99907b] text-[10px] ml-1.5">{item.horario}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#eae2d3]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{item.servicoNome}</span>
                              {item.comandaNumero && (
                                <span className="font-mono text-[10px] text-[#e9c340] bg-[#e9c340]/10 border border-[#e9c340]/30 px-1.5 py-0.2 rounded">
                                  {item.comandaNumero}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-[#d0c6af]">{item.profissionalNome}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#e9c340] whitespace-nowrap">
                            {formatCurrency(item.valor)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#99907b] text-xs">
                          {controller.historicoCliente.length === 0
                            ? 'Nenhum serviço registrado no histórico deste cliente.'
                            : 'Nenhum atendimento encontrado para o filtro selecionado.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-t border-[#38342b] shrink-0">
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
              Fechar
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
