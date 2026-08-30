import { useEffect, useMemo, useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { formatDate } from '@shared/lib/utils';

export function useAgendaViewController() {
  const dataSelecionada = useAgendaStore((s) => s.dataSelecionada);
  const filtroProfissional = useAgendaStore((s) => s.filtroProfissional);
  const setFiltroProfissional = useAgendaStore((s) => s.setFiltroProfissional);
  const abrirModalNovo = useAgendaStore((s) => s.abrirModalNovo);
  const comandaAtivaView = useAgendaStore((s) => s.comandaAtivaView);
  const carregarAgenda = useAgendaStore((s) => s.carregarAgenda);
  const carregando = useAgendaStore((s) => s.carregando);

  useEffect(() => {
    carregarAgenda();
  }, [carregarAgenda, dataSelecionada]);

  const dataFormatada = useMemo(() => {
    const raw = formatDate(dataSelecionada);
    if (!raw) return '';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [dataSelecionada]);

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFiltroProfissional(e.target.value);
    },
    [setFiltroProfissional]
  );

  return {
    dataFormatada,
    filtroProfissional,
    handleSearchInput,
    abrirModalNovo,
    comandaAtivaView,
    carregando,
  };
}

export type AgendaViewController = ReturnType<typeof useAgendaViewController>;
