import { useState, useMemo, useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { useProfissionaisStore } from '@modules/profissionais';
import { useCaixaStore } from '@modules/caixa';
import { gerarSlots, calcGeometry } from '@shared/lib/utils';
import type { Agendamento, Profissional } from '../../schemas/agendamento.schema';

const GRADE_INICIO = '08:00';
const GRADE_FIM = '19:00';
const SLOT_MIN = 30;

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

  const slots = useMemo(() => gerarSlots(GRADE_INICIO, GRADE_FIM, SLOT_MIN), []);

  const profFiltrados = useMemo(() => {
    if (!filtro.trim()) return profissionais;
    const f = filtro.toLowerCase();
    return profissionais.filter(
      (p) => p.nome.toLowerCase().includes(f) || p.especialidade.toLowerCase().includes(f)
    );
  }, [profissionais, filtro]);

  const gradeAltura = slots.length * 56;

  const setComandaAtivaView = useAgendaStore((s) => s.setComandaAtivaView);
  const abrirAlertaCaixaFechado = useAgendaStore((s) => s.abrirAlertaCaixaFechado);

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

      return { disponivel, isAtendimentoExtra, isBloqueado, motivoExcecao };
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
      abrirModalNovo({ profissionalId, horario });
    },
    [abrirModalNovo, abrirAlertaCaixaFechado]
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
          clienteNome: apt.clienteNome,
          profissionalNome: profissional?.nome || 'Profissional',
          servico: apt.servico,
          horarioInicio: apt.horarioInicio,
          horarioFim: apt.horarioFim,
          comandaId: apt.comandaId,
          comandaNumero: apt.comandaNumero || '#0001',
          comandaStatus: apt.comandaStatus || 'finalizada',
          valorTotal: 0,
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

  return {
    slots,
    profFiltrados,
    gradeAltura,
    confirmModalData,
    getDisponibilidadeProfissionalNoSlot,
    handleSlotClick,
    handleDisabledSlotClick,
    handleCancelarConfirmacao,
    handleConfirmarCriarExcecao,
    handleCardClick,
    handleAbrirComandaDireta,
    getAgendamentosDoProf,
    calcGeometry: (inicio: string, fim: string) => calcGeometry(inicio, fim, GRADE_INICIO, SLOT_MIN, 56),
  };
}

export type GradeHorariosController = ReturnType<typeof useGradeHorariosController>;
