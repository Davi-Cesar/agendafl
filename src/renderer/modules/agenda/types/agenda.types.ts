import type { Agendamento, Profissional, CriarAgendamentoInput } from '../schemas/agendamento.schema';

export interface AgendaStoreState {
  agendamentos: Agendamento[];
  profissionais: Profissional[];
  dataSelecionada: string;
  filtroProfissional: string;
  carregando: boolean;
  erro: string | null;
  modalNovoAberto: boolean;
  modalNovoPrefill: { profissionalId?: string; horario?: string; data?: string } | null;
  agendamentoSelecionado: Agendamento | null;
  comandaAtivaView: {
    tipo: 'criar' | 'detalhes';
    dados: any;
  } | null;
}

export interface AgendaStoreActions {
  setDataSelecionada: (data: string) => void;
  setFiltroProfissional: (filtro: string) => void;
  carregarAgenda: () => Promise<void>;
  criarAgendamento: (input: CriarAgendamentoInput) => Promise<void>;
  atualizarStatusAgendamento: (id: string, novoStatus: Agendamento['status']) => Promise<void>;
  cancelarAgendamento: (id: string) => Promise<void>;
  abrirModalNovo: (prefill?: { profissionalId?: string; horario?: string; data?: string }) => void;
  fecharModalNovo: () => void;
  selecionarAgendamento: (agendamento: Agendamento | null) => void;
  setComandaAtivaView: (view: { tipo: 'criar' | 'detalhes'; dados: any } | null) => void;
  vincularComanda: (agendamentoId: string, comandaId: string, comandaNumero: string) => void;
  atualizarStatusComandaVinc: (agendamentoId: string, comandaStatus: 'rascunho' | 'finalizada' | 'cancelada') => void;
}

export type AgendaStore = AgendaStoreState & AgendaStoreActions;
