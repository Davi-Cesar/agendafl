import { create } from 'zustand';
import type { Cliente } from '../schemas/cliente.schema';
import type { AbaClientes } from '../types/clientes.types';
import * as service from '../services/clientes.service';

interface ClientesStore {
  clientes: Cliente[];
  aniversariantes: Cliente[];
  totalClientes: number;
  totalAniversariantesCount: number;

  abaAtiva: AbaClientes;
  dataAniversariantes: string;
  busca: string;
  paginaAtual: number;
  itensPorPagina: number;

  carregando: boolean;
  salvando: boolean;
  erro: string | null;

  modalNovoAberto: boolean;
  modalPerfilAberto: boolean;
  modalExcluirAberto: boolean;
  clienteSelecionado: Cliente | null;
  clienteParaEditar: Cliente | null;

  setAbaAtiva: (aba: AbaClientes) => void;
  setBusca: (busca: string) => void;
  setDataAniversariantes: (dataStr: string) => void;
  setPaginaAtual: (pagina: number) => void;

  carregarClientes: () => Promise<void>;
  salvarCliente: (dados: Partial<Cliente>) => Promise<Cliente>;
  excluirCliente: (id: string) => Promise<void>;

  abrirModalNovo: (cliente?: Cliente | null) => void;
  abrirPerfilCliente: (cliente: Cliente) => void;
  abrirModalExcluir: (cliente?: Cliente | null) => void;
  fecharModais: () => void;
}

const hojeStr = new Date().toISOString().split('T')[0];

export const useClientesStore = create<ClientesStore>((set, get) => ({
  clientes: [],
  aniversariantes: [],
  totalClientes: 0,
  totalAniversariantesCount: 0,

  abaAtiva: 'todos',
  dataAniversariantes: hojeStr,
  busca: '',
  paginaAtual: 1,
  itensPorPagina: 10,

  carregando: false,
  salvando: false,
  erro: null,

  modalNovoAberto: false,
  modalPerfilAberto: false,
  modalExcluirAberto: false,
  clienteSelecionado: null,
  clienteParaEditar: null,

  setAbaAtiva: (aba) => {
    set({ abaAtiva: aba, paginaAtual: 1 });
    get().carregarClientes();
  },

  setBusca: (busca) => {
    set({ busca, paginaAtual: 1 });
    get().carregarClientes();
  },

  setDataAniversariantes: (dataStr) => {
    set({ dataAniversariantes: dataStr, paginaAtual: 1 });
    get().carregarClientes();
  },

  setPaginaAtual: (pagina) => {
    set({ paginaAtual: pagina });
    get().carregarClientes();
  },

  carregarClientes: async () => {
    set({ carregando: true, erro: null });
    try {
      const { busca, paginaAtual, itensPorPagina, dataAniversariantes } = get();
      
      const resGeral = await service.buscarClientes(busca, paginaAtual, itensPorPagina);
      const resAniv = await service.buscarAniversariantes(dataAniversariantes);

      set({
        clientes: resGeral.clientes,
        totalClientes: resGeral.total,
        aniversariantes: resAniv,
        totalAniversariantesCount: resAniv.length,
        carregando: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      set({ erro: message, carregando: false });
    }
  },

  salvarCliente: async (dados) => {
    set({ salvando: true, erro: null });
    try {
      const clienteSalvo = await service.salvarClienteNoSupabase(dados);
      set({ salvando: false });
      get().fecharModais();
      await get().carregarClientes();
      return clienteSalvo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar cliente';
      set({ erro: message, salvando: false });
      throw err;
    }
  },

  excluirCliente: async (id) => {
    set({ salvando: true, erro: null });
    try {
      await service.excluirClienteNoSupabase(id);
      set({ salvando: false, clienteSelecionado: null });
      get().fecharModais();
      await get().carregarClientes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir cliente';
      set({ erro: message, salvando: false });
    }
  },

  abrirModalNovo: (cliente = null) => {
    set({ modalNovoAberto: true, clienteParaEditar: cliente, modalPerfilAberto: false });
  },

  abrirPerfilCliente: (cliente) => {
    set({ modalPerfilAberto: true, clienteSelecionado: cliente });
  },

  abrirModalExcluir: (cliente = null) => {
    const target = cliente || get().clienteSelecionado;
    set({ modalExcluirAberto: true, clienteSelecionado: target });
  },

  fecharModais: () => {
    set({
      modalNovoAberto: false,
      modalPerfilAberto: false,
      modalExcluirAberto: false,
      clienteParaEditar: null,
    });
  },
}));
