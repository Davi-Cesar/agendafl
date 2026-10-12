import React from 'react';
import { useServicosViewController } from './controller';
import { ModalNovoServico } from '../../components/ModalNovoServico';
import { ModalExcluirServico } from '../../components/ModalExcluirServico';
import { Pagination } from '@shared/ui/Pagination';

export function ServicosView() {
  const controller = useServicosViewController();

  const totalPaginas = Math.max(1, Math.ceil(controller.totalServicos / controller.itensPorPagina));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#110e06] text-[#eae2d3] font-inter overflow-hidden">
      {/* Header da Página */}
      <header className="px-6 py-5 bg-[#110e06] border-b border-[#38342b] flex items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-bold text-2xl text-[#e9c340]">Catálogo de Serviços</h1>
          <p className="font-inter text-xs text-[#99907b] mt-1">
            Gerenciamento de serviços, preços, duração estimada e profissionais habilitados
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto bg-[#110e06] flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">
          {/* Barra de Filtros e Ação (Busca + Dropdown Categoria + Botão Novo Serviço) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              {/* Input de Busca */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar serviços..."
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

              {/* Select de Categoria */}
              <select
                value={controller.categoriaIdFiltro || ''}
                onChange={(e) => controller.setCategoriaIdFiltro(e.target.value || null)}
                className="bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-lg px-4 py-2.5 text-xs font-mono text-[#eae2d3] cursor-pointer"
              >
                <option value="">Categoria (Todas)</option>
                {controller.categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Novo Serviço */}
            <button
              type="button"
              onClick={() => controller.abrirModalNovo()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-semibold text-xs rounded-lg shadow-md transition-all cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Novo Serviço</span>
            </button>
          </div>

          {/* Container Card Principal da Tabela */}
          <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-xl overflow-hidden">
            {controller.servicos.length === 0 && !controller.carregando ? (
              /* Empty State (Fiel ao services_deafult.png) */
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#2d2a20] border border-[#38342b] flex items-center justify-center text-[#e9c340] mb-4 shadow-inner">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="14" x2="14" y2="8" />
                  </svg>
                </div>
                <h3 className="font-sora font-bold text-lg text-[#eae2d3] mb-2">Nenhum serviço encontrado</h3>
                <p className="font-inter text-xs text-[#99907b] max-w-md leading-relaxed mb-6">
                  Não encontramos resultados para sua busca. Verifique a ortografia ou tente buscar por outra categoria.
                </p>
                <button
                  type="button"
                  onClick={controller.handleLimparFiltros}
                  className="px-5 py-2.5 rounded-lg border border-[#e9c340] text-[#e9c340] hover:bg-[#e9c340]/10 font-sora font-semibold text-xs transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              /* Tabela de Serviços (Fiel ao services_list.png) */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#38342b] bg-[#110e06]/60 text-[10px] font-mono text-[#99907b] uppercase tracking-wider">
                      <th className="py-3 px-6">NOME DO SERVIÇO</th>
                      <th className="py-3 px-6">CATEGORIA</th>
                      <th className="py-3 px-6">DURAÇÃO</th>
                      <th className="py-3 px-6">PREÇO</th>
                      <th className="py-3 px-6 text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#38342b]/40 text-xs">
                    {controller.servicos.map((servico) => {
                      const categoriaPill = servico.categoriaNome ? servico.categoriaNome.toUpperCase() : 'GERAL';

                      return (
                        <tr key={servico.id} className="hover:bg-[#2d2a20]/40 transition-colors group">
                          {/* Nome do Serviço + Descrição */}
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-sora font-semibold text-[#eae2d3] group-hover:text-[#e9c340] transition-colors">
                                {servico.nome}
                              </div>
                              {servico.descricao && (
                                <div className="text-[11px] text-[#99907b] font-inter mt-0.5">
                                  {servico.descricao}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Categoria Badge/Pill */}
                          <td className="py-4 px-6">
                            <span className="font-mono text-[9px] px-2.5 py-1 rounded-full font-bold uppercase border bg-[#2d2a20] text-[#e9c340] border-[#38342b]">
                              {categoriaPill}
                            </span>
                          </td>

                          {/* Duração em minutos */}
                          <td className="py-4 px-6 font-inter text-xs text-[#eae2d3]">
                            {servico.duracaoMinutos} min
                          </td>

                          {/* Preço em Destaque Dourado */}
                          <td className="py-4 px-6 font-sora font-bold text-[#e9c340]">
                            {controller.formatarPrecoBR(servico.precoPadrao)}
                          </td>

                          {/* Ações: Editar e Excluir */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Botão Editar (Ícone de Lápis) */}
                              <button
                                type="button"
                                onClick={() => controller.abrirModalNovo(servico)}
                                title="Editar Serviço"
                                className="p-1.5 rounded-md hover:bg-[#2d2a20] text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              {/* Botão Excluir (Ícone de Lixeira) */}
                              <button
                                type="button"
                                onClick={() => controller.abrirModalExcluir(servico)}
                                title="Excluir Serviço"
                                className="p-1.5 rounded-md hover:bg-[#93000a]/20 text-[#99907b] hover:text-[#ffb4ab] transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rodapé de Paginação Inteligente */}
            <Pagination
              paginaAtual={controller.paginaAtual}
              totalPaginas={totalPaginas}
              totalRegistros={controller.totalServicos}
              itensPorPagina={controller.itensPorPagina}
              opcoesItensPorPagina={[10, 15, 25, 50, 100]}
              registroNome="serviços"
              aoMudarPagina={controller.setPaginaAtual}
              aoMudarItensPorPagina={controller.setItensPorPagina}
            />
          </div>
        </div>
      </main>

      {/* Modais do Módulo de Serviços */}
      <ModalNovoServico />
      <ModalExcluirServico />
    </div>
  );
}
