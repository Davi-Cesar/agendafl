import { useState, useCallback, useMemo } from 'react';
import { useAgendaStore } from '@modules/agenda/store/agenda.store';
import { useComandasStore } from '../../store/comandas.store';
import { eventBus } from '@shared/lib/events';
import type { ComandaItem, FormaPagamentoTipo } from '../../schemas/comanda.schema';

export interface CriarComandaViewProps {
  dados: any;
}

export function useCriarComandaViewController(dados: any) {
  const setComandaAtivaAgenda = useAgendaStore((s) => s.setComandaAtivaView);
  const setComandaAtivaComandas = useComandasStore((s) => s.setComandaAtivaView);
  const finalizarComanda = useComandasStore((s) => s.finalizarComanda);
  const vincularComanda = useAgendaStore((s) => s.vincularComanda);
  const atualizarStatusComandaVinc = useAgendaStore((s) => s.atualizarStatusComandaVinc);

  const [itens, setItens] = useState<ComandaItem[]>([
    {
      id: 'item-1',
      descricao: dados?.servico || 'Coloração + Tratamento',
      profissional: dados?.profissionalNome || 'Elena Rossi',
      quantidade: 1,
      valorUnitario: Number(dados?.valor || 120.0),
    },
  ]);

  const [desconto, setDesconto] = useState<number>(0);
  const [cupom, setCupom] = useState<string>('');
  const [cupomAplicado, setCupomAplicado] = useState<boolean>(false);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState<boolean>(false);

  // Controle de Formas de Pagamento (Forma Única vs 2 Formas)
  const [dividirPagamento, setDividirPagamento] = useState<boolean>(false);
  const [formaPagamento1, setFormaPagamento1] = useState<FormaPagamentoTipo>('pix_bricia');
  const [valorForma1, setValorForma1] = useState<number>(0);

  const [formaPagamento2, setFormaPagamento2] = useState<FormaPagamentoTipo>('dinheiro');
  const [valorForma2, setValorForma2] = useState<number>(0);

  const subtotal = useMemo(() => {
    return itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);
  }, [itens]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - desconto);
  }, [subtotal, desconto]);

  const handleVoltar = useCallback(() => {
    setComandaAtivaAgenda(null);
    setComandaAtivaComandas(null);
  }, [setComandaAtivaAgenda, setComandaAtivaComandas]);

  const handleAplicarCupom = useCallback(() => {
    if (cupom.trim()) {
      setCupomAplicado(true);
      if (desconto === 0) setDesconto(10);
    }
  }, [cupom, desconto]);

  const handleRemoverCupom = useCallback(() => {
    setCupom('');
    setCupomAplicado(false);
  }, []);

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

  const handleFinalizar = useCallback(async () => {
    // Monta o payload de pagamentos
    const pagamentos = dividirPagamento
      ? [
          { forma: formaPagamento1, valor: valorForma1 || total / 2 },
          { forma: formaPagamento2, valor: valorForma2 || total / 2 },
        ]
      : [{ forma: formaPagamento1, valor: total }];

    const dadosComandaFinal = {
      ...dados,
      comandaStatus: 'finalizada',
      subtotal,
      desconto,
      valorTotal: total,
      itens,
      pagamentos,
    };

    // Persiste e atualiza o estado global de comandas
    const resFinal = await finalizarComanda(dadosComandaFinal);

    const comandaIdOficial = resFinal?.comandaId || dados?.comandaId;
    const comandaNumeroOficial = resFinal?.comandaNumero || dados?.comandaNumero;

    if (dados?.agendamentoId) {
      vincularComanda(dados.agendamentoId, comandaIdOficial, comandaNumeroOficial);
      atualizarStatusComandaVinc(dados.agendamentoId, 'finalizada');
    }

    const payloadFinal = {
      tipo: 'detalhes' as const,
      dados: {
        ...dadosComandaFinal,
        comandaId: comandaIdOficial,
        comandaNumero: comandaNumeroOficial,
      },
    };

    // Abre a view de detalhes da comanda concluída com os dados finais
    setComandaAtivaAgenda(payloadFinal);
    setComandaAtivaComandas(payloadFinal);
  }, [
    dados,
    dividirPagamento,
    formaPagamento1,
    valorForma1,
    formaPagamento2,
    valorForma2,
    total,
    subtotal,
    desconto,
    itens,
    vincularComanda,
    atualizarStatusComandaVinc,
    finalizarComanda,
    setComandaAtivaAgenda,
    setComandaAtivaComandas,
  ]);

  const descartarComandaEmEdicao = useCallback(() => {
    if (dados?.agendamentoId) {
      atualizarStatusComandaVinc(dados.agendamentoId, 'cancelada');
    }
    setComandaAtivaAgenda(null);
    setComandaAtivaComandas(null);
  }, [dados, atualizarStatusComandaVinc, setComandaAtivaAgenda, setComandaAtivaComandas]);

  return {
    dados,
    itens,
    subtotal,
    desconto,
    setDesconto,
    total,
    cupom,
    setCupom,
    cupomAplicado,
    handleAplicarCupom,
    handleRemoverCupom,
    modalAdicionarAberto,
    setModalAdicionarAberto,
    dividirPagamento,
    setDividirPagamento,
    formaPagamento1,
    setFormaPagamento1,
    valorForma1,
    setValorForma1,
    formaPagamento2,
    setFormaPagamento2,
    valorForma2,
    setValorForma2,
    handleVoltar,
    handleFinalizar,
    descartarComandaEmEdicao,
    handleAdicionarItem,
    handleRemoverItem,
  };
}

export type CriarComandaViewController = ReturnType<typeof useCriarComandaViewController>;
