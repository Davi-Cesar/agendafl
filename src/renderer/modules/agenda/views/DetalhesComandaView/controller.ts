import { useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';

export function useDetalhesComandaViewController(dados: any) {
  const setComandaAtivaView = useAgendaStore((s) => s.setComandaAtivaView);

  const handleVoltar = useCallback(() => {
    setComandaAtivaView(null);
  }, [setComandaAtivaView]);

  return {
    dados,
    handleVoltar,
  };
}

export type DetalhesComandaViewController = ReturnType<typeof useDetalhesComandaViewController>;
