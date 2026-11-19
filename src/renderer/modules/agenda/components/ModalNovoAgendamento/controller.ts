import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { CriarAgendamentoDTO, type CriarAgendamentoInput, type ServicoItem } from '../../schemas/agendamento.schema';
import * as agendaService from '../../services/agenda.service';
import { calcularHorarioFim } from '@shared/lib/utils';

function parseTimeToMins(tStr: string): number {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function useModalNovoAgendamentoController() {
  const aberto = useAgendaStore((s) => s.modalNovoAberto);
  const prefill = useAgendaStore((s) => s.modalNovoPrefill);
  const profissionais = useAgendaStore((s) => s.profissionais);
  const horariosMap = useAgendaStore((s) => s.horariosMap);
  const excecoesMap = useAgendaStore((s) => s.excecoesMap);
  const dataSelecionada = useAgendaStore((s) => s.dataSelecionada);
  const fecharModal = useAgendaStore((s) => s.fecharModalNovo);
  const criarAgendamento = useAgendaStore((s) => s.criarAgendamento);
  const carregando = useAgendaStore((s) => s.carregando);

  const [clienteNome, setClienteNome] = useState('');
  const [servico, setServico] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [data, setData] = useState(dataSelecionada);
  const [horarioInicio, setHorarioInicio] = useState('09:00');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [servicosList, setServicosList] = useState<ServicoItem[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [clientesList, setClientesList] = useState<Array<{ id: string; nome: string; telefone: string }>>([]);
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const servicosReqIdRef = useRef(0);

  const carregarServicosDoProfissional = useCallback(async (profId: string, manterSeExistir?: string) => {
    const reqId = ++servicosReqIdRef.current;
    if (!profId) {
      setServicosList([]);
      setServico('');
      setCarregandoServicos(false);
      return;
    }

    setCarregandoServicos(true);
    try {
      const list = await agendaService.buscarServicosPorProfissional(profId);
      if (servicosReqIdRef.current !== reqId) return;

      setServicosList(list);
      if (list.length === 0) {
        setServico('');
      } else if (manterSeExistir && list.some((s) => s.nome === manterSeExistir)) {
        setServico(manterSeExistir);
      } else {
        setServico(list[0].nome);
      }
    } finally {
      if (servicosReqIdRef.current === reqId) {
        setCarregandoServicos(false);
      }
    }
  }, []);

  useEffect(() => {
    if (aberto) {
      const profInicial = prefill?.profissionalId || (profissionais[0]?.id ?? '');
      setClienteNome('');
      setServico('');
      setServicosList([]);
      setObservacoes('');
      setErro(null);
      setProfissionalId(profInicial);
      setHorarioInicio(prefill?.horario || '09:00');
      setData(prefill?.data || dataSelecionada);

      // Carrega apenas serviços vinculados ao profissional selecionado e clientes ativos
      carregarServicosDoProfissional(profInicial);
      agendaService.buscarClientes().then(setClientesList);
    }
  }, [aberto, prefill, profissionais, dataSelecionada, carregarServicosDoProfissional]);

  const handleProfissionalChange = useCallback(
    (novoProfId: string) => {
      setProfissionalId(novoProfId);
      carregarServicosDoProfissional(novoProfId, servico);
    },
    [carregarServicosDoProfissional, servico]
  );

  // Verifica se o profissional atende normalmente no horário e data selecionados
  const isHorarioExcecao = useMemo(() => {
    if (!profissionalId || !data || !horarioInicio) return false;
    const partes = data.split('-');
    const diaSemana =
      partes.length === 3
        ? new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])).getDay()
        : 1;

    const profHorarios = horariosMap[profissionalId] || [];
    const profExcecoes = excecoesMap[profissionalId] || [];
    const hDia = profHorarios.find((h: any) => h.diaSemana === diaSemana);
    const isDiaAtivo = hDia ? Boolean(hDia.ativo) : diaSemana !== 0;

    const slotMin = parseTimeToMins(horarioInicio);
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

    const excecoesData = profExcecoes.filter((e: any) => e.data === data);
    let isBloqueadoOuExtra = false;
    excecoesData.forEach((exc: any) => {
      const incM = parseTimeToMins(exc.inicio);
      const fimM = parseTimeToMins(exc.fim);
      if (slotMin >= incM && slotMin < fimM) {
        isBloqueadoOuExtra = true;
      }
    });

    return !atendePadrao || isBloqueadoOuExtra;
  }, [profissionalId, data, horarioInicio, horariosMap, excecoesMap]);

  const matchesAutocomplete = clientesList.filter(
    (c) =>
      clienteNome.trim() &&
      (c.nome.toLowerCase().includes(clienteNome.toLowerCase()) || c.telefone.includes(clienteNome))
  );

  const handleSelectCliente = useCallback((nome: string) => {
    setClienteNome(nome);
    setAutocompleteVisible(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErro(null);

      const servicoObj = servicosList.find((s) => s.nome === servico);
      const duracao = servicoObj ? servicoObj.duracaoMinutos : 60;
      const horarioFim = calcularHorarioFim(horarioInicio, duracao);

      const inputRaw: CriarAgendamentoInput = {
        clienteNome,
        servico,
        profissionalId,
        data,
        horarioInicio,
        horarioFim,
        observacoes,
      };

      try {
        const valid = CriarAgendamentoDTO.parse(inputRaw);
        await criarAgendamento(valid);
      } catch (err: any) {
        if (err.errors && err.errors.length > 0) {
          setErro(err.errors[0].message);
        } else {
          setErro(err instanceof Error ? err.message : 'Erro ao validar formulário');
        }
      }
    },
    [clienteNome, servico, profissionalId, data, horarioInicio, observacoes, servicosList, criarAgendamento]
  );

  return {
    aberto,
    profissionais,
    servicosList,
    carregandoServicos,
    clienteNome,
    setClienteNome,
    servico,
    setServico,
    profissionalId,
    setProfissionalId,
    handleProfissionalChange,
    data,
    setData,
    horarioInicio,
    setHorarioInicio,
    isHorarioExcecao,
    observacoes,
    setObservacoes,
    erro,
    carregando,
    autocompleteVisible,
    setAutocompleteVisible,
    matchesAutocomplete,
    handleSelectCliente,
    handleSubmit,
    fecharModal,
  };
}

export type ModalNovoAgendamentoController = ReturnType<typeof useModalNovoAgendamentoController>;
