import { create } from 'zustand';
import * as agendaService from '../services/agenda.service';
import type { AgendaStore } from '../types/agenda.types';
import type { Agendamento, CriarAgendamentoInput } from '../schemas/agendamento.schema';

export const useAgendaStore = create<AgendaStore>((set, get) => ({
  agendamentos: [],
  profissionais: [],
  dataSelecionada: new Date().toISOString().split('T')[0],
  filtroProfissional: '',
  carregando: false,
  erro: null,
  modalNovoAberto: false,
  modalNovoPrefill: null,
  agendamentoSelecionado: null,
  comandaAtivaView: null,

  setDataSelecionada: (dataStr: string) => {
    set({ dataSelecionada: dataStr });
    get().carregarAgenda();
  },

  setFiltroProfissional: (filtro: string) => {
    set({ filtroProfissional: filtro });
  },

  carregarAgenda: async () => {
    set({ carregando: true, erro: null });
    try {
      const [agendamentos, profissionais] = await Promise.all([
        agendaService.buscarAgendamentosDoDia(get().dataSelecionada),
        agendaService.buscarProfissionais(),
      ]);
      set({ agendamentos, profissionais, carregando: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do Supabase';
      set({ erro: message, carregando: false });
    }
  },

  criarAgendamento: async (input: CriarAgendamentoInput) => {
    set({ carregando: true, erro: null });
    try {
      await agendaService.salvarNovoAgendamento(input);
      await get().carregarAgenda();
      set({ modalNovoAberto: false, modalNovoPrefill: null, carregando: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar agendamento no Supabase';
      set({ erro: message, carregando: false });
      throw err;
    }
  },

  atualizarStatusAgendamento: async (id: string, novoStatus: Agendamento['status']) => {
    try {
      await agendaService.atualizarStatusAgendamentoNoSupabase(id, novoStatus);
      await get().carregarAgenda();
      set({ agendamentoSelecionado: null });
    } catch (err) {
      console.error('Erro ao atualizar status no Supabase:', err);
    }
  },

  cancelarAgendamento: async (id: string) => {
    try {
      await agendaService.excluirAgendamentoNoSupabase(id);
      await get().carregarAgenda();
      set({ agendamentoSelecionado: null });
    } catch (err) {
      console.error('Erro ao excluir no Supabase:', err);
    }
  },

  abrirModalNovo: (prefill) => {
    set({ modalNovoAberto: true, modalNovoPrefill: prefill || null });
  },

  fecharModalNovo: () => {
    set({ modalNovoAberto: false, modalNovoPrefill: null });
  },

  selecionarAgendamento: (agendamento) => {
    set({ agendamentoSelecionado: agendamento });
  },

  setComandaAtivaView: (view) => {
    set({ comandaAtivaView: view });
  },

  vincularComanda: (agendamentoId, comandaId, comandaNumero) => {
    set((state) => ({
      agendamentos: state.agendamentos.map((apt) => {
        if (apt.id === agendamentoId) {
          return {
            ...apt,
            comandaId,
            comandaNumero,
            comandaStatus: 'rascunho',
          };
        }
        return apt;
      }),
    }));
  },

  atualizarStatusComandaVinc: (agendamentoId, comandaStatus) => {
    set((state) => ({
      agendamentos: state.agendamentos.map((apt) => {
        if (apt.id === agendamentoId) {
          return { ...apt, comandaStatus };
        }
        return apt;
      }),
    }));
  },
}));
