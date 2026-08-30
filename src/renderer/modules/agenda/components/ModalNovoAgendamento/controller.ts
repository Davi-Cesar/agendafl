import { useState, useEffect, useCallback } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { CriarAgendamentoDTO, type CriarAgendamentoInput, type ServicoItem } from '../../schemas/agendamento.schema';
import * as agendaService from '../../services/agenda.service';
import { calcularHorarioFim } from '@shared/lib/utils';

export function useModalNovoAgendamentoController() {
  const aberto = useAgendaStore((s) => s.modalNovoAberto);
  const prefill = useAgendaStore((s) => s.modalNovoPrefill);
  const profissionais = useAgendaStore((s) => s.profissionais);
  const fecharModal = useAgendaStore((s) => s.fecharModalNovo);
  const criarAgendamento = useAgendaStore((s) => s.criarAgendamento);
  const carregando = useAgendaStore((s) => s.carregando);

  const [clienteNome, setClienteNome] = useState('');
  const [servico, setServico] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horarioInicio, setHorarioInicio] = useState('09:00');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [servicosList, setServicosList] = useState<ServicoItem[]>([]);
  const [clientesList, setClientesList] = useState<Array<{ id: string; nome: string; telefone: string }>>([]);
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);

  useEffect(() => {
    if (aberto) {
      setClienteNome('');
      setServico('');
      setObservacoes('');
      setErro(null);
      setProfissionalId(prefill?.profissionalId || (profissionais[0]?.id ?? ''));
      setHorarioInicio(prefill?.horario || '09:00');
      setData(prefill?.data || new Date().toISOString().split('T')[0]);

      // Carrega serviços e clientes do Supabase
      agendaService.buscarServicos().then((list) => {
        setServicosList(list);
        if (list.length > 0) setServico(list[0].nome);
      });
      agendaService.buscarClientes().then(setClientesList);
    }
  }, [aberto, prefill, profissionais]);

  const matchesAutocomplete = clientesList.filter(
    (c) => clienteNome.trim() && (c.nome.toLowerCase().includes(clienteNome.toLowerCase()) || c.telefone.includes(clienteNome))
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
    clienteNome,
    setClienteNome,
    servico,
    setServico,
    profissionalId,
    setProfissionalId,
    data,
    setData,
    horarioInicio,
    setHorarioInicio,
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
