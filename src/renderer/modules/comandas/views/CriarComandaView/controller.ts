import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAgendaStore } from '@modules/agenda/store/agenda.store';
import { useComandasStore } from '../../store/comandas.store';
import { buscarClientePorIdNoSupabase } from '@modules/clientes/services/clientes.service';
import type { Cliente } from '@modules/clientes/schemas/cliente.schema';
import type { ComandaItem, FormaPagamentoTipo, DescontoTipo } from '../../schemas/comanda.schema';
import {
  verificarElegibilidadeAniversario,
  calcularTotaisComanda,
  calcularDescontoItem,
  isAniversarianteDoDia,
} from '../../utils/cupom.utils';

export interface CriarComandaViewProps {
  dados: any;
}

export function useCriarComandaViewController(dados: any) {
  const setComandaAtivaAgenda = useAgendaStore((s) => s.setComandaAtivaView);
  const setComandaAtivaComandas = useComandasStore((s) => s.setComandaAtivaView);
  const finalizarComanda = useComandasStore((s) => s.finalizarComanda);
  const vincularComanda = useAgendaStore((s) => s.vincularComanda);
  const atualizarStatusComandaVinc = useAgendaStore((s) => s.atualizarStatusComandaVinc);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [itens, setItens] = useState<ComandaItem[]>([
    {
      id: 'item-1',
      servicoId: dados?.servicoId,
      profissionalId: dados?.profissionalId,
      descricao: dados?.servico || 'Coloração + Tratamento',
      profissional: dados?.profissionalNome || 'Elena Rossi',
      quantidade: 1,
      valorUnitario: Number(dados?.valor || 120.0),
      desconto: null,
    },
  ]);

  const [modalAdicionarAberto, setModalAdicionarAberto] = useState<boolean>(false);
  const [modalDescontoAberto, setModalDescontoAberto] = useState<boolean>(false);
  const [itemSelecionadoDesconto, setItemSelecionadoDesconto] = useState<ComandaItem | null>(null);

  const [salvandoFinalizacao, setSalvandoFinalizacao] = useState<boolean>(false);
  const [erroFinalizacao, setErroFinalizacao] = useState<string | null>(null);

  // Controle de Formas de Pagamento (Forma Única vs 2 Formas)
  const [dividirPagamento, setDividirPagamentoState] = useState<boolean>(false);
  const [formaPagamento1, setFormaPagamento1] = useState<FormaPagamentoTipo>('pix_bricia');
  const [valorForma1, setValorForma1] = useState<number>(0);

  const [formaPagamento2, setFormaPagamento2] = useState<FormaPagamentoTipo>('dinheiro');
  const [valorForma2, setValorForma2] = useState<number>(0);

  // Cálculo consolidado de valores
  const { subtotal, descontos, total } = useMemo(() => {
    return calcularTotaisComanda(itens);
  }, [itens]);

  const setDividirPagamento = useCallback((dividir: boolean) => {
    setDividirPagamentoState(dividir);
    if (dividir) {
      const metade = Number((total / 2).toFixed(2));
      const restante = Number((total - metade).toFixed(2));
      setValorForma1(metade);
      setValorForma2(restante);
    }
  }, [total]);

  const handleAlterarValorForma1 = useCallback((v: number) => {
    setValorForma1(v);
    setValorForma2(Number(Math.max(0, total - v).toFixed(2)));
  }, [total]);

  // Carrega dados completos do cliente (dataNascimento e cupomAniversarioUsadoEm)
  useEffect(() => {
    let ativo = true;
    if (dados?.clienteId) {
      buscarClientePorIdNoSupabase(dados.clienteId).then((res) => {
        if (ativo && res) setCliente(res);
      });
    }
    return () => {
      ativo = false;
    };
  }, [dados?.clienteId]);

  // Elegibilidade do cliente ao cupom de aniversário
  const elegibilidadeAniversario = useMemo(() => {
    return verificarElegibilidadeAniversario(cliente);
  }, [cliente]);

  // Verifica se HOJE é exatamente a data de aniversário do cliente
  const isAniversarianteHoje = useMemo(() => {
    return isAniversarianteDoDia(cliente);
  }, [cliente]);

  // Identifica se algum item da comanda já está utilizando o cupom de aniversário
  const itemComCupomAniversario = useMemo(() => {
    return itens.find((i) => i.desconto?.origem === 'aniversario') || null;
  }, [itens]);

  const handleVoltar = useCallback(() => {
    setComandaAtivaAgenda(null);
    setComandaAtivaComandas(null);
  }, [setComandaAtivaAgenda, setComandaAtivaComandas]);

  // Aplica cupom de aniversário (10% fixo) exclusivamente a um item
  const handleAplicarCupomAniversario = useCallback((itemId: string) => {
    setItens((prev) =>
      prev.map((item) => {
        // Se este for o item selecionado, aplica os 10% de aniversário
        if (item.id === itemId) {
          return {
            ...item,
            desconto: {
              tipo: 'percentual',
              valor: 10,
              origem: 'aniversario',
            },
          };
        }
        // Se qualquer outro item possuía o cupom de aniversário, limpa (limite de 1 por comanda)
        if (item.desconto?.origem === 'aniversario') {
          return {
            ...item,
            desconto: null,
          };
        }
        return item;
      })
    );
  }, []);

  // Remove cupom de aniversário
  const handleRemoverCupomAniversario = useCallback(() => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.desconto?.origem === 'aniversario') {
          return { ...item, desconto: null };
        }
        return item;
      })
    );
  }, []);

  // Aplica desconto manual com trava em 100% ou no valor total da linha
  const handleAplicarDescontoManual = useCallback(
    (itemId: string, tipo: DescontoTipo, valor: number) => {
      setItens((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;

          const totalLinhaBruto = item.quantidade * item.valorUnitario;
          let valFinal = valor;

          if (tipo === 'percentual') {
            valFinal = Math.min(100, Math.max(0, valor));
          } else {
            valFinal = Math.min(totalLinhaBruto, Math.max(0, valor));
          }

          return {
            ...item,
            desconto: {
              tipo,
              valor: valFinal,
              origem: 'manual',
            },
          };
        })
      );
    },
    []
  );

  // Remove qualquer desconto de um item
  const handleRemoverDescontoItem = useCallback((itemId: string) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, desconto: null };
        }
        return item;
      })
    );
  }, []);

  const abrirModalDesconto = useCallback((item: ComandaItem) => {
    setItemSelecionadoDesconto(item);
    setModalDescontoAberto(true);
  }, []);

  const fecharModalDesconto = useCallback(() => {
    setItemSelecionadoDesconto(null);
    setModalDescontoAberto(false);
  }, []);

  const handleAdicionarItem = useCallback(
    (descricao: string, profissional: string, valor: number, servicoId?: string, profissionalId?: string) => {
      setItens((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          servicoId,
          profissionalId,
          descricao,
          profissional,
          quantidade: 1,
          valorUnitario: valor,
          desconto: null,
        },
      ]);
    },
    []
  );

  const handleRemoverItem = useCallback((id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleFinalizar = useCallback(async () => {
    setSalvandoFinalizacao(true);
    setErroFinalizacao(null);

    try {
      if (dividirPagamento) {
        const soma = Number((Number(valorForma1) + Number(valorForma2)).toFixed(2));
        if (Math.abs(soma - total) > 0.05) {
          throw new Error(`A soma dos pagamentos (R$ ${soma.toFixed(2)}) deve ser igual ao total da comanda (R$ ${total.toFixed(2)}).`);
        }
      }

      // Monta o payload de pagamentos
      const pagamentos = dividirPagamento
        ? [
            { forma: formaPagamento1, valor: Number(valorForma1) },
            { forma: formaPagamento2, valor: Number(valorForma2) },
          ]
        : [{ forma: formaPagamento1, valor: total }];

      const dadosComandaFinal = {
        ...dados,
        clienteId: dados?.clienteId || cliente?.id,
        clienteNome: dados?.clienteNome || cliente?.nome,
        comandaStatus: 'finalizada',
        subtotal,
        desconto: descontos,
        valorTotal: total,
        itens,
        pagamentos,
      };

      // Persiste e valida atomicamente via Supabase RPC
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

      // Abre a view de detalhes da comanda concluída
      setComandaAtivaAgenda(payloadFinal);
      setComandaAtivaComandas(payloadFinal);
    } catch (err: any) {
      console.error('Erro ao finalizar comanda:', err);
      setErroFinalizacao(err.message || 'Erro inesperado ao finalizar comanda.');
    } finally {
      setSalvandoFinalizacao(false);
    }
  }, [
    dados,
    cliente,
    dividirPagamento,
    formaPagamento1,
    valorForma1,
    formaPagamento2,
    valorForma2,
    total,
    subtotal,
    descontos,
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
    cliente,
    itens,
    subtotal,
    desconto: descontos,
    total,
    elegibilidadeAniversario,
    isAniversarianteHoje,
    itemComCupomAniversario,
    handleAplicarCupomAniversario,
    handleRemoverCupomAniversario,
    handleAplicarDescontoManual,
    handleRemoverDescontoItem,
    modalAdicionarAberto,
    setModalAdicionarAberto,
    modalDescontoAberto,
    itemSelecionadoDesconto,
    abrirModalDesconto,
    fecharModalDesconto,
    salvandoFinalizacao,
    erroFinalizacao,
    setErroFinalizacao,
    dividirPagamento,
    setDividirPagamento,
    formaPagamento1,
    setFormaPagamento1,
    valorForma1,
    setValorForma1,
    handleAlterarValorForma1,
    formaPagamento2,
    setFormaPagamento2,
    valorForma2,
    setValorForma2,
    handleVoltar,
    handleFinalizar,
    descartarComandaEmEdicao,
    handleAdicionarItem,
    handleRemoverItem,
    calcularDescontoItem,
  };
}

export type CriarComandaViewController = ReturnType<typeof useCriarComandaViewController>;
