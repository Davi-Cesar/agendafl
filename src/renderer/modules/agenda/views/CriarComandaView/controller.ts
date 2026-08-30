import { useState, useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { eventBus } from '@shared/lib/events';

interface ItemComanda {
  id: string;
  descricao: string;
  profissional: string;
  quantidade: number;
  valorUnitario: number;
}

export function useCriarComandaViewController(dados: any) {
  const setComandaAtivaView = useAgendaStore((s) => s.setComandaAtivaView);
  const vincularComanda = useAgendaStore((s) => s.vincularComanda);
  const atualizarStatusComandaVinc = useAgendaStore((s) => s.atualizarStatusComandaVinc);

  const [itens, setItens] = useState<ItemComanda[]>([
    {
      id: 'item-1',
      descricao: dados?.servico || 'Serviço',
      profissional: dados?.profissionalNome || 'Profissional',
      quantidade: 1,
      valorUnitario: 120.0,
    },
  ]);

  const [desconto, setDesconto] = useState(0);

  const subtotal = itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);
  const total = Math.max(0, subtotal - desconto);

  const handleVoltar = useCallback(() => {
    setComandaAtivaView(null);
  }, [setComandaAtivaView]);

  const handleFinalizar = useCallback(() => {
    if (dados?.agendamentoId) {
      vincularComanda(dados.agendamentoId, dados.comandaId, dados.comandaNumero);
      atualizarStatusComandaVinc(dados.agendamentoId, 'finalizada');
      eventBus.emit('comanda:finalizada', { comandaId: dados.comandaId, agendamentoId: dados.agendamentoId });
    }
    setComandaAtivaView(null);
  }, [dados, vincularComanda, atualizarStatusComandaVinc, setComandaAtivaView]);

  const handleCancelarExcluir = useCallback(() => {
    if (dados?.agendamentoId) {
      atualizarStatusComandaVinc(dados.agendamentoId, 'cancelada');
    }
    setComandaAtivaView(null);
  }, [dados, atualizarStatusComandaVinc, setComandaAtivaView]);

  const handleAdicionarItem = useCallback((descricao: string, profissional: string, valor: number) => {
    setItens((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        descricao,
        profissional,
        quantidade: 1,
        valorUnitario: valor,
      },
    ]);
  }, []);

  const handleRemoverItem = useCallback((id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return {
    dados,
    itens,
    subtotal,
    desconto,
    setDesconto,
    total,
    handleVoltar,
    handleFinalizar,
    handleCancelarExcluir,
    handleAdicionarItem,
    handleRemoverItem,
  };
}

export type CriarComandaViewController = ReturnType<typeof useCriarComandaViewController>;
