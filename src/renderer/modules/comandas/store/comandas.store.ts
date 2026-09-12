import { create } from 'zustand';
import * as comandasService from '../services/comandas.service';
import type { ComandasStore } from '../types/comandas.types';
import type { ComandaListItem } from '../schemas/comanda.schema';
import { eventBus } from '@shared/lib/events';

export const useComandasStore = create<ComandasStore>((set, get) => ({
  comandas: [],
  filtroStatus: 'todas',
  busca: '',
  carregando: false,
  comandaAtivaView: null,

  setFiltroStatus: (status) => set({ filtroStatus: status }),
  setBusca: (busca) => set({ busca }),
  setComandaAtivaView: (view) => set({ comandaAtivaView: view }),

  carregarComandas: async () => {
    set({ carregando: true });
    try {
      const list = await comandasService.buscarComandas();
      set((state) => {
        const listMap = new Map<string, ComandaListItem>();
        list.forEach((item) => listMap.set(item.comandaId, item));

        // Preserve locally finalized or created items if Supabase doesn't return them yet
        state.comandas.forEach((item) => {
          if (!listMap.has(item.comandaId) || item.comandaStatus === 'finalizada') {
            listMap.set(item.comandaId, item);
          }
        });

        return { comandas: Array.from(listMap.values()), carregando: false };
      });
    } catch (err) {
      console.error('Erro ao carregar comandas:', err);
      set({ carregando: false });
    }
  },

  adicionarOuAtualizarComanda: (item: ComandaListItem) => {
    set((state) => {
      const exist = state.comandas.some((c) => c.comandaId === item.comandaId);
      if (exist) {
        return {
          comandas: state.comandas.map((c) => (c.comandaId === item.comandaId ? item : c)),
        };
      }
      return {
        comandas: [item, ...state.comandas],
      };
    });
  },

  finalizarComanda: async (dadosFinal: any) => {
    let finalComandaId = dadosFinal.comandaId;
    let finalComandaNumero = dadosFinal.comandaNumero;

    try {
      const res = await comandasService.finalizarComandaNoSupabase({
        agendamentoId: dadosFinal.agendamentoId,
        clienteId: dadosFinal.clienteId,
        clienteNome: dadosFinal.clienteNome,
        subtotal: Number(dadosFinal.subtotal || 0),
        desconto: Number(dadosFinal.desconto || 0),
        valorTotal: Number(dadosFinal.valorTotal ?? dadosFinal.valor ?? 0),
        itens: dadosFinal.itens,
        pagamentos: dadosFinal.pagamentos,
      });

      finalComandaId = res.comandaId;
      finalComandaNumero = res.comandaNumero;
    } catch (err) {
      console.error('Erro ao salvar finalização no Supabase:', err);
    }

    const itemAtualizado: ComandaListItem = {
      agendamentoId: dadosFinal.agendamentoId || '',
      clienteNome: dadosFinal.clienteNome || 'Cliente',
      comandaId: finalComandaId,
      comandaNumero: finalComandaNumero || `#${Math.floor(1000 + Math.random() * 9000)}`,
      comandaStatus: 'finalizada',
      horarioInicio: dadosFinal.horarioInicio || '08:00',
      horarioFim: dadosFinal.horarioFim || '09:00',
      valor: Number(dadosFinal.valorTotal ?? dadosFinal.valor ?? 0),
      profissionalNome: dadosFinal.profissionalNome || 'Profissional',
      servico: dadosFinal.servico || 'Atendimento',
    };

    get().adicionarOuAtualizarComanda(itemAtualizado);

    eventBus.emit('comanda:finalizada', {
      comandaId: finalComandaId,
      agendamentoId: dadosFinal.agendamentoId,
    });

    return { comandaId: finalComandaId, comandaNumero: finalComandaNumero };
  },
}));
