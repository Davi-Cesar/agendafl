import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { useStatusCoresStore, STATUS_PADRAO } from '../../store/statusCores.store';
import { useProfissionaisStore } from '@modules/profissionais';
import { useCaixaStore } from '@modules/caixa';
import { gerarSlots, calcGeometry } from '@shared/lib/utils';
import type { Agendamento, Profissional } from '../../schemas/agendamento.schema';

const GRADE_INICIO = '08:00';
const GRADE_FIM = '19:00';
const SLOT_MIN = 30;
const SLOT_HEIGHT = 76;
const COL_WIDTH = 240;

function parseTimeToMins(tStr: string): number {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function parseMinsToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function useGradeHorariosController() {
  const profissionais = useAgendaStore((s) => s.profissionais);
  const agendamentos = useAgendaStore((s) => s.agendamentos);
  const horariosMap = useAgendaStore((s) => s.horariosMap);
  const excecoesMap = useAgendaStore((s) => s.excecoesMap);
  const dataSelecionada = useAgendaStore((s) => s.dataSelecionada);
  const filtro = useAgendaStore((s) => s.filtroProfissional);
  const abrirModalNovo = useAgendaStore((s) => s.abrirModalNovo);
  const selecionarAgendamento = useAgendaStore((s) => s.selecionarAgendamento);
  const movimentoAnimacao = useAgendaStore((s) => s.movimentoAnimacao);
  const statusList = useStatusCoresStore((s) => s.statusList);
  const movingCardRef = useRef<HTMLDivElement | null>(null);

  const getStatusConfig = useCallback(
    (statusId: string) => {
      return statusList.find((item) => item.id === statusId) || STATUS_PADRAO[0];
    },
    [statusList]
  );

  const slots = useMemo(() => gerarSlots(GRADE_INICIO, GRADE_FIM, SLOT_MIN), []);

  const profFiltrados = useMemo(() => {
    if (!filtro.trim()) return profissionais;
    const f = filtro.toLowerCase();
    return profissionais.filter(
      (p) => p.nome.toLowerCase().includes(f) || p.especialidade.toLowerCase().includes(f)
    );
  }, [profissionais, filtro]);

  const gradeAltura = slots.length * SLOT_HEIGHT;

  const setComandaAtivaView = useAgendaStore((s) => s.setComandaAtivaView);
  const abrirAlertaCaixaFechado = useAgendaStore((s) => s.abrirAlertaCaixaFechado);
  const ordemPersonalizadaAtiva = useAgendaStore((s) => s.ordemPersonalizadaAtiva);
  const reordenarProfissionais = useAgendaStore((s) => s.reordenarProfissionais);
  const resetarOrdemProfissionais = useAgendaStore((s) => s.resetarOrdemProfissionais);

  const [draggedProfId, setDraggedProfId] = useState<string | null>(null);
  const [dragOverProfId, setDragOverProfId] = useState<string | null>(null);
  const [dropIndicatorSide, setDropIndicatorSide] = useState<'left' | 'right' | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, profId: string) => {
    e.dataTransfer.setData('text/plain', profId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProfId(profId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetProfId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const side: 'left' | 'right' = e.clientX < midX ? 'left' : 'right';

    setDragOverProfId(targetProfId);
    setDropIndicatorSide(side);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, targetProfId: string) => {
    const related = e.relatedTarget as Node | null;
    if (related && (e.currentTarget as HTMLElement).contains(related)) {
      return;
    }
    if (dragOverProfId === targetProfId) {
      setDragOverProfId(null);
      setDropIndicatorSide(null);
    }
  }, [dragOverProfId]);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetProfId: string) => {
      e.preventDefault();
      const sourceProfId = e.dataTransfer.getData('text/plain') || draggedProfId;

      if (sourceProfId && targetProfId && sourceProfId !== targetProfId) {
        reordenarProfissionais(sourceProfId, targetProfId, dropIndicatorSide || 'left');
      }

      setDraggedProfId(null);
      setDragOverProfId(null);
      setDropIndicatorSide(null);
    },
    [draggedProfId, dropIndicatorSide, reordenarProfissionais]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedProfId(null);
    setDragOverProfId(null);
    setDropIndicatorSide(null);
  }, []);

  const getDisponibilidadeProfissionalNoSlot = useCallback(
    (profId: string, slotStr: string) => {
      const partes = dataSelecionada.split('-');
      const diaSemana = partes.length === 3 ? new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])).getDay() : 1;

      const profHorarios = horariosMap[profId] || [];
      const profExcecoes = excecoesMap[profId] || [];

      const hDia = profHorarios.find((h: any) => h.diaSemana === diaSemana);
      const isDiaAtivo = hDia ? Boolean(hDia.ativo) : (diaSemana !== 0);

      const slotMin = parseTimeToMins(slotStr);

      let disponivel = false;
      let atendePadrao = false;
      let isAtendimentoExtra = false;
      let isBloqueado = false;
      let motivoExcecao = '';

      // 1. Jornada Padrão se o dia for ativo
      if (isDiaAtivo) {
        const mInicio = parseTimeToMins(hDia?.manhaInicio || '08:00');
        const mFim = parseTimeToMins(hDia?.manhaFim || '11:00');
        const tInicio = parseTimeToMins(hDia?.tardeInicio || '13:30');
        const tFim = parseTimeToMins(hDia?.tardeFim || '17:00');

        if ((slotMin >= mInicio && slotMin < mFim) || (slotMin >= tInicio && slotMin < tFim)) {
          disponivel = true;
          atendePadrao = true;
        }
      }

      // 2. Sobrescrever com exceções para esta DATA exata (YYYY-MM-DD)
      const excecoesData = profExcecoes.filter((e: any) => e.data === dataSelecionada);

      excecoesData.forEach((exc: any) => {
        const incM = parseTimeToMins(exc.inicio);
        const fimM = parseTimeToMins(exc.fim);

        if (slotMin >= incM && slotMin < fimM) {
          if (exc.tipo === 'atendimento_extra') {
            disponivel = true;
            isAtendimentoExtra = true;
            motivoExcecao = exc.motivo || 'Atendimento Extra';
          } else if (exc.tipo === 'indisponibilidade' || exc.tipo === 'bloqueio') {
            disponivel = false;
            isBloqueado = true;
            motivoExcecao = exc.motivo || 'Indisponível (Exceção)';
          }
        }
      });

      const isExcecao = !atendePadrao || isAtendimentoExtra || isBloqueado;

      return { disponivel, atendePadrao, isExcecao, isAtendimentoExtra, isBloqueado, motivoExcecao };
    },
    [dataSelecionada, horariosMap, excecoesMap]
  );

  const handleSlotClick = useCallback(
    (profissionalId: string, horario: string, disponivel: boolean) => {
      if (!disponivel) return; // Não abre se não tiver atendimento disponível neste horário
      const caixaAtivo = useCaixaStore.getState().caixaAtivo;
      if (!caixaAtivo) {
        abrirAlertaCaixaFechado();
        return;
      }

      // Se já houver um agendamento curto dentro deste slot de 30min (ex: 08:00 às 08:10),
      // sugere automaticamente o horário de término dele (ex: 08:10) para facilitar encaixes seguidos
      const slotInicioMin = parseTimeToMins(horario);
      const slotFimMin = slotInicioMin + SLOT_MIN;
      const aptsNoSlot = agendamentos
        .filter((a) => a.profissionalId === profissionalId && a.status !== 'faltou')
        .map((a) => ({
          ini: parseTimeToMins(a.horarioInicio),
          fim: parseTimeToMins(a.horarioFim),
        }))
        .filter((a) => a.ini >= slotInicioMin && a.ini < slotFimMin)
        .sort((a, b) => b.fim - a.fim);

      let horarioSugerido = horario;
      if (aptsNoSlot.length > 0 && aptsNoSlot[0].fim < slotFimMin) {
        horarioSugerido = parseMinsToTime(aptsNoSlot[0].fim);
      }

      abrirModalNovo({ profissionalId, horario: horarioSugerido });
    },
    [agendamentos, abrirModalNovo, abrirAlertaCaixaFechado]
  );

  const handleCardClick = useCallback(
    (apt: Agendamento) => {
      selecionarAgendamento(apt);
    },
    [selecionarAgendamento]
  );

  const handleAbrirComandaDireta = useCallback(
    (apt: Agendamento) => {
      if (!apt.comandaId) return;
      const profissional = profissionais.find((p) => p.id === apt.profissionalId);
      setComandaAtivaView({
        tipo: 'detalhes',
        dados: {
          agendamentoId: apt.id,
          clienteId: apt.clienteId,
          clienteNome: apt.clienteNome,
          profissionalId: apt.profissionalId,
          profissionalNome: profissional?.nome || 'Profissional',
          servicoId: apt.servicoId,
          servico: apt.servico,
          horarioInicio: apt.horarioInicio,
          horarioFim: apt.horarioFim,
          observacoes: apt.observacoes,
          comandaId: apt.comandaId,
          comandaNumero: apt.comandaNumero || '#0001',
          comandaStatus: apt.comandaStatus || 'finalizada',
          valorTotal: apt.valor || 0,
          subtotal: apt.valor || 0,
          desconto: 0,
          itens: [
            {
              id: `item-${apt.id}`,
              servicoId: apt.servicoId,
              descricao: apt.servico,
              profissionalId: apt.profissionalId,
              profissional: profissional?.nome || 'Profissional',
              quantidade: 1,
              valorUnitario: apt.valor || 0,
              desconto: null,
            },
          ],
        },
      });
    },
    [profissionais, setComandaAtivaView]
  );

  const getAgendamentosDoProf = useCallback(
    (profId: string) => {
      return agendamentos.filter((a) => a.profissionalId === profId);
    },
    [agendamentos]
  );

  const [confirmModalData, setConfirmModalData] = useState<{
    profId: string;
    profNome: string;
    horario: string;
  } | null>(null);

  const handleDisabledSlotClick = useCallback(
    (prof: Profissional, slotStr: string) => {
      const caixaAtivo = useCaixaStore.getState().caixaAtivo;
      if (!caixaAtivo) {
        abrirAlertaCaixaFechado();
        return;
      }
      setConfirmModalData({
        profId: prof.id,
        profNome: prof.nome,
        horario: slotStr,
      });
    },
    [abrirAlertaCaixaFechado]
  );

  const handleCancelarConfirmacao = useCallback(() => {
    setConfirmModalData(null);
  }, []);

  const handleConfirmarCriarExcecao = useCallback(() => {
    if (!confirmModalData) return;
    const { profId, profNome, horario } = confirmModalData;
    const dataAtual = useAgendaStore.getState().dataSelecionada;

    setConfirmModalData(null);

    useProfissionaisStore.getState().setModalExcecaoConfig({
      aberto: true,
      profissionalId: profId,
      profissionalNome: profNome,
      dataStr: dataAtual,
      inicio: horario,
      fim: '',
      tipo: 'atendimento_extra',
      tipoTravado: true,
      onSalvarSuccess: (dataStr, inicio) => {
        useAgendaStore.getState().abrirModalNovo({
          profissionalId: profId,
          horario: inicio,
        });
      },
    });
  }, [confirmModalData]);

  useEffect(() => {
    if (!movimentoAnimacao) return;
    const rafId = window.requestAnimationFrame(() => {
      movingCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [movimentoAnimacao]);

  const getCardMoveAnimation = useCallback(
    (apt: Agendamento, newTop: number) => {
      if (!movimentoAnimacao || movimentoAnimacao.agendamentoId !== apt.id) {
        return { isMoving: false, moveFromX: 0, moveFromY: 0 };
      }

      const fromIdx = profFiltrados.findIndex(
        (p) => p.id === movimentoAnimacao.origemProfissionalId
      );
      const toIdx = profFiltrados.findIndex((p) => p.id === apt.profissionalId);

      const moveFromX =
        fromIdx !== -1 && toIdx !== -1 ? (fromIdx - toIdx) * COL_WIDTH : 0;
      const oldTop = calcGeometry(
        movimentoAnimacao.origemHorarioInicio,
        movimentoAnimacao.origemHorarioFim,
        GRADE_INICIO,
        SLOT_MIN,
        SLOT_HEIGHT
      ).top;
      const moveFromY = oldTop - newTop;

      return { isMoving: true, moveFromX, moveFromY };
    },
    [movimentoAnimacao, profFiltrados]
  );

  return {
    slots,
    profFiltrados,
    gradeAltura,
    movimentoAnimacao,
    movingCardRef,
    getCardMoveAnimation,
    confirmModalData,
    draggedProfId,
    dragOverProfId,
    dropIndicatorSide,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    ordemPersonalizadaAtiva,
    resetarOrdemProfissionais,
    getDisponibilidadeProfissionalNoSlot,
    handleSlotClick,
    handleDisabledSlotClick,
    handleCancelarConfirmacao,
    handleConfirmarCriarExcecao,
    handleCardClick,
    handleAbrirComandaDireta,
    getAgendamentosDoProf,
    getStatusConfig,
    calcGeometry: (inicio: string, fim: string) => calcGeometry(inicio, fim, GRADE_INICIO, SLOT_MIN, SLOT_HEIGHT),
  };
}

export type GradeHorariosController = ReturnType<typeof useGradeHorariosController>;
