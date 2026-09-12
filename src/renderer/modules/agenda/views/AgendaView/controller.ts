import { useEffect, useMemo, useCallback, useState } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { useCaixaStore } from '@modules/caixa';
import { formatDate } from '@shared/lib/utils';

export function useAgendaViewController() {
  const dataSelecionada = useAgendaStore((s) => s.dataSelecionada);
  const filtroProfissional = useAgendaStore((s) => s.filtroProfissional);
  const setFiltroProfissional = useAgendaStore((s) => s.setFiltroProfissional);
  const abrirModalNovo = useAgendaStore((s) => s.abrirModalNovo);
  const comandaAtivaView = useAgendaStore((s) => s.comandaAtivaView);
  const carregarAgenda = useAgendaStore((s) => s.carregarAgenda);
  const carregando = useAgendaStore((s) => s.carregando);

  // Integração com o Módulo de Caixa (Reatividade Global)
  const caixaAtivo = useCaixaStore((s) => s.caixaAtivo);
  const carregarCaixa = useCaixaStore((s) => s.carregarCaixa);
  const abrirModalAbrir = useCaixaStore((s) => s.abrirModalAbrir);
  const modalAbrirCaixaAberto = useCaixaStore((s) => s.modalAbrirAberto);

  const modalAlertaCaixaFechadoAberto = useAgendaStore((s) => s.modalAlertaCaixaFechadoAberto);
  const abrirAlertaCaixaFechado = useAgendaStore((s) => s.abrirAlertaCaixaFechado);
  const fecharAlertaCaixaFechado = useAgendaStore((s) => s.fecharAlertaCaixaFechado);

  const isCaixaAberto = Boolean(caixaAtivo);

  useEffect(() => {
    carregarAgenda();
    carregarCaixa();
  }, [carregarAgenda, carregarCaixa, dataSelecionada]);

  const dataFormatada = useMemo(() => {
    const raw = formatDate(dataSelecionada);
    if (!raw) return '';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [dataSelecionada]);

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFiltroProfissional(e.target.value);
    },
    [setFiltroProfissional]
  );

  const abrirModalNovoComValidacao = useCallback(
    (payload?: { profissionalId?: string; horario?: string }) => {
      if (!isCaixaAberto) {
        abrirAlertaCaixaFechado();
        return;
      }
      abrirModalNovo(payload);
    },
    [isCaixaAberto, abrirModalNovo, abrirAlertaCaixaFechado]
  );

  const fecharAlertaCaixa = useCallback(() => {
    fecharAlertaCaixaFechado();
  }, [fecharAlertaCaixaFechado]);

  const handleAbrirCaixaNoAlerta = useCallback(() => {
    fecharAlertaCaixaFechado();
    abrirModalAbrir();
  }, [fecharAlertaCaixaFechado, abrirModalAbrir]);

  return {
    dataFormatada,
    filtroProfissional,
    handleSearchInput,
    abrirModalNovo: abrirModalNovoComValidacao,
    comandaAtivaView,
    carregando,
    isCaixaAberto,
    modalAlertaCaixaFechadoAberto,
    fecharAlertaCaixa,
    handleAbrirCaixaNoAlerta,
    modalAbrirCaixaAberto,
  };
}

export type AgendaViewController = ReturnType<typeof useAgendaViewController>;
