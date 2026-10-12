import React from 'react';

export interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  itensPorPagina: number;
  opcoesItensPorPagina?: number[];
  registroNome?: string;
  textoCustomizado?: string;
  aoMudarPagina: (pagina: number) => void;
  aoMudarItensPorPagina?: (itens: number) => void;
}

export function getPaginationPages(
  paginaAtual: number,
  totalPaginas: number,
  maxVisiveis: number = 7
): (number | 'ellipsis')[] {
  if (totalPaginas <= maxVisiveis) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  // Se estiver próximo do início (ex: páginas 1, 2, 3, 4)
  if (paginaAtual <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPaginas];
  }

  // Se estiver próximo do final (ex: últimas 4 páginas)
  if (paginaAtual >= totalPaginas - 3) {
    return [
      1,
      'ellipsis',
      totalPaginas - 4,
      totalPaginas - 3,
      totalPaginas - 2,
      totalPaginas - 1,
      totalPaginas,
    ];
  }

  // No meio
  return [
    1,
    'ellipsis',
    paginaAtual - 1,
    paginaAtual,
    paginaAtual + 1,
    'ellipsis',
    totalPaginas,
  ];
}

export function Pagination({
  paginaAtual,
  totalPaginas,
  totalRegistros,
  itensPorPagina,
  opcoesItensPorPagina = [10, 20, 50, 100],
  registroNome = 'itens',
  textoCustomizado,
  aoMudarPagina,
  aoMudarItensPorPagina,
}: PaginationProps) {
  const inicioRegistro = totalRegistros === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fimRegistro = Math.min(paginaAtual * itensPorPagina, totalRegistros);
  const paginas = getPaginationPages(paginaAtual, totalPaginas);

  return (
    <div className="px-6 py-4 border-t border-[#38342b] bg-[#110e06]/60 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs text-[#99907b]">
      {/* Informações de Registros e Seletor de Itens por Página */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          {textoCustomizado || (
            <span>
              Exibindo <strong className="text-[#eae2d3] font-normal">{inicioRegistro}-{fimRegistro}</strong> de{' '}
              <strong className="text-[#eae2d3] font-normal">{totalRegistros}</strong> {registroNome}
            </span>
          )}
        </div>

        {aoMudarItensPorPagina && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#99907b]">
            <span>Exibir:</span>
            <select
              value={itensPorPagina}
              onChange={(e) => aoMudarItensPorPagina(Number(e.target.value))}
              className="bg-[#16130b] border border-[#38342b] hover:border-[#e9c340]/60 focus:border-[#e9c340] rounded px-2 py-0.5 text-xs font-mono text-[#eae2d3] outline-none cursor-pointer transition-colors"
            >
              {opcoesItensPorPagina.map((qtd) => (
                <option key={qtd} value={qtd}>
                  {qtd}
                </option>
              ))}
            </select>
            <span>por pág.</span>
          </div>
        )}
      </div>

      {/* Controles de Navegação de Páginas */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Botão Primeira Página « */}
        <button
          type="button"
          disabled={paginaAtual <= 1}
          onClick={() => aoMudarPagina(1)}
          title="Primeira Página"
          className="w-8 h-8 rounded border border-[#38342b] flex items-center justify-center text-[#eae2d3] hover:border-[#e9c340] hover:text-[#e9c340] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          &laquo;
        </button>

        {/* Botão Página Anterior ‹ */}
        <button
          type="button"
          disabled={paginaAtual <= 1}
          onClick={() => aoMudarPagina(paginaAtual - 1)}
          title="Página Anterior"
          className="w-8 h-8 rounded border border-[#38342b] flex items-center justify-center text-[#eae2d3] hover:border-[#e9c340] hover:text-[#e9c340] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          &lsaquo;
        </button>

        {/* Números das Páginas e Reticências */}
        {paginas.map((pg, idx) => {
          if (pg === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-6 h-8 flex items-center justify-center text-[#99907b] select-none text-xs"
              >
                ...
              </span>
            );
          }

          const ehAtiva = pg === paginaAtual;

          return (
            <button
              type="button"
              key={pg}
              onClick={() => aoMudarPagina(pg)}
              className={`min-w-[32px] h-8 px-2 rounded border flex items-center justify-center font-mono text-xs transition-all cursor-pointer ${
                ehAtiva
                  ? 'bg-[#2d2a20] border-[#e9c340] text-[#e9c340] font-bold shadow-xs'
                  : 'border-[#38342b] text-[#99907b] hover:text-[#eae2d3] hover:border-[#e9c340]'
              }`}
            >
              {pg}
            </button>
          );
        })}

        {/* Botão Próxima Página › */}
        <button
          type="button"
          disabled={paginaAtual >= totalPaginas}
          onClick={() => aoMudarPagina(paginaAtual + 1)}
          title="Próxima Página"
          className="w-8 h-8 rounded border border-[#38342b] flex items-center justify-center text-[#eae2d3] hover:border-[#e9c340] hover:text-[#e9c340] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          &rsaquo;
        </button>

        {/* Botão Última Página » */}
        <button
          type="button"
          disabled={paginaAtual >= totalPaginas}
          onClick={() => aoMudarPagina(totalPaginas)}
          title="Última Página"
          className="w-8 h-8 rounded border border-[#38342b] flex items-center justify-center text-[#eae2d3] hover:border-[#e9c340] hover:text-[#e9c340] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
}
