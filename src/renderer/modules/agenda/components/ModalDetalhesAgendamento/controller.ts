import { useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import type { StatusAgendamento } from '../../schemas/agendamento.schema';

export function useModalDetalhesAgendamentoController() {
  const agendamento = useAgendaStore((s) => s.agendamentoSelecionado);
  const profissionais = useAgendaStore((s) => s.profissionais);
  const selecionarAgendamento = useAgendaStore((s) => s.selecionarAgendamento);
  const atualizarStatusAgendamento = useAgendaStore((s) => s.atualizarStatusAgendamento);
  const cancelarAgendamento = useAgendaStore((s) => s.cancelarAgendamento);
  const setComandaAtivaView = useAgendaStore((s) => s.setComandaAtivaView);

  const profissional = profissionais.find((p) => p.id === agendamento?.profissionalId);
  const profissionalNome = profissional ? profissional.nome : 'Profissional';

  const fecharModal = useCallback(() => {
    selecionarAgendamento(null);
  }, [selecionarAgendamento]);

  const handleMudarStatus = useCallback(
    async (novoStatus: StatusAgendamento) => {
      if (!agendamento) return;
      await atualizarStatusAgendamento(agendamento.id, novoStatus);
    },
    [agendamento, atualizarStatusAgendamento]
  );

  const excluirAgendamento = useCallback(async () => {
    if (!agendamento) return;
    await cancelarAgendamento(agendamento.id);
  }, [agendamento, cancelarAgendamento]);

  const handleAbrirComanda = useCallback(() => {
    if (!agendamento) return;
    fecharModal();
    setComandaAtivaView({
      tipo: agendamento.comandaStatus === 'rascunho' || !agendamento.comandaStatus ? 'criar' : 'detalhes',
      dados: {
        agendamentoId: agendamento.id,
        clienteId: agendamento.clienteId,
        clienteNome: agendamento.clienteNome,
        profissionalId: agendamento.profissionalId,
        profissionalNome,
        servicoId: agendamento.servicoId,
        servico: agendamento.servico,
        valor: agendamento.valor,
        horarioInicio: agendamento.horarioInicio,
        horarioFim: agendamento.horarioFim,
        comandaId: agendamento.comandaId || `cmd-${Date.now()}`,
        comandaNumero: agendamento.comandaNumero || `#${Math.floor(1000 + Math.random() * 9000)}`,
        comandaStatus: agendamento.comandaStatus || 'rascunho',
        subtotal: agendamento.valor || 0,
        valorTotal: agendamento.valor || 0,
        desconto: 0,
        itens: [
          {
            id: `item-${agendamento.id}`,
            servicoId: agendamento.servicoId,
            descricao: agendamento.servico,
            profissionalId: agendamento.profissionalId,
            profissional: profissionalNome,
            quantidade: 1,
            valorUnitario: agendamento.valor || 0,
            desconto: null,
          },
        ],
      },
    });
  }, [agendamento, profissionalNome, fecharModal, setComandaAtivaView]);

  return {
    agendamento,
    profissionalNome,
    fecharModal,
    handleMudarStatus,
    excluirAgendamento,
    handleAbrirComanda,
  };
}

export type ModalDetalhesAgendamentoController = ReturnType<typeof useModalDetalhesAgendamentoController>;
