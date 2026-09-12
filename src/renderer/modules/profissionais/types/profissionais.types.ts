import type { Profissional, ProfissionalHorario } from '../schemas/profissional.schema';

export interface ServicoOption {
  id: string;
  nome: string;
  duracaoMinutos?: number;
  precoPadrao?: number;
}

export interface ProfissionalDetalhado extends Profissional {
  servicos: ServicoOption[];
  horarios: ProfissionalHorario[];
}

export type FiltroStatusProfissional = 'todos' | 'ativo' | 'inativo';
