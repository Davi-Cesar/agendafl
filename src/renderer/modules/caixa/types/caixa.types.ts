import type {
  Caixa,
  TransacaoCaixa,
  ComissaoProfissional,
  CaixaTotalPix,
  RelatorioDetalhadoItem,
} from '../schemas/caixa.schema';

export type AbaCaixa = 'transacoes' | 'comissoes' | 'anteriores';

export interface TotaisMeiosPagamento {
  fundoCaixa: number;
  dinheiro: number;
  dinheiroVariacaoStr: string;
  pixBricia: number;
  pixBriciaQtd: number;
  pixFlavia: number;
  pixFlaviaQtd: number;
  cartaoCredito: number;
  cartaoDebito: number;
}

export interface DetalhesCaixaFechado {
  caixa: Caixa;
  transacoes: TransacaoCaixa[];
  comissoes: ComissaoProfissional[];
  totaisPix: CaixaTotalPix[];
}

export interface CaixaStoreState {
  caixaAtivo: Caixa | null;
  transacoes: TransacaoCaixa[];
  comissoes: ComissaoProfissional[];
  totaisMeios: TotaisMeiosPagamento;
  totaisPix: CaixaTotalPix[];
  historicoCaixas: Caixa[];
  caixaSelecionadoHistorico: DetalhesCaixaFechado | null;
  abaAtiva: AbaCaixa;
  carregando: boolean;
  erro: string | null;
  modalAbrirAberto: boolean;
  modalFecharAberto: boolean;
  modalRelatorioAberto: boolean;
  relatorioItens: RelatorioDetalhadoItem[];
}

export interface CaixaStoreActions {
  carregarCaixa: () => Promise<void>;
  abrirCaixa: (saldoInicial: number) => Promise<void>;
  fecharCaixa: (observacoes?: string) => Promise<void>;
  carregarHistorico: () => Promise<void>;
  selecionarCaixaHistorico: (caixaId: string | null) => Promise<void>;
  setAbaAtiva: (aba: AbaCaixa) => void;
  abrirModalAbrir: () => void;
  fecharModalAbrir: () => void;
  abrirModalFechar: () => void;
  fecharModalFechar: () => void;
  abrirModalRelatorio: (caixaId?: string) => Promise<void>;
  fecharModalRelatorio: () => void;
}

export type CaixaStore = CaixaStoreState & CaixaStoreActions;
