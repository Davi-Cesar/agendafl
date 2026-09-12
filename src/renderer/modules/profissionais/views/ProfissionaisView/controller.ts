import { useEffect, useMemo } from 'react';
import { useProfissionaisStore } from '../../store/profissionais.store';

export function useProfissionaisViewController() {
  const profissionais = useProfissionaisStore((s) => s.profissionais);
  const profissionalSelecionadoId = useProfissionaisStore((s) => s.profissionalSelecionadoId);
  const servicosDoProfissional = useProfissionaisStore((s) => s.servicosDoProfissional);
  const horariosDoProfissional = useProfissionaisStore((s) => s.horariosDoProfissional);
  const busca = useProfissionaisStore((s) => s.busca);
  const carregando = useProfissionaisStore((s) => s.carregando);
  const salvandoHorarios = useProfissionaisStore((s) => s.salvandoHorarios);
  const horariosSalvosSucesso = useProfissionaisStore((s) => s.horariosSalvosSucesso);

  const setBusca = useProfissionaisStore((s) => s.setBusca);
  const setProfissionalSelecionadoId = useProfissionaisStore((s) => s.setProfissionalSelecionadoId);
  const setModalNovoAberto = useProfissionaisStore((s) => s.setModalNovoAberto);
  const setModalServicosAberto = useProfissionaisStore((s) => s.setModalServicosAberto);
  const setModalExcecaoAberto = useProfissionaisStore((s) => s.setModalExcecaoAberto);
  const carregarProfissionais = useProfissionaisStore((s) => s.carregarProfissionais);
  const toggleStatusProfissional = useProfissionaisStore((s) => s.toggleStatusProfissional);
  const excluirProfissional = useProfissionaisStore((s) => s.excluirProfissional);
  const atualizarHorarioSemanal = useProfissionaisStore((s) => s.atualizarHorarioSemanal);
  const salvarHorarios = useProfissionaisStore((s) => s.salvarHorarios);
  const replicarHorariosSemana = useProfissionaisStore((s) => s.replicarHorariosSemana);
  const removerExcecaoHorario = useProfissionaisStore((s) => s.removerExcecaoHorario);

  useEffect(() => {
    carregarProfissionais();
  }, [carregarProfissionais]);

  const profissionaisFiltrados = useMemo(() => {
    return profissionais.filter((p) => {
      if (!busca.trim()) return true;
      const b = busca.toLowerCase();
      return (
        p.nome.toLowerCase().includes(b) ||
        (p.especialidade && p.especialidade.toLowerCase().includes(b)) ||
        (p.cpf && p.cpf.includes(b))
      );
    });
  }, [profissionais, busca]);

  const profissionalAtual = useMemo(() => {
    return profissionais.find((p) => p.id === profissionalSelecionadoId) || null;
  }, [profissionais, profissionalSelecionadoId]);

  const diasSemanaNomes: Record<number, string> = {
    1: 'Seg',
    2: 'Ter',
    3: 'Qua',
    4: 'Qui',
    5: 'Sex',
    6: 'Sáb',
    0: 'Dom',
  };

  return {
    profissionais: profissionaisFiltrados,
    totalRegistrados: profissionais.length,
    profissionalAtual,
    servicosDoProfissional,
    horariosDoProfissional,
    diasSemanaNomes,
    busca,
    setBusca,
    carregando,
    salvandoHorarios,
    horariosSalvosSucesso,
    setProfissionalSelecionadoId,
    handleNovoProfissional: () => setModalNovoAberto(true, null),
    handleEditarProfissional: () => {
      if (profissionalAtual) setModalNovoAberto(true, profissionalAtual);
    },
    handleAbrirServicos: () => setModalServicosAberto(true),
    handleAbrirExcecao: (diaSemana: number) => setModalExcecaoAberto(true, diaSemana),
    removerExcecaoHorario,
    toggleStatusProfissional,
    excluirProfissional,
    atualizarHorarioSemanal,
    salvarHorarios,
    replicarHorariosSemana,
  };
}

export type ProfissionaisViewController = ReturnType<typeof useProfissionaisViewController>;
