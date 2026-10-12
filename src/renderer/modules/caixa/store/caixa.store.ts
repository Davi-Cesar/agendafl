import { create } from 'zustand';
import * as caixaService from '../services/caixa.service';
import type { CaixaStore, TotaisMeiosPagamento } from '../types/caixa.types';
import { eventBus } from '@shared/lib/events';

const TOTAIS_ZERADOS: TotaisMeiosPagamento = {
  fundoCaixa: 0,
  dinheiro: 0,
  dinheiroVariacaoStr: 'Caixa fechado',
  pixBricia: 0,
  pixBriciaQtd: 0,
  pixFlavia: 0,
  pixFlaviaQtd: 0,
  cartaoCredito: 0,
  cartaoDebito: 0,
};

export const useCaixaStore = create<CaixaStore>((set, get) => ({
  caixaAtivo: null,
  transacoes: [],
  comissoes: [],
  totaisMeios: TOTAIS_ZERADOS,
  totaisPix: [],
  historicoCaixas: [],
  caixaSelecionadoHistorico: null,
  abaAtiva: 'transacoes',
  carregando: false,
  erro: null,
  modalAbrirAberto: false,
  modalFecharAberto: false,
  modalRelatorioAberto: false,
  relatorioItens: [],

  setAbaAtiva: (aba) => {
    set({ abaAtiva: aba });
    if (aba === 'anteriores') {
      get().carregarHistorico();
    }
  },

  abrirModalAbrir: () => set({ modalAbrirAberto: true }),
  fecharModalAbrir: () => set({ modalAbrirAberto: false }),
  abrirModalFechar: () => set({ modalFecharAberto: true }),
  fecharModalFechar: () => set({ modalFecharAberto: false }),

  carregarCaixa: async () => {
    set({ carregando: true, erro: null });
    try {
      const caixa = await caixaService.buscarCaixaAtivo();
      if (!caixa) {
        set({
          caixaAtivo: null,
          transacoes: [],
          comissoes: [],
          totaisMeios: TOTAIS_ZERADOS,
          totaisPix: [],
          carregando: false,
        });
        return;
      }

      const { transacoes, comissoes, totais, totaisPix } = await caixaService.buscarDadosDoCaixa(caixa.id, caixa);
      set({
        caixaAtivo: caixa,
        transacoes,
        comissoes,
        totaisMeios: totais,
        totaisPix,
        carregando: false,
      });
    } catch (err: any) {
      console.error('Erro ao carregar caixa:', err);
      set({ carregando: false, erro: err?.message || 'Erro ao carregar dados do caixa' });
    }
  },

  abrirCaixa: async (saldoInicial: number) => {
    set({ carregando: true, erro: null });
    try {
      await caixaService.abrirCaixaNoSupabase(saldoInicial);
      await get().carregarCaixa();
      set({ modalAbrirAberto: false, carregando: false });
    } catch (err: any) {
      console.error('Erro ao abrir caixa:', err);
      set({ carregando: false, erro: err?.message || 'Erro ao abrir caixa' });
      throw err;
    }
  },

  fecharCaixa: async (observacoes?: string) => {
    const { caixaAtivo } = get();
    if (!caixaAtivo) return;

    set({ carregando: true, erro: null });
    try {
      // Chama a RPC fechar_caixa_atomico no Supabase
      // Ponto 1: Se a RPC falhar, lança erro para a UI (sem fallback client-side)
      await caixaService.fecharCaixaNoSupabase(caixaAtivo.id, observacoes);

      await get().carregarCaixa();
      await get().carregarHistorico();
      set({ modalFecharAberto: false, carregando: false });
    } catch (err: any) {
      console.error('Erro ao fechar caixa:', err);
      set({ carregando: false, erro: err?.message || 'Erro ao fechar caixa' });
      throw err;
    }
  },

  carregarHistorico: async () => {
    set({ carregando: true, erro: null });
    try {
      const list = await caixaService.buscarHistoricoCaixasFechados();
      set({ historicoCaixas: list, carregando: false });
    } catch (err: any) {
      console.error('Erro ao carregar histórico de caixas:', err);
      set({ carregando: false, erro: err?.message || 'Erro ao carregar histórico' });
    }
  },

  selecionarCaixaHistorico: async (caixaId: string | null) => {
    if (!caixaId) {
      set({ caixaSelecionadoHistorico: null });
      return;
    }

    set({ carregando: true, erro: null });
    try {
      const detalhes = await caixaService.buscarDetalhesCaixaFechado(caixaId);
      set({ caixaSelecionadoHistorico: detalhes, carregando: false });
    } catch (err: any) {
      console.error('Erro ao selecionar caixa do histórico:', err);
      set({ carregando: false, erro: err?.message || 'Erro ao carregar detalhes do caixa' });
    }
  },

  abrirModalRelatorio: async (targetCaixaId?: string) => {
    const idParaBuscar = targetCaixaId || get().caixaAtivo?.id || get().caixaSelecionadoHistorico?.caixa.id;
    if (!idParaBuscar) return;

    set({ carregando: true, modalRelatorioAberto: true });
    try {
      const itens = await caixaService.buscarExtratoDetalhadoCaixa(idParaBuscar);
      set({ relatorioItens: itens, carregando: false });
    } catch (err: any) {
      console.error('Erro ao abrir relatório detalhado:', err);
      set({ carregando: false, erro: err?.message || 'Erro ao gerar relatório detalhado' });
    }
  },

  fecharModalRelatorio: () => {
    set({ modalRelatorioAberto: false, relatorioItens: [] });
  },
}));

// Reatividade em Tempo Real: Atualiza dados do caixa quando uma comanda for finalizada
eventBus.on('comanda:finalizada', () => {
  const store = useCaixaStore.getState();
  store.carregarCaixa();
});
