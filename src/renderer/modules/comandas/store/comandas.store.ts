import { create } from 'zustand';
import * as comandasService from '../services/comandas.service';
import type { ComandasStore } from '../types/comandas.types';

export const useComandasStore = create<ComandasStore>((set) => ({
  comandas: [],
  filtroStatus: 'todas',
  busca: '',
  carregando: false,

  setFiltroStatus: (status) => set({ filtroStatus: status }),
  setBusca: (busca) => set({ busca }),
  carregarComandas: async () => {
    set({ carregando: true });
    try {
      const list = await comandasService.buscarComandas();
      set({ comandas: list, carregando: false });
    } catch (err) {
      console.error('Erro ao carregar comandas:', err);
      set({ carregando: false });
    }
  },
}));
