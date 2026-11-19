import { useState, useCallback, useMemo, useRef } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { useStatusCoresStore, STATUS_PADRAO } from '../../store/statusCores.store';
import * as agendaService from '../../services/agenda.service';
import { calcularHorarioFim } from '@shared/lib/utils';
import {
  AtualizarAgendamentoDTO,
  type StatusAgendamento,
  type ServicoItem,
} from '../../schemas/agendamento.schema';

function parseTimeToMins(tStr: string): number {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function useModalDetalhesAgendamentoController() {
  const agendamento = useAgendaStore((s) => s.agendamentoSelecionado);
  const agendamentos = useAgendaStore((s) => s.agendamentos);
  const profissionais = useAgendaStore((s) => s.profissionais);
  const horariosMap = useAgendaStore((s) => s.horariosMap);
  const excecoesMap = useAgendaStore((s) => s.excecoesMap);
  const dataSelecionada = useAgendaStore((s) => s.dataSelecionada);
  const selecionarAgendamento = useAgendaStore((s) => s.selecionarAgendamento);
  const atualizarAgendamento = useAgendaStore((s) => s.atualizarAgendamento);
  const atualizarStatusAgendamento = useAgendaStore((s) => s.atualizarStatusAgendamento);
  const cancelarAgendamento = useAgendaStore((s) => s.cancelarAgendamento);
  const setComandaAtivaView = useAgendaStore((s) => s.setComandaAtivaView);
  const statusList = useStatusCoresStore((s) => s.statusList);
  const abrirModalStatusCores = useStatusCoresStore((s) => s.abrirModal);

  const [editando, setEditando] = useState(false);
  const [profissionalIdEdit, setProfissionalIdEdit] = useState('');
  const [servicoEdit, setServicoEdit] = useState('');
  const [horarioInicioEdit, setHorarioInicioEdit] = useState('09:00');
  const [observacoesEdit, setObservacoesEdit] = useState('');
  const [servicosList, setServicosList] = useState<ServicoItem[]>([]);
  const [carregandoServicosEdit, setCarregandoServicosEdit] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);
  const servicosReqIdRef = useRef(0);

  const statusAtualConfig =
    statusList.find((item) => item.id === agendamento?.status) || STATUS_PADRAO[0];

  const profissional = profissionais.find((p) => p.id === agendamento?.profissionalId);
  const profissionalNome = profissional ? profissional.nome : 'Profissional';
  const podeEditar = Boolean(agendamento && agendamento.comandaStatus !== 'finalizada');

  // Identifica todos os agendamentos da mesma cliente no dia para unificar na mesma comanda (estilo Beleza Soft)
  const agendamentosMesmoCliente = useMemo(() => {
    if (!agendamento) return [];

    const isComandaJaFinalizada = agendamento.comandaStatus === 'finalizada';

    if (isComandaJaFinalizada && agendamento.comandaId) {
      const daMesmaComanda = agendamentos.filter((a) => a.comandaId === agendamento.comandaId);
      return daMesmaComanda.length > 0
        ? [...daMesmaComanda].sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio))
        : [agendamento];
    }

    const nomeAlvo = agendamento.clienteNome.trim().toLowerCase();
    const idAlvo = agendamento.clienteId;

    const lista = agendamentos.filter((apt) => {
      if (apt.id === agendamento.id) return true;
      if (apt.status === 'faltou' || apt.status === 'cancelado') return false;
      if (apt.comandaStatus === 'finalizada') return false;

      if (idAlvo && apt.clienteId) {
        return apt.clienteId === idAlvo;
      }
      return apt.clienteNome.trim().toLowerCase() === nomeAlvo;
    });

    return lista.sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }, [agendamento, agendamentos]);

  const horarioFimEditCalculado = useMemo(() => {
    if (!agendamento) return '09:30';
    const servicoObj = servicosList.find((s) => s.nome === servicoEdit);
    const duracaoAtual = Math.max(
      10,
      parseTimeToMins(agendamento.horarioFim) - parseTimeToMins(agendamento.horarioInicio)
    );
    const duracao = servicoObj ? servicoObj.duracaoMinutos : duracaoAtual;
    return calcularHorarioFim(horarioInicioEdit, duracao);
  }, [agendamento, servicosList, servicoEdit, horarioInicioEdit]);

  const isHorarioExcecaoEdit = useMemo(() => {
    if (!editando || !profissionalIdEdit || !horarioInicioEdit) return false;
    const dataAlvo = agendamento?.data || dataSelecionada;
    const partes = dataAlvo.split('-');
    const diaSemana =
      partes.length === 3
        ? new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])).getDay()
        : 1;

    const profHorarios = horariosMap[profissionalIdEdit] || [];
    const profExcecoes = excecoesMap[profissionalIdEdit] || [];
    const hDia = profHorarios.find((h: any) => h.diaSemana === diaSemana);
    const isDiaAtivo = hDia ? Boolean(hDia.ativo) : diaSemana !== 0;

    const slotMin = parseTimeToMins(horarioInicioEdit);
    let atendePadrao = false;

    if (isDiaAtivo) {
      const mInicio = parseTimeToMins(hDia?.manhaInicio || '08:00');
      const mFim = parseTimeToMins(hDia?.manhaFim || '11:00');
      const tInicio = parseTimeToMins(hDia?.tardeInicio || '13:30');
      const tFim = parseTimeToMins(hDia?.tardeFim || '17:00');

      if ((slotMin >= mInicio && slotMin < mFim) || (slotMin >= tInicio && slotMin < tFim)) {
        atendePadrao = true;
      }
    }

    const excecoesData = profExcecoes.filter((e: any) => e.data === dataAlvo);
    let isBloqueadoOuExtra = false;
    excecoesData.forEach((exc: any) => {
      const incM = parseTimeToMins(exc.inicio);
      const fimM = parseTimeToMins(exc.fim);
      if (slotMin >= incM && slotMin < fimM) {
        isBloqueadoOuExtra = true;
      }
    });

    return !atendePadrao || isBloqueadoOuExtra;
  }, [editando, profissionalIdEdit, horarioInicioEdit, agendamento?.data, dataSelecionada, horariosMap, excecoesMap]);

  const carregarServicosEdit = useCallback(
    async (profId: string, manterSeExistir?: string, permitirFallbackOriginal?: boolean) => {
      const reqId = ++servicosReqIdRef.current;
      if (!profId) {
        setServicosList([]);
        setServicoEdit('');
        setCarregandoServicosEdit(false);
        return;
      }

      setCarregandoServicosEdit(true);
      try {
        const list = await agendaService.buscarServicosPorProfissional(profId);
        if (servicosReqIdRef.current !== reqId) return;

        setServicosList(list);
        if (list.length === 0) {
          setServicoEdit(permitirFallbackOriginal && manterSeExistir ? manterSeExistir : '');
        } else if (manterSeExistir && list.some((s) => s.nome === manterSeExistir)) {
          setServicoEdit(manterSeExistir);
        } else if (permitirFallbackOriginal && manterSeExistir) {
          setServicoEdit(manterSeExistir);
        } else {
          setServicoEdit(list[0].nome);
        }
      } finally {
        if (servicosReqIdRef.current === reqId) {
          setCarregandoServicosEdit(false);
        }
      }
    },
    []
  );

  const iniciarEdicao = useCallback(() => {
    if (!agendamento || !podeEditar) return;
    setProfissionalIdEdit(agendamento.profissionalId);
    setServicoEdit(agendamento.servico);
    setHorarioInicioEdit(agendamento.horarioInicio);
    setObservacoesEdit(agendamento.observacoes || '');
    setErroEdicao(null);
    setEditando(true);

    carregarServicosEdit(agendamento.profissionalId, agendamento.servico, true);
  }, [agendamento, podeEditar, carregarServicosEdit]);

  const handleProfissionalEditChange = useCallback(
    (novoProfId: string) => {
      setProfissionalIdEdit(novoProfId);
      carregarServicosEdit(novoProfId, servicoEdit, false);
    },
    [carregarServicosEdit, servicoEdit]
  );

  const cancelarEdicao = useCallback(() => {
    setEditando(false);
    setErroEdicao(null);
  }, []);

  const fecharModal = useCallback(() => {
    setEditando(false);
    setErroEdicao(null);
    selecionarAgendamento(null);
  }, [selecionarAgendamento]);

  const handleSalvarEdicao = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!agendamento) return;
      setErroEdicao(null);
      setSalvandoEdicao(true);

      try {
        const valid = AtualizarAgendamentoDTO.parse({
          id: agendamento.id,
          profissionalId: profissionalIdEdit,
          servico: servicoEdit,
          horarioInicio: horarioInicioEdit,
          horarioFim: horarioFimEditCalculado,
          observacoes: observacoesEdit,
        });
        await atualizarAgendamento(valid);
        setEditando(false);
      } catch (err: any) {
        if (err?.errors && err.errors.length > 0) {
          setErroEdicao(err.errors[0].message);
        } else {
          setErroEdicao(err instanceof Error ? err.message : 'Erro ao atualizar agendamento');
        }
      } finally {
        setSalvandoEdicao(false);
      }
    },
    [
      agendamento,
      profissionalIdEdit,
      servicoEdit,
      horarioInicioEdit,
      horarioFimEditCalculado,
      observacoesEdit,
      atualizarAgendamento,
    ]
  );

  const handleMudarStatus = useCallback(
    async (novoStatus: StatusAgendamento) => {
      if (!agendamento) return;
      await atualizarStatusAgendamento(agendamento.id, novoStatus);
    },
    [agendamento, atualizarStatusAgendamento]
  );

  const excluirAgendamento = useCallback(async () => {
    if (!agendamento) return;
    setEditando(false);
    await cancelarAgendamento(agendamento.id);
  }, [agendamento, cancelarAgendamento]);

  const handleAbrirComanda = useCallback(() => {
    if (!agendamento) return;

    const listaUnificada =
      agendamentosMesmoCliente.length > 0 ? agendamentosMesmoCliente : [agendamento];

    const itensUnificados = listaUnificada.map((aptItem) => {
      const profObj = profissionais.find((p) => p.id === aptItem.profissionalId);
      return {
        id: `item-${aptItem.id}`,
        agendamentoId: aptItem.id,
        servicoId: aptItem.servicoId,
        descricao: aptItem.servico,
        profissionalId: aptItem.profissionalId,
        profissional: profObj ? profObj.nome : 'Profissional',
        quantidade: 1,
        valorUnitario: Number(aptItem.valor || 0),
        desconto: null,
      };
    });

    const subtotalUnificado = itensUnificados.reduce(
      (acc, item) => acc + item.valorUnitario * item.quantidade,
      0
    );

    // Consolida observações de todos os agendamentos unificados da cliente no dia
    const aptsComObs = listaUnificada.filter((a) => a.observacoes && a.observacoes.trim().length > 0);
    const obsDistintas = Array.from(new Set(aptsComObs.map((a) => a.observacoes!.trim())));
    let observacoesUnificadas: string | undefined;
    if (obsDistintas.length === 1) {
      observacoesUnificadas = obsDistintas[0];
    } else if (obsDistintas.length > 1) {
      observacoesUnificadas = aptsComObs
        .map((a) => `[${a.servico}]: ${a.observacoes!.trim()}`)
        .join('\n');
    }

    const horarioInicioUnificado = listaUnificada[0]?.horarioInicio || agendamento.horarioInicio;
    const horarioFimUnificado =
      listaUnificada[listaUnificada.length - 1]?.horarioFim || agendamento.horarioFim;

    const servicosResumo = itensUnificados.map((i) => i.descricao).join(' + ');
    const profissionaisResumo = Array.from(
      new Set(itensUnificados.map((i) => i.profissional))
    ).join(', ');

    fecharModal();
    setComandaAtivaView({
      tipo:
        agendamento.comandaStatus === 'rascunho' || !agendamento.comandaStatus
          ? 'criar'
          : 'detalhes',
      dados: {
        agendamentoId: agendamento.id,
        agendamentoIds: listaUnificada.map((a) => a.id),
        clienteId: agendamento.clienteId || listaUnificada.find((a) => a.clienteId)?.clienteId,
        clienteNome: agendamento.clienteNome,
        profissionalId: agendamento.profissionalId,
        profissionalNome: profissionaisResumo || profissionalNome,
        servicoId: agendamento.servicoId,
        servico: servicosResumo || agendamento.servico,
        valor: subtotalUnificado,
        horarioInicio: horarioInicioUnificado,
        horarioFim: horarioFimUnificado,
        observacoes: observacoesUnificadas,
        comandaId: agendamento.comandaId || `cmd-${Date.now()}`,
        comandaNumero: agendamento.comandaNumero || `#${Math.floor(1000 + Math.random() * 9000)}`,
        comandaStatus: agendamento.comandaStatus || 'rascunho',
        subtotal: subtotalUnificado,
        valorTotal: subtotalUnificado,
        desconto: 0,
        itens: itensUnificados,
      },
    });
  }, [agendamento, agendamentosMesmoCliente, profissionais, profissionalNome, fecharModal, setComandaAtivaView]);

  return {
    agendamento,
    agendamentosMesmoCliente,
    profissionais,
    profissionalNome,
    podeEditar,
    editando,
    profissionalIdEdit,
    setProfissionalIdEdit,
    handleProfissionalEditChange,
    servicoEdit,
    setServicoEdit,
    horarioInicioEdit,
    setHorarioInicioEdit,
    horarioFimEditCalculado,
    observacoesEdit,
    setObservacoesEdit,
    servicosList,
    carregandoServicosEdit,
    salvandoEdicao,
    erroEdicao,
    isHorarioExcecaoEdit,
    iniciarEdicao,
    cancelarEdicao,
    handleSalvarEdicao,
    statusList,
    statusAtualConfig,
    abrirModalStatusCores,
    fecharModal,
    handleMudarStatus,
    excluirAgendamento,
    handleAbrirComanda,
  };
}

export type ModalDetalhesAgendamentoController = ReturnType<typeof useModalDetalhesAgendamentoController>;
