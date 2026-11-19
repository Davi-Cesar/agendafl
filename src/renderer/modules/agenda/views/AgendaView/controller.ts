import { useEffect, useMemo, useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { useStatusCoresStore } from '../../store/statusCores.store';
import { useCaixaStore } from '@modules/caixa';
import { formatDate } from '@shared/lib/utils';
import { getDataHojeLocal } from '@shared/lib/formatters';

function deslocarDataIso(dataStr: string, dias: number): string {
  const partes = dataStr.split('-');
  if (partes.length !== 3) return dataStr;
  const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  d.setDate(d.getDate() + dias);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function useAgendaViewController() {
  const dataSelecionada = useAgendaStore((s) => s.dataSelecionada);
  const setDataSelecionada = useAgendaStore((s) => s.setDataSelecionada);
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
  const ordemPersonalizadaAtiva = useAgendaStore((s) => s.ordemPersonalizadaAtiva);
  const resetarOrdemProfissionais = useAgendaStore((s) => s.resetarOrdemProfissionais);
  const statusList = useStatusCoresStore((s) => s.statusList);
  const abrirModalStatusCores = useStatusCoresStore((s) => s.abrirModal);

  const isCaixaAberto = Boolean(caixaAtivo);
  const hojeStr = getDataHojeLocal();
  const isHoje = dataSelecionada <= hojeStr;
  const hojeDate = useMemo(() => {
    const partes = hojeStr.split('-');
    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  }, [hojeStr]);

  useEffect(() => {
    carregarAgenda();
    carregarCaixa();
  }, [carregarAgenda, carregarCaixa, dataSelecionada]);

  const dataFormatada = useMemo(() => {
    const raw = formatDate(dataSelecionada);
    if (!raw) return '';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [dataSelecionada]);

  const handleDiaAnterior = useCallback(() => {
    const anterior = deslocarDataIso(dataSelecionada, -1);
    const hoje = getDataHojeLocal();
    if (anterior < hoje) return;
    setDataSelecionada(anterior);
  }, [dataSelecionada, setDataSelecionada]);

  const handleProximoDia = useCallback(() => {
    setDataSelecionada(deslocarDataIso(dataSelecionada, 1));
  }, [dataSelecionada, setDataSelecionada]);

  const handleIrParaHoje = useCallback(() => {
    setDataSelecionada(getDataHojeLocal());
  }, [setDataSelecionada]);

  const handleSelecionarData = useCallback(
    (novaData: string) => {
      if (!novaData) return;
      const hoje = getDataHojeLocal();
      if (novaData < hoje) return;
      setDataSelecionada(novaData);
    },
    [setDataSelecionada]
  );

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
    dataSelecionada,
    dataFormatada,
    isHoje,
    hojeDate,
    handleDiaAnterior,
    handleProximoDia,
    handleIrParaHoje,
    handleSelecionarData,
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
    ordemPersonalizadaAtiva,
    resetarOrdemProfissionais,
    statusList,
    abrirModalStatusCores,
  };
}

export type AgendaViewController = ReturnType<typeof useAgendaViewController>;
