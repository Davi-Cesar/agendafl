import type {
  Agendamento,
  Profissional,
  CriarAgendamentoInput,
  AtualizarAgendamentoInput,
} from '../schemas/agendamento.schema';

export interface MovimentoAgendamentoAnimacao {
  agendamentoId: string;
  origemProfissionalId: string;
  destinoProfissionalId: string;
  origemHorarioInicio: string;
  origemHorarioFim: string;
  destinoHorarioInicio: string;
  destinoHorarioFim: string;
  timestamp: number;
}

export interface AgendaStoreState {
  agendamentos: Agendamento[];
  profissionais: Profissional[];
  horariosMap: Record<string, any[]>;
  excecoesMap: Record<string, any[]>;
  dataSelecionada: string;
  filtroProfissional: string;
  carregando: boolean;
  erro: string | null;
  modalNovoAberto: boolean;
  modalNovoPrefill: { profissionalId?: string; horario?: string; data?: string } | null;
  agendamentoSelecionado: Agendamento | null;
  movimentoAnimacao: MovimentoAgendamentoAnimacao | null;
  comandaAtivaView: {
    tipo: 'criar' | 'detalhes';
    dados: any;
  } | null;
  modalAlertaCaixaFechadoAberto: boolean;
  ordemPersonalizadaAtiva: boolean;
}

export interface AgendaStoreActions {
  setDataSelecionada: (data: string) => void;
  setFiltroProfissional: (filtro: string) => void;
  carregarAgenda: () => Promise<void>;
  reordenarProfissionais: (origemId: string, destinoId: string, side?: 'left' | 'right') => void;
  resetarOrdemProfissionais: () => void;
  criarAgendamento: (input: CriarAgendamentoInput) => Promise<void>;
  atualizarAgendamento: (input: AtualizarAgendamentoInput) => Promise<void>;
  atualizarStatusAgendamento: (id: string, novoStatus: Agendamento['status']) => Promise<void>;
  cancelarAgendamento: (id: string) => Promise<void>;
  abrirModalNovo: (prefill?: { profissionalId?: string; horario?: string; data?: string }) => void;
  fecharModalNovo: () => void;
  abrirAlertaCaixaFechado: () => void;
  fecharAlertaCaixaFechado: () => void;
  selecionarAgendamento: (agendamento: Agendamento | null) => void;
  limparMovimentoAnimacao: () => void;
  setComandaAtivaView: (view: { tipo: 'criar' | 'detalhes'; dados: any } | null) => void;
  vincularComanda: (agendamentoId: string, comandaId: string, comandaNumero: string) => void;
  atualizarStatusComandaVinc: (agendamentoId: string, comandaStatus: 'rascunho' | 'finalizada' | 'cancelada') => void;
}

export type AgendaStore = AgendaStoreState & AgendaStoreActions;
