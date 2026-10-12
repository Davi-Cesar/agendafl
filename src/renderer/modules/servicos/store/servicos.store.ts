import { create } from 'zustand';
import type { Servico, CategoriaServico, CriarServicoDTO } from '../schemas/servico.schema';
import type { ProfissionalResumo, ServicosState } from '../types/servicos.types';
import * as service from '../services/servicos.service';

interface ServicosStoreActions {
  setBusca: (busca: string) => void;
  setCategoriaIdFiltro: (categoriaId: string | null) => void;
  setPaginaAtual: (pagina: number) => void;
  setItensPorPagina: (itens: number) => void;

  carregarServicos: () => Promise<void>;
  carregarCategorias: () => Promise<void>;
  carregarProfissionaisDisponiveis: () => Promise<void>;
  criarCategoria: (nome: string) => Promise<CategoriaServico>;

  salvarServico: (dados: CriarServicoDTO) => Promise<Servico>;
  excluirServico: (id: string) => Promise<void>;

  abrirModalNovo: (servico?: Servico | null) => void;
  abrirModalExcluir: (servico: Servico) => void;
  fecharModais: () => void;
}

export type UseServicosStore = ServicosState & ServicosStoreActions;

export const useServicosStore = create<UseServicosStore>((set, get) => ({
  servicos: [],
  categorias: [],
  profissionaisDisponiveis: [],
  totalServicos: 0,

  busca: '',
  categoriaIdFiltro: null,
  paginaAtual: 1,
  itensPorPagina: 15,

  carregando: false,
  salvando: false,
  erro: null,

  modalNovoAberto: false,
  modalExcluirAberto: false,
  servicoParaEditar: null,
  servicoParaExcluir: null,

  setBusca: (busca) => {
    set({ busca, paginaAtual: 1 });
    get().carregarServicos();
  },

  setCategoriaIdFiltro: (categoriaId) => {
    set({ categoriaIdFiltro: categoriaId, paginaAtual: 1 });
    get().carregarServicos();
  },

  setPaginaAtual: (pagina) => {
    set({ paginaAtual: pagina });
    get().carregarServicos();
  },

  setItensPorPagina: (itens) => {
    set({ itensPorPagina: itens, paginaAtual: 1 });
    get().carregarServicos();
  },

  carregarServicos: async () => {
    set({ carregando: true, erro: null });
    try {
      const { busca, categoriaIdFiltro, paginaAtual, itensPorPagina } = get();
      const res = await service.buscarServicos(busca, categoriaIdFiltro, paginaAtual, itensPorPagina);
      set({
        servicos: res.servicos,
        totalServicos: res.total,
        carregando: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar serviços';
      set({ erro: message, carregando: false });
    }
  },

  carregarCategorias: async () => {
    try {
      const cats = await service.buscarCategorias();
      set({ categorias: cats });
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  },

  criarCategoria: async (nome) => {
    try {
      const novaCat = await service.criarCategoria(nome);
      await get().carregarCategorias();
      return novaCat;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar categoria';
      set({ erro: message });
      throw err;
    }
  },

  carregarProfissionaisDisponiveis: async () => {
    try {
      const profs = await service.buscarProfissionaisDisponiveis();
      set({ profissionaisDisponiveis: profs });
    } catch (err) {
      console.error('Erro ao carregar profissionais disponíveis:', err);
    }
  },

  salvarServico: async (dados) => {
    set({ salvando: true, erro: null });
    try {
      const servicoSalvo = await service.salvarServicoNoSupabase(dados);
      set({ salvando: false });
      get().fecharModais();
      await get().carregarServicos();
      return servicoSalvo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar serviço';
      set({ erro: message, salvando: false });
      throw err;
    }
  },

  excluirServico: async (id) => {
    set({ salvando: true, erro: null });
    try {
      await service.excluirServicoNoSupabase(id);
      set({ salvando: false, servicoParaExcluir: null });
      get().fecharModais();
      await get().carregarServicos();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir serviço';
      set({ erro: message, salvando: false });
    }
  },

  abrirModalNovo: (servico = null) => {
    get().carregarCategorias();
    get().carregarProfissionaisDisponiveis();
    set({ modalNovoAberto: true, servicoParaEditar: servico });
  },

  abrirModalExcluir: (servico) => {
    set({ modalExcluirAberto: true, servicoParaExcluir: servico });
  },

  fecharModais: () => {
    set({
      modalNovoAberto: false,
      modalExcluirAberto: false,
      servicoParaEditar: null,
      servicoParaExcluir: null,
      erro: null,
    });
  },
}));
