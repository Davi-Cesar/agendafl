import React from 'react';
import { useComissoesDoDiaController } from './controller';
import { formatCurrency } from '@shared/lib/utils';

export function ComissoesDoDia() {
  const controller = useComissoesDoDiaController();
  const {
    comissoes,
    filtroProfissional,
    setFiltroProfissional,
    listaProfissionais,
    totalComissoesGeral,
    handleVerRelatorio,
  } = controller;

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho de Filtros */}
      <div className="flex items-center justify-between">
        <h2 className="font-sora font-semibold text-sm text-[#eae2d3]">Comissões do Dia</h2>
        <div className="flex items-center gap-2 font-mono text-xs text-[#99907b]">
          <span>Filtrar por:</span>
          <select
            className="bg-[#1f1b13] border border-[#38342b] text-[#e9c340] font-semibold text-xs rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            value={filtroProfissional}
            onChange={(e) => setFiltroProfissional(e.target.value)}
          >
            <option value="todos">Todos os Profissionais</option>
            {listaProfissionais.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Comissões */}
      <div className="bg-[#1f1b13] border border-[#38342b] rounded-lg overflow-hidden shadow-md flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#38342b] font-mono text-[#99907b] bg-[#110e06]/50">
                <th className="py-3 px-4 font-medium">PROFISSIONAL</th>
                <th className="py-3 px-4 font-medium">SERVIÇOS REALIZADOS</th>
                <th className="py-3 px-4 font-medium text-right">TOTAL COMISSÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38342b]/50">
              {comissoes.map((item) => (
                <tr key={item.profissionalId} className="hover:bg-[#2d2a20]/30 transition-colors">
                  <td className="py-4 px-4 font-sora font-semibold text-[#eae2d3] text-sm">
                    {item.profissionalNome}
                  </td>
                  <td className="py-4 px-4 font-mono text-[#d0c6af]">
                    {item.quantidadeServicos} {item.quantidadeServicos === 1 ? 'serviço' : 'serviços'}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-[#eae2d3]">
                    {formatCurrency(item.totalComissao)}
                  </td>
                </tr>
              ))}
              {comissoes.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#99907b] font-mono text-xs">
                    Nenhuma comissão registrada para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
            {comissoes.length > 0 && (
              <tfoot>
                <tr className="border-t border-[#38342b] bg-[#110e06]/80 font-mono font-bold">
                  <td className="py-3 px-4 text-[#eae2d3]" colSpan={2}>
                    TOTAL DE COMISSÕES
                  </td>
                  <td className="py-3 px-4 text-right text-[#e9c340]">
                    {formatCurrency(totalComissoesGeral)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Rodapé da Tabela com Link para Relatório Detalhado (RN-36) */}
        <div className="border-t border-[#38342b] py-3 text-center bg-[#110e06]/60">
          <button
            type="button"
            className="text-xs font-inter text-[#99907b] hover:text-[#e9c340] transition-colors cursor-pointer"
            onClick={handleVerRelatorio}
          >
            Ver relatório detalhado
          </button>
        </div>
      </div>
    </div>
  );
}
