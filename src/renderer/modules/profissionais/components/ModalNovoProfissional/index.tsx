import React from 'react';
import { useModalNovoProfissionalController } from './controller';

export function ModalNovoProfissional() {
  const controller = useModalNovoProfissionalController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110e06] border-b border-[#38342b] shrink-0">
          <h2 className="font-sora font-bold text-lg text-[#eae2d3]">
            {controller.isEdicao ? 'Editar Profissional' : 'Novo Profissional'}
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

        {/* Form */}
        <form onSubmit={controller.handleSalvar} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
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

            {/* Seção de Categorias & Serviços Vinculados */}
            <div className="pt-3 border-t border-[#38342b] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#e9c340] uppercase tracking-wider">
                    CATEGORIAS DE SERVIÇOS
                  </label>
                  <p className="text-[11px] text-[#99907b]">
                    Selecione para vincular automaticamente todos os serviços da categoria.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={controller.selecionarTodos}
                    className="text-[11px] font-mono text-[#e9c340] hover:underline cursor-pointer"
                  >
                    Marcar todos
                  </button>
                  <span className="text-[#38342b]">•</span>
                  <button
                    type="button"
                    onClick={controller.limparSelecao}
                    className="text-[11px] font-mono text-[#99907b] hover:text-[#eae2d3] cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Grid de Categorias */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {controller.categoriasComServicos.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => controller.toggleCategoria(cat.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                      cat.isTodas
                        ? 'bg-[#e9c340]/15 border-[#e9c340] text-[#eae2d3] shadow-xs'
                        : cat.isParcial
                        ? 'bg-[#e9c340]/5 border-[#e9c340]/50 text-[#eae2d3]'
                        : 'bg-[#110e06] border-[#38342b] text-[#99907b] hover:border-[#99907b]/60 hover:text-[#eae2d3]'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <span className="block text-xs font-medium truncate">{cat.nome}</span>
                      <span className="text-[10px] font-mono text-[#99907b]">
                        {cat.totalSelecionados}/{cat.totalServicos} serviços
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] font-bold border transition-colors ${
                        cat.isTodas
                          ? 'bg-[#e9c340] text-[#110e06] border-[#e9c340]'
                          : cat.isParcial
                          ? 'bg-[#e9c340]/20 text-[#e9c340] border-[#e9c340]'
                          : 'border-[#38342b] text-transparent'
                      }`}
                    >
                      {cat.isTodas ? '✓' : cat.isParcial ? '−' : ''}
                    </div>
                  </button>
                ))}
              </div>

              {controller.categoriasComServicos.length === 0 && (
                <p className="text-xs text-[#99907b] italic py-2">Nenhuma categoria de serviço cadastrada.</p>
              )}

              {/* Barra de Status e Alternância de Detalhes Individuais */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-[#99907b]">
                  Vinculados: <span className="text-[#e9c340] font-mono font-bold">{controller.totalServicosSelecionados}</span> de {controller.totalTodosServicos} serviços
                </div>
                <button
                  type="button"
                  onClick={() => controller.setMostrarDetalhesServicos(!controller.mostrarDetalhesServicos)}
                  className="text-xs text-[#e9c340] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {controller.mostrarDetalhesServicos ? 'Ocultar detalhes' : 'Ajustar serviços individuais'}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${controller.mostrarDetalhesServicos ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Lista Detalhada de Serviços Expandida */}
              {controller.mostrarDetalhesServicos && (
                <div className="max-h-48 overflow-y-auto space-y-3 p-3 bg-[#110e06] border border-[#38342b] rounded-lg">
                  {controller.categoriasComServicos.map((cat) => (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="text-[11px] font-mono text-[#e9c340] font-semibold border-b border-[#38342b]/40 pb-1">
                        {cat.nome} ({cat.servicos.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                        {cat.servicos.map((s) => {
                          const isChecked = !!controller.selecionadosMap[s.id];
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                                isChecked ? 'bg-[#2d2a20]/60 text-[#eae2d3]' : 'text-[#99907b] hover:text-[#eae2d3]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => controller.toggleServico(s.id)}
                                className="w-3.5 h-3.5 accent-[#e9c340] rounded border-[#38342b] bg-[#110e06] cursor-pointer"
                              />
                              <span className="truncate">{s.nome}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {controller.servicosSemCategoria.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-[#99907b] font-semibold border-b border-[#38342b]/40 pb-1">
                        Outros / Sem Categoria ({controller.servicosSemCategoria.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                        {controller.servicosSemCategoria.map((s) => {
                          const isChecked = !!controller.selecionadosMap[s.id];
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                                isChecked ? 'bg-[#2d2a20]/60 text-[#eae2d3]' : 'text-[#99907b] hover:text-[#eae2d3]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => controller.toggleServico(s.id)}
                                className="w-3.5 h-3.5 accent-[#e9c340] rounded border-[#38342b] bg-[#110e06] cursor-pointer"
                              />
                              <span className="truncate">{s.nome}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rodapé do Modal */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#110e06] border-t border-[#38342b] shrink-0">
            <button
              type="button"
              onClick={controller.handleFechar}
              className="px-4 py-2 rounded-md text-xs font-medium text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] transition-colors cursor-pointer"
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
