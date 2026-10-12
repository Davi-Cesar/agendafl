import { useEffect, useMemo, useCallback, useState } from 'react';
import { useComandasStore } from '../../store/comandas.store';
import type { ComandaListItem } from '../../schemas/comanda.schema';

export function useComandasViewController() {
  const comandas = useComandasStore((s) => s.comandas);
  const filtroStatus = useComandasStore((s) => s.filtroStatus);
  const busca = useComandasStore((s) => s.busca);
  const setFiltroStatus = useComandasStore((s) => s.setFiltroStatus);
  const setBusca = useComandasStore((s) => s.setBusca);
  const carregarComandas = useComandasStore((s) => s.carregarComandas);
  const carregando = useComandasStore((s) => s.carregando);
  const comandaAtivaView = useComandasStore((s) => s.comandaAtivaView);
  const setComandaAtivaView = useComandasStore((s) => s.setComandaAtivaView);

  // Estado de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPaginaState] = useState(10);

  useEffect(() => {
    carregarComandas();
  }, [carregarComandas]);

  // Resetar para página 1 ao alterar filtro de status ou busca
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, busca]);

  const comandasFiltradas = useMemo(() => {
    return comandas.filter((c) => {
      if (filtroStatus !== 'todas' && c.comandaStatus !== filtroStatus) return false;
      if (busca.trim()) {
        const b = busca.toLowerCase();
        return (
          c.clienteNome.toLowerCase().includes(b) ||
          c.comandaNumero.toLowerCase().includes(b) ||
          c.profissionalNome.toLowerCase().includes(b)
        );
      }
      return true;
    });
  }, [comandas, filtroStatus, busca]);

  const totalItens = comandasFiltradas.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;

  // Ajustar página atual caso ultrapasse o total de páginas
  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const comandasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return comandasFiltradas.slice(inicio, inicio + itensPorPagina);
  }, [comandasFiltradas, paginaAtual, itensPorPagina]);

  const comandasFinalizadas = useMemo(() => {
    return comandas.filter((c) => c.comandaStatus === 'finalizada');
  }, [comandas]);

  const metricas = useMemo(() => {
    const totalRascunhos = comandas.filter((c) => c.comandaStatus === 'rascunho').length;
    const totalFinalizadas = comandasFinalizadas.length;
    const faturamentoTotal = comandasFinalizadas.reduce((acc, c) => acc + c.valor, 0);

    return { totalRascunhos, totalFinalizadas, faturamentoTotal };
  }, [comandas, comandasFinalizadas]);

  const handleItemClick = useCallback(
    (item: ComandaListItem) => {
      if (item.comandaStatus === 'finalizada') {
        const itemComItens = {
          ...item,
          valorTotal: item.valor,
          subtotal: item.valor,
          desconto: 0,
          itens: [
            {
              id: `item-${item.comandaId}`,
              descricao: item.servico,
              profissional: item.profissionalNome,
              quantidade: 1,
              valorUnitario: item.valor,
              desconto: null,
            },
          ],
        };
        setComandaAtivaView({ tipo: 'detalhes', dados: itemComItens });
      } else {
        setComandaAtivaView({ tipo: 'criar', dados: item });
      }
    },
    [setComandaAtivaView]
  );

  const setItensPorPagina = useCallback((quantidade: number) => {
    setItensPorPaginaState(quantidade);
    setPaginaAtual(1);
  }, []);

  const proximaPagina = useCallback(() => {
    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas));
  }, [totalPaginas]);

  const paginaAnterior = useCallback(() => {
    setPaginaAtual((prev) => Math.max(prev - 1, 1));
  }, []);

  const inicioItem = totalItens === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fimItem = Math.min(paginaAtual * itensPorPagina, totalItens);

  return {
    comandas: comandasPaginadas,
    totalComandas: comandas.length,
    totalComandasFiltradas: totalItens,
    comandasFinalizadas,
    filtroStatus,
    setFiltroStatus,
    busca,
    setBusca,
    metricas,
    carregando,
    comandaAtivaView,
    setComandaAtivaView,
    handleItemClick,

    // Props de Paginação
    paginaAtual,
    totalPaginas,
    itensPorPagina,
    inicioItem,
    fimItem,
    totalItens,
    setPaginaAtual,
    setItensPorPagina,
    proximaPagina,
    paginaAnterior,
  };
}

export type ComandasViewController = ReturnType<typeof useComandasViewController>;
