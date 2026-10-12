import { useEffect, useMemo, useState } from 'react';
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
  const setModalExcluirAberto = useProfissionaisStore((s) => s.setModalExcluirAberto);

  const filtroStatus = useProfissionaisStore((s) => s.filtroStatus);
  const setFiltroStatus = useProfissionaisStore((s) => s.setFiltroStatus);
  const [filtroDias, setFiltroDias] = useState<'todos' | 'uteis' | 'fim_de_semana'>('todos');

  useEffect(() => {
    carregarProfissionais();
  }, [carregarProfissionais]);

  const profissionaisFiltrados = useMemo(() => {
    return profissionais.filter((p) => {
      if (filtroStatus !== 'todos' && p.status !== filtroStatus) return false;
      if (!busca.trim()) return true;
      const b = busca.toLowerCase();
      return (
        p.nome.toLowerCase().includes(b) ||
        (p.especialidade && p.especialidade.toLowerCase().includes(b)) ||
        (p.cpf && p.cpf.includes(b))
      );
    });
  }, [profissionais, busca, filtroStatus]);

  useEffect(() => {
    if (profissionaisFiltrados.length > 0) {
      const existe = profissionaisFiltrados.some((p) => p.id === profissionalSelecionadoId);
      if (!existe) {
        setProfissionalSelecionadoId(profissionaisFiltrados[0].id);
      }
    }
  }, [profissionaisFiltrados, profissionalSelecionadoId, setProfissionalSelecionadoId]);

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

  const diasSemanaInfo: Record<number, { sigla: string; nome: string; subtitulo: string; tipo: 'dia_util' | 'fim_de_semana' }> = {
    1: { sigla: 'SEG', nome: 'Segunda-feira', subtitulo: 'Dia Útil', tipo: 'dia_util' },
    2: { sigla: 'TER', nome: 'Terça-feira', subtitulo: 'Dia Útil', tipo: 'dia_util' },
    3: { sigla: 'QUA', nome: 'Quarta-feira', subtitulo: 'Dia Útil', tipo: 'dia_util' },
    4: { sigla: 'QUI', nome: 'Quinta-feira', subtitulo: 'Dia Útil', tipo: 'dia_util' },
    5: { sigla: 'SEX', nome: 'Sexta-feira', subtitulo: 'Dia Útil', tipo: 'dia_util' },
    6: { sigla: 'SÁB', nome: 'Sábado', subtitulo: 'Fim de Semana', tipo: 'fim_de_semana' },
    0: { sigla: 'DOM', nome: 'Domingo', subtitulo: 'Fim de Semana', tipo: 'fim_de_semana' },
  };

  const diasExibidos = useMemo(() => {
    if (filtroDias === 'uteis') return [1, 2, 3, 4, 5];
    if (filtroDias === 'fim_de_semana') return [6, 0];
    return [1, 2, 3, 4, 5, 6, 0];
  }, [filtroDias]);

  const categoriasDoProfissional = useMemo(() => {
    const mapa = new Map<string, { nome: string; totalServicos: number }>();
    for (const s of servicosDoProfissional) {
      const nome = s.categoriaNome || 'Geral';
      const item = mapa.get(nome) || { nome, totalServicos: 0 };
      item.totalServicos += 1;
      mapa.set(nome, item);
    }
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [servicosDoProfissional]);

  return {
    profissionais: profissionaisFiltrados,
    totalRegistrados: profissionais.length,
    profissionalAtual,
    servicosDoProfissional,
    categoriasDoProfissional,
    horariosDoProfissional,
    diasSemanaNomes,
    diasSemanaInfo,
    filtroStatus,
    setFiltroStatus,
    diasExibidos,
    filtroDias,
    setFiltroDias,
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
    handleAbrirModalExcluir: (profissional: any) => {
      if (profissional) setModalExcluirAberto(true, profissional);
    },
    atualizarHorarioSemanal,
    salvarHorarios,
    replicarHorariosSemana,
  };
}

export type ProfissionaisViewController = ReturnType<typeof useProfissionaisViewController>;
