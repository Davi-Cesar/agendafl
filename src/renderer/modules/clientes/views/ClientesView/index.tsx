import React from 'react';
import { useClientesViewController } from './controller';
import { ModalNovoCliente } from '../../components/ModalNovoCliente';
import { ModalPerfilCliente } from '../../components/ModalPerfilCliente';
import { ModalExcluirCliente } from '../../components/ModalExcluirCliente';
import { formatarCelular, formatarDataBR } from '@shared/lib/formatters';
import { Pagination } from '@shared/ui/Pagination';

export function ClientesView() {
  const controller = useClientesViewController();

  const isTodos = controller.abaAtiva === 'todos';
  const listaExibida = isTodos ? controller.clientes : controller.aniversariantes;
  const totalRegistros = isTodos ? controller.totalClientes : controller.totalAniversariantesCount;

  // Calculos de Paginação
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / controller.itensPorPagina));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#110e06] text-[#eae2d3] font-inter overflow-hidden">
      {/* Top Search & Primary Action Bar */}
      <header className="px-6 py-4 bg-[#110e06] border-b border-[#38342b] flex items-center justify-between gap-4">
        {/* Input de Busca */}
        <div className="relative flex-1 max-w-2xl">
          <input
            type="text"
            placeholder="Pesquisar por nome, CPF ou telefone..."
            value={controller.busca}
            onChange={(e) => controller.setBusca(e.target.value)}
            className="w-full bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#eae2d3] placeholder-[#99907b] transition-all"
          />
          <svg
            className="w-4 h-4 text-[#99907b] absolute left-3.5 top-1/2 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Botão Novo Cliente */}
        <button
          type="button"
          onClick={() => controller.abrirModalNovo()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-semibold text-xs rounded-lg shadow-md transition-all cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Cliente
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto bg-[#110e06] flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">
          {/* Container Card Principal */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-xl overflow-hidden">
            {/* Header da Card: Abas + Controles da Direita */}
            <div className="p-4 sm:p-5 border-b border-[#38342b] flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Abas Alternáveis */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => controller.setAbaAtiva('todos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sora font-semibold transition-all cursor-pointer border ${
                    isTodos
                      ? 'bg-[#2d2a20] border-[#e9c340] text-[#e9c340]'
                      : 'bg-[#110e06] border-[#38342b] text-[#99907b] hover:text-[#eae2d3]'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Todos os Clientes</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#110e06] text-[#99907b] border border-[#38342b]">
                    {controller.totalClientes}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => controller.setAbaAtiva('aniversariantes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sora font-semibold transition-all cursor-pointer border ${
                    !isTodos
                      ? 'bg-[#2d2a20] border-[#e9c340] text-[#e9c340]'
                      : 'bg-[#110e06] border-[#38342b] text-[#99907b] hover:text-[#eae2d3]'
                  }`}
                >
                  <svg className="w-4 h-4 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
                    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
                    <path d="M2 21h20" />
                    <path d="M7 8v2" />
                    <path d="M12 8v2" />
                    <path d="M17 8v2" />
                  </svg>
                  <span>Aniversariantes do Dia</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#e9c340]/20 text-[#e9c340] border border-[#e9c340]/40 font-bold">
                    {controller.totalAniversariantesCount}
                  </span>
                </button>
              </div>

              {/* Controles da Direita */}
              <div className="flex items-center gap-2">
                {!isTodos && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={controller.dataLocalAniv}
                      onChange={(e) => controller.setDataLocalAniv(e.target.value)}
                      className="bg-[#110e06] border border-[#38342b] rounded-lg px-3 py-1.5 text-xs font-mono text-[#eae2d3] outline-none focus:border-[#e9c340]"
                    />
                    <button
                      type="button"
                      onClick={controller.handleFiltrarDataAniversariantes}
                      className="flex items-center gap-1.5 font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] text-[#eae2d3] transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-[#e9c340]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Filtrar
                    </button>
                  </div>
                )}

                {isTodos && (
                  <button
                    type="button"
                    onClick={() => controller.setFiltroStatusAberto(!controller.filtroStatusAberto)}
                    className="flex items-center gap-1.5 font-mono text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] text-[#99907b] hover:text-[#eae2d3] transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    Filtros
                  </button>
                )}

                <button
                  type="button"
                  onClick={controller.handleExportarCSV}
                  title="Exportar clientes em CSV"
                  className="p-2 rounded-lg bg-[#110e06] border border-[#38342b] hover:border-[#e9c340] text-[#99907b] hover:text-[#eae2d3] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabela de Clientes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#38342b] bg-[#110e06]/60 text-[10px] font-mono text-[#99907b] uppercase tracking-wider">
                    <th className="py-3 px-6">NOME DO CLIENTE</th>
                    <th className="py-3 px-6">TELEFONE</th>
                    {isTodos && <th className="py-3 px-6">DATA DE NASCIMENTO</th>}
                    <th className="py-3 px-6">STATUS</th>
                    <th className="py-3 px-6 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#38342b]/40 text-xs">
                  {listaExibida.map((cliente) => {
                    const initials = controller.getInitials(cliente.nome);
                    const isAtivo = cliente.status === 'ativo';

                    return (
                      <tr key={cliente.id} className="hover:bg-[#2d2a20]/40 transition-colors group">
                        {/* Nome do Cliente com Avatar */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#2d2a20] border border-[#e9c340]/40 flex items-center justify-center font-mono font-bold text-xs text-[#e9c340] shrink-0 shadow-sm">
                              {initials}
                            </div>
                            <span className="font-sora font-semibold text-[#eae2d3] group-hover:text-[#e9c340] transition-colors">
                              {cliente.nome}
                            </span>
                          </div>
                        </td>

                        {/* Telefone */}
                        <td className="py-3.5 px-6 font-mono text-[#d0c6af]">{formatarCelular(cliente.telefone)}</td>

                        {/* Data de Nascimento (apenas na aba Todos) */}
                        {isTodos && (
                          <td className="py-3.5 px-6 font-mono text-[#99907b]">
                            {formatarDataBR(cliente.dataNascimento)}
                          </td>
                        )}

                        {/* Status */}
                        <td className="py-3.5 px-6">
                          <span
                            className={`font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                              isAtivo
                                ? 'bg-[#e9c340]/15 text-[#e9c340] border-[#e9c340]/30'
                                : 'bg-[#99907b]/15 text-[#99907b] border-[#38342b]'
                            }`}
                          >
                            {isAtivo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            {!isTodos && (
                              <button
                                type="button"
                                onClick={() => controller.handleAbrirWhatsApp(cliente.telefone, cliente.nome)}
                                className="flex items-center gap-1.5 font-sora text-xs font-semibold px-3 py-1.5 rounded-md border border-[#e9c340]/60 text-[#e9c340] hover:bg-[#e9c340]/15 transition-all cursor-pointer shadow-xs"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                WhatsApp
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => controller.abrirPerfilCliente(cliente)}
                              className="font-sora text-xs font-medium text-[#e9c340] hover:underline cursor-pointer"
                            >
                              Ver Perfil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {listaExibida.length === 0 && (
                    <tr>
                      <td colSpan={isTodos ? 5 : 4} className="py-10 text-center text-xs text-[#99907b]">
                        {controller.carregando
                          ? 'Carregando clientes...'
                          : isTodos
                          ? 'Nenhum cliente encontrado.'
                          : `Nenhum aniversariante encontrado para ${formatarDataBR(controller.dataAniversariantes)}.`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Rodapé de Paginação Inteligente */}
            <Pagination
              paginaAtual={controller.paginaAtual}
              totalPaginas={totalPaginas}
              totalRegistros={totalRegistros}
              itensPorPagina={controller.itensPorPagina}
              opcoesItensPorPagina={[10, 15, 25, 50, 100]}
              registroNome="clientes"
              textoCustomizado={
                !isTodos
                  ? `Exibindo ${listaExibida.length} de ${listaExibida.length} aniversariantes para ${formatarDataBR(controller.dataAniversariantes)}`
                  : undefined
              }
              aoMudarPagina={controller.setPaginaAtual}
              aoMudarItensPorPagina={isTodos ? controller.setItensPorPagina : undefined}
            />
          </div>
        </div>
      </main>

      {/* Modais do Módulo Clientes */}
      <ModalNovoCliente />
      <ModalPerfilCliente />
      <ModalExcluirCliente />
    </div>
  );
}
