import type { Servico, CategoriaServico, CriarServicoDTO } from '../schemas/servico.schema';

export type { Servico, CategoriaServico, CriarServicoDTO };

export interface ProfissionalResumo {
  id: string;
  nome: string;
}

export interface ServicosState {
  servicos: Servico[];
  categorias: CategoriaServico[];
  profissionaisDisponiveis: ProfissionalResumo[];
  totalServicos: number;

  busca: string;
  categoriaIdFiltro: string | null;
  paginaAtual: number;
  itensPorPagina: number;

  carregando: boolean;
  salvando: boolean;
  erro: string | null;

  modalNovoAberto: boolean;
  modalExcluirAberto: boolean;
  servicoParaEditar: Servico | null;
  servicoParaExcluir: Servico | null;
}
