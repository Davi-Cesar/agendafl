import { useCallback } from 'react';
import { useAgendaStore } from '@modules/agenda/store/agenda.store';
import { useComandasStore } from '../../store/comandas.store';
import { useRouterStore } from '@shared/router/router.store';

export interface DetalhesComandaViewProps {
  dados: any;
}

export function useDetalhesComandaViewController(dados: any) {
  const setComandaAtivaAgenda = useAgendaStore((s) => s.setComandaAtivaView);
  const setComandaAtivaComandas = useComandasStore((s) => s.setComandaAtivaView);
  const navigate = useRouterStore((s) => s.navigate);

  const handleVoltarAgenda = useCallback(() => {
    setComandaAtivaAgenda(null);
    setComandaAtivaComandas(null);
  }, [setComandaAtivaAgenda, setComandaAtivaComandas]);

  const handleIrParaComandas = useCallback(() => {
    setComandaAtivaAgenda(null);
    setComandaAtivaComandas(null);
    navigate('/comandas');
  }, [setComandaAtivaAgenda, setComandaAtivaComandas, navigate]);

  const handleImprimirComprovante = useCallback(() => {
    window.print();
  }, []);

  return {
    dados,
    handleVoltarAgenda,
    handleIrParaComandas,
    handleImprimirComprovante,
  };
}

export type DetalhesComandaViewController = ReturnType<typeof useDetalhesComandaViewController>;
