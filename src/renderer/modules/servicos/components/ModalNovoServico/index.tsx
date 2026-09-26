import React from 'react';
import { useModalNovoServicoController } from './controller';

export function ModalNovoServico() {
  const controller = useModalNovoServicoController();

  if (!controller.modalAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6 font-inter text-[#eae2d3]">
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-[#110e06] border-b border-[#38342b]">
          <h2 className="font-sora font-bold text-xl text-[#eae2d3]">
            {controller.isEdicao ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <button
            type="button"
            onClick={controller.fecharModais}
            className="text-[#99907b] hover:text-[#eae2d3] p-1.5 transition-colors rounded-md cursor-pointer hover:bg-[#2d2a20]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={controller.handleSalvar} className="p-8 space-y-5">
          {controller.erro && (
            <div className="p-3.5 rounded-md bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-mono">
              {controller.erro}
            </div>
          )}

          {/* Nome e Categoria em Grid */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-mono text-[#99907b] uppercase tracking-wider mb-2">
                NOME DO SERVIÇO *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Corte e Escova"
                value={controller.nome}
                onChange={(e) => controller.setNome(e.target.value)}
                className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-4 py-2.5 text-xs font-mono text-[#eae2d3] placeholder-[#99907b] transition-all"
              />
            </div>

            {/* Combobox de Categoria */}
            <div className="relative">
              <label className="block text-[11px] font-mono text-[#99907b] uppercase tracking-wider mb-2">
                CATEGORIA
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Pesquisar ou criar..."
                  value={controller.buscaCategoria}
                  onChange={(e) => {
                    controller.setBuscaCategoria(e.target.value);
                    controller.setDropdownCatAberto(true);
                  }}
                  onFocus={() => controller.setDropdownCatAberto(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') controller.setDropdownCatAberto(false);
                  }}
                  className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md px-4 py-2.5 text-xs font-mono text-[#eae2d3] placeholder-[#99907b] transition-all"
                />
                <button
                  type="button"
                  onClick={() => controller.setDropdownCatAberto(!controller.dropdownCatAberto)}
                  className="absolute right-3 text-[#99907b] hover:text-[#eae2d3] transition-colors p-1 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Lista Flutuante do Combobox */}
              {controller.dropdownCatAberto && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#110e06] border border-[#38342b] rounded-md shadow-2xl max-h-52 overflow-y-auto font-mono text-xs">
                  {/* Opção Neutra: Sem categoria */}
                  <button
                    type="button"
                    onClick={() => controller.handleSelecionarCategoria(null, '')}
                    className={`w-full text-left px-4 py-2.5 hover:bg-[#2d2a20] transition-colors cursor-pointer flex items-center justify-between border-b border-[#38342b]/40 ${
                      !controller.categoriaId ? 'text-[#e9c340] font-bold bg-[#2d2a20]/40' : 'text-[#99907b]'
                    }`}
                  >
                    <span>Sem categoria</span>
                    {!controller.categoriaId && <span>✓</span>}
                  </button>

                  {/* Lista de Categorias Filtradas */}
                  {controller.categoriasFiltradas.map((cat) => {
                    const isSelected = controller.categoriaId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => controller.handleSelecionarCategoria(cat.id, cat.nome)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-[#2d2a20] hover:text-[#e9c340] transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected ? 'text-[#e9c340] font-bold bg-[#2d2a20]/40' : 'text-[#eae2d3]'
                        }`}
                      >
                        <span>{cat.nome}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}

                  {/* Opção Inline de Criar Nova Categoria */}
                  {controller.exibirOpcaoCriar && (
                    <button
                      type="button"
                      disabled={controller.criandoCategoria}
                      onClick={() => controller.handleCriarCategoriaInline(controller.buscaCategoria)}
                      className="w-full text-left px-4 py-2.5 bg-[#2d2a20] hover:bg-[#38342b] text-[#e9c340] font-bold transition-colors cursor-pointer border-t border-[#38342b] flex items-center gap-1.5"
                    >
                      <span>+ Criar categoria "{controller.buscaCategoria.trim()}"</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preço e Duração em Grid */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-mono text-[#99907b] uppercase tracking-wider mb-2">
                PREÇO (R$) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-mono text-[#99907b]">R$</span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={controller.preco}
                  onChange={(e) => controller.setPreco(e.target.value)}
                  className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md pl-10 pr-4 py-2.5 text-xs font-mono text-[#eae2d3] placeholder-[#99907b] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#99907b] uppercase tracking-wider mb-2">
                DURAÇÃO (MIN) *
              </label>
              <div className="relative flex items-center">
                <svg
                  className="w-4 h-4 text-[#99907b] absolute left-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <input
                  type="number"
                  required
                  min={5}
                  max={480}
                  step={5}
                  value={controller.duracao}
                  onChange={(e) => controller.setDuracao(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md pl-10 pr-4 py-2.5 text-xs font-mono text-[#eae2d3] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Profissionais Vinculados */}
          <div className="pt-3 border-t border-[#38342b]/40">
            <label className="block text-[11px] font-mono text-[#99907b] uppercase tracking-wider mb-2">
              PROFISSIONAIS VINCULADOS
            </label>

            {/* Input de Busca de Profissional */}
            <div className="relative mb-2.5">
              <div className="relative flex items-center">
                <svg
                  className="w-4 h-4 text-[#99907b] absolute left-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar para adicionar profissional..."
                  value={controller.buscaProfissional}
                  onChange={(e) => {
                    controller.setBuscaProfissional(e.target.value);
                    controller.setDropdownProfAberto(true);
                  }}
                  onFocus={() => controller.setDropdownProfAberto(true)}
                  className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md pl-10 pr-4 py-2.5 text-xs font-inter text-[#eae2d3] placeholder-[#99907b] transition-all"
                />
              </div>

              {/* Lista Dropdown de Opções de Profissionais */}
              {controller.dropdownProfAberto && controller.profsFiltradosParaAdicionar.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-[#110e06] border border-[#38342b] rounded-md shadow-xl max-h-40 overflow-y-auto font-inter">
                  {controller.profsFiltradosParaAdicionar.map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => controller.handleAdicionarProfissional(prof)}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#eae2d3] hover:bg-[#2d2a20] hover:text-[#e9c340] transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{prof.nome}</span>
                      <span className="text-[10px] font-mono text-[#e9c340]">+ Adicionar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chips / Tags de Profissionais Vinculados */}
            <div className="flex flex-wrap gap-2.5 p-4 bg-[#110e06] border border-[#38342b] rounded-md min-h-[60px]">
              {controller.profissionaisSelecionados.length === 0 ? (
                <span className="text-xs text-[#99907b] italic self-center">
                  Nenhum profissional selecionado (disponível para todos).
                </span>
              ) : (
                controller.profissionaisSelecionados.map((prof) => (
                  <span
                    key={prof.id}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2d2a20] border border-[#38342b] text-xs font-inter text-[#eae2d3] shadow-xs"
                  >
                    <span>{prof.nome}</span>
                    <button
                      type="button"
                      onClick={() => controller.handleRemoverProfissional(prof.id)}
                      className="text-[#99907b] hover:text-[#ffb4ab] transition-colors cursor-pointer p-0.5"
                      title="Remover profissional"
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3.5 pt-5 border-t border-[#38342b]">
            <button
              type="button"
              onClick={controller.fecharModais}
              className="px-5 py-2.5 rounded-md font-semibold text-xs border border-[#38342b] text-[#eae2d3] hover:bg-[#2d2a20] transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={controller.salvando}
              className="px-6 py-2.5 rounded-md font-sora font-semibold text-xs bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span>✓</span>
              <span>{controller.salvando ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
