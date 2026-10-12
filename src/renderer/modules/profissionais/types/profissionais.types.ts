import type { Profissional, ProfissionalHorario } from '../schemas/profissional.schema';

export interface ServicoOption {
  id: string;
  nome: string;
  duracaoMinutos?: number;
  precoPadrao?: number;
  categoriaId?: string | null;
  categoriaNome?: string | null;
}

export interface ProfissionalDetalhado extends Profissional {
  servicos: ServicoOption[];
  horarios: ProfissionalHorario[];
}

export type FiltroStatusProfissional = 'todos' | 'ativo' | 'inativo';
