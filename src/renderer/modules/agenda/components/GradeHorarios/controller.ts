import { useMemo, useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { gerarSlots, calcGeometry } from '@shared/lib/utils';
import type { Agendamento, Profissional } from '../../schemas/agendamento.schema';

const GRADE_INICIO = '08:00';
const GRADE_FIM = '19:00';
const SLOT_MIN = 30;

export function useGradeHorariosController() {
  const profissionais = useAgendaStore((s) => s.profissionais);
  const agendamentos = useAgendaStore((s) => s.agendamentos);
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

  const handleSlotClick = useCallback(
    (profissionalId: string, horario: string) => {
      abrirModalNovo({ profissionalId, horario });
    },
    [abrirModalNovo]
  );

  const handleCardClick = useCallback(
    (apt: Agendamento) => {
      selecionarAgendamento(apt);
    },
    [selecionarAgendamento]
  );

  const getAgendamentosDoProf = useCallback(
    (profId: string) => {
      return agendamentos.filter((a) => a.profissionalId === profId);
    },
    [agendamentos]
  );

  return {
    slots,
    profFiltrados,
    gradeAltura,
    handleSlotClick,
    handleCardClick,
    getAgendamentosDoProf,
    calcGeometry: (inicio: string, fim: string) => calcGeometry(inicio, fim, GRADE_INICIO, SLOT_MIN, 56),
  };
}

export type GradeHorariosController = ReturnType<typeof useGradeHorariosController>;
