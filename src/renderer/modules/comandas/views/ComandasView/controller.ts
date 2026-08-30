import { useEffect, useMemo, useCallback } from 'react';
import { useComandasStore } from '../../store/comandas.store';
import { useRouterStore } from '@shared/router/router.store';
import type { ComandaListItem } from '../../schemas/comanda.schema';

export function useComandasViewController() {
  const comandas = useComandasStore((s) => s.comandas);
  const filtroStatus = useComandasStore((s) => s.filtroStatus);
  const busca = useComandasStore((s) => s.busca);
  const setFiltroStatus = useComandasStore((s) => s.setFiltroStatus);
  const setBusca = useComandasStore((s) => s.setBusca);
  const carregarComandas = useComandasStore((s) => s.carregarComandas);
  const navigate = useRouterStore((s) => s.navigate);

  useEffect(() => {
    carregarComandas();
  }, [carregarComandas]);

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

  const metricas = useMemo(() => {
    const totalRascunhos = comandas.filter((c) => c.comandaStatus === 'rascunho').length;
    const totalFinalizadas = comandas.filter((c) => c.comandaStatus === 'finalizada').length;
    const faturamentoTotal = comandas
      .filter((c) => c.comandaStatus === 'finalizada')
      .reduce((acc, c) => acc + c.valor, 0);

    return { totalRascunhos, totalFinalizadas, faturamentoTotal };
  }, [comandas]);

  const handleItemClick = useCallback(
    (item: ComandaListItem) => {
      navigate('/agenda');
    },
    [navigate]
  );

  return {
    comandas: comandasFiltradas,
    filtroStatus,
    setFiltroStatus,
    busca,
    setBusca,
    metricas,
    handleItemClick,
  };
}

export type ComandasViewController = ReturnType<typeof useComandasViewController>;
