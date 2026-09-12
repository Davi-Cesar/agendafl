import type { ComandaListItem, ComandaItem, FormaPagamentoTipo, ComandaPagamentoInput } from '../schemas/comanda.schema';

export interface ComandaAtivaViewState {
  tipo: 'criar' | 'detalhes';
  dados: any;
}

export interface ComandasStoreState {
  comandas: ComandaListItem[];
  filtroStatus: 'todas' | 'rascunho' | 'finalizada';
  busca: string;
  carregando: boolean;
  comandaAtivaView: ComandaAtivaViewState | null;
}

export interface ComandasStoreActions {
  setFiltroStatus: (status: 'todas' | 'rascunho' | 'finalizada') => void;
  setBusca: (busca: string) => void;
  carregarComandas: () => Promise<void>;
  setComandaAtivaView: (view: ComandaAtivaViewState | null) => void;
  adicionarOuAtualizarComanda: (item: ComandaListItem) => void;
  finalizarComanda: (dadosFinal: any) => Promise<{ comandaId: string; comandaNumero: string }>;
}

export type ComandasStore = ComandasStoreState & ComandasStoreActions;

export interface FormaPagamentoOption {
  id: FormaPagamentoTipo;
  label: string;
  iconType: 'pix' | 'card' | 'cash';
}

export const FORMAS_PAGAMENTO_OPTIONS: FormaPagamentoOption[] = [
  { id: 'pix_bricia', label: 'PIX BRICIA', iconType: 'pix' },
  { id: 'pix_flavia', label: 'PIX FLAVIA', iconType: 'pix' },
  { id: 'credito', label: 'CRÉDITO', iconType: 'card' },
  { id: 'debito', label: 'DÉBITO', iconType: 'card' },
  { id: 'dinheiro', label: 'DINHEIRO', iconType: 'cash' },
];
