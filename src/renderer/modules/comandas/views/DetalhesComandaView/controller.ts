import { useCallback, useState, useEffect, useMemo } from 'react';
import { useAgendaStore } from '@modules/agenda/store/agenda.store';
import { useComandasStore } from '../../store/comandas.store';
import { useRouterStore } from '@shared/router/router.store';
import { supabase } from '@shared/supabase/client';

export interface DetalhesComandaViewProps {
  dados: any;
}

export function useDetalhesComandaViewController(dadosIniciais: any) {
  const setComandaAtivaAgenda = useAgendaStore((s) => s.setComandaAtivaView);
  const setComandaAtivaComandas = useComandasStore((s) => s.setComandaAtivaView);
  const navigate = useRouterStore((s) => s.navigate);

  const [dados, setDados] = useState<any>(dadosIniciais);
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    setDados(dadosIniciais);

    async function carregarDetalhesDoBanco() {
      const comandaId = dadosIniciais?.comandaId;
      if (!comandaId) return;

      const isUuid = /^[0-9a-fA-F-]{36}$/.test(comandaId);
      if (!isUuid) return;

      try {
        setCarregando(true);
        const { data: comandaDb, error } = await supabase
          .from('comandas')
          .select(`
            id,
            numero_sequencial,
            subtotal,
            desconto,
            valor_total,
            status,
            created_at,
            finalizada_em,
            clientes (id, nome, telefone),
            agendamentos (
              horario_inicio,
              horario_fim,
              servicos (nome, preco_padrao),
              profissionais (id, nome)
            ),
            comanda_itens (
              id,
              preco_unitario,
              quantidade,
              desconto_tipo,
              desconto_valor,
              desconto_origem,
              valor_comissao,
              servicos (nome),
              profissionais (nome)
            ),
            comanda_pagamentos (
              id,
              forma_pagamento,
              valor,
              detalhe_conta
            )
          `)
          .eq('id', comandaId)
          .maybeSingle();

        if (error) {
          console.warn('Aviso ao buscar detalhes da comanda no banco:', error.message);
          return;
        }

        if (comandaDb) {
          const db = comandaDb as any;
          const apt = Array.isArray(db.agendamentos) ? db.agendamentos[0] : db.agendamentos;
          const cli = Array.isArray(db.clientes) ? db.clientes[0] : db.clientes;
          const profApt = Array.isArray(apt?.profissionais) ? apt.profissionais[0] : apt?.profissionais;
          const servApt = Array.isArray(apt?.servicos) ? apt.servicos[0] : apt?.servicos;

          const clienteNome = cli?.nome || dadosIniciais?.clienteNome || 'Cliente';
          const horarioInicio = apt?.horario_inicio ? apt.horario_inicio.slice(0, 5) : dadosIniciais?.horarioInicio || '09:00';
          const horarioFim = apt?.horario_fim ? apt.horario_fim.slice(0, 5) : dadosIniciais?.horarioFim || '10:00';
          const numeroSequencial = db.numero_sequencial
            ? `#${String(db.numero_sequencial).padStart(4, '0')}`
            : dadosIniciais?.comandaNumero || '#0001';

          let itens = Array.isArray(db.comanda_itens) && db.comanda_itens.length > 0
            ? db.comanda_itens.map((it: any) => ({
                id: it.id,
                descricao: it.servicos?.nome || 'Serviço',
                profissional: it.profissionais?.nome || profApt?.nome || dadosIniciais?.profissionalNome || 'Profissional',
                quantidade: Number(it.quantidade || 1),
                valorUnitario: Number(it.preco_unitario || 0),
                desconto_tipo: it.desconto_tipo,
                desconto_valor: Number(it.desconto_valor || 0),
                desconto_origem: it.desconto_origem,
              }))
            : (dadosIniciais?.itens && dadosIniciais.itens.length > 0 ? dadosIniciais.itens : []);

          if (itens.length === 0) {
            const servicoNome = servApt?.nome || dadosIniciais?.servico || 'Serviço realizado';
            const profNome = profApt?.nome || dadosIniciais?.profissionalNome || 'Profissional';
            const valTotal = Number(db.valor_total ?? dadosIniciais?.valorTotal ?? dadosIniciais?.valor ?? 0);
            const valDesc = Number(db.desconto ?? dadosIniciais?.desconto ?? 0);
            const valSub = Number(db.subtotal ?? (valTotal + valDesc));

            itens = [
              {
                id: `item-${db.id || Date.now()}`,
                descricao: servicoNome,
                profissional: profNome,
                quantidade: 1,
                valorUnitario: valSub > 0 ? valSub : valTotal,
                desconto_valor: valDesc,
                desconto_tipo: valDesc > 0 ? 'valor_fixo' : null,
                desconto_origem: valDesc > 0 ? 'manual' : null,
              },
            ];
          }

          const pagamentos = Array.isArray(db.comanda_pagamentos) && db.comanda_pagamentos.length > 0
            ? db.comanda_pagamentos.map((pg: any) => ({
                forma: pg.forma_pagamento,
                valor: Number(pg.valor || 0),
                detalheConta: pg.detalhe_conta,
              }))
            : (dadosIniciais?.pagamentos && dadosIniciais.pagamentos.length > 0 ? dadosIniciais.pagamentos : []);

          setDados((prev: any) => ({
            ...prev,
            clienteNome,
            horarioInicio,
            horarioFim,
            comandaNumero: numeroSequencial,
            subtotal: Number(db.subtotal ?? (Number(db.valor_total || 0) + Number(db.desconto || 0))),
            desconto: Number(db.desconto ?? 0),
            valorTotal: Number(db.valor_total ?? 0),
            itens,
            pagamentos,
          }));
        }
      } catch (err) {
        console.warn('Erro ao carregar comanda detalhada:', err);
      } finally {
        setCarregando(false);
      }
    }

    carregarDetalhesDoBanco();
  }, [dadosIniciais]);

  const itensParaExibir = useMemo(() => {
    if (dados?.itens && dados.itens.length > 0) {
      return dados.itens;
    }

    const servicoNome = dados?.servico || 'Serviço realizado';
    const profNome = dados?.profissionalNome || 'Profissional';
    const valTotal = Number(dados?.valorTotal ?? dados?.valor ?? 0);
    const valDesc = Number(dados?.desconto ?? 0);
    const valSub = Number(dados?.subtotal ?? (valTotal + valDesc));

    return [
      {
        id: `item-fallback-${dados?.comandaId || '1'}`,
        descricao: servicoNome,
        profissional: profNome,
        quantidade: 1,
        valorUnitario: valSub > 0 ? valSub : valTotal,
        desconto_valor: valDesc,
        desconto_tipo: valDesc > 0 ? 'valor_fixo' : null,
        desconto_origem: valDesc > 0 ? 'manual' : null,
      },
    ];
  }, [dados]);

  const temAniversariante = useMemo(() => {
    return itensParaExibir.some(
      (i: any) => i.desconto?.origem === 'aniversario' || i.desconto_origem === 'aniversario'
    );
  }, [itensParaExibir]);

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
    carregando,
    itensParaExibir,
    temAniversariante,
    handleVoltarAgenda,
    handleIrParaComandas,
    handleImprimirComprovante,
  };
}

export type DetalhesComandaViewController = ReturnType<typeof useDetalhesComandaViewController>;
