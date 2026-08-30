import type { ComandaListItem } from '../schemas/comanda.schema';

export interface ComandasStoreState {
  comandas: ComandaListItem[];
  filtroStatus: 'todas' | 'rascunho' | 'finalizada';
  busca: string;
  carregando: boolean;
}

export interface ComandasStoreActions {
  setFiltroStatus: (status: 'todas' | 'rascunho' | 'finalizada') => void;
  setBusca: (busca: string) => void;
  carregarComandas: () => Promise<void>;
}

export type ComandasStore = ComandasStoreState & ComandasStoreActions;
