import { create } from 'zustand';
import * as agendaService from '../services/agenda.service';
import type { AgendaStore } from '../types/agenda.types';
import type { Agendamento, CriarAgendamentoInput } from '../schemas/agendamento.schema';
import { eventBus } from '@shared/lib/events';
import { getDataHojeLocal } from '@shared/lib/formatters';

export const useAgendaStore = create<AgendaStore>((set, get) => ({
  agendamentos: [],
  profissionais: [],
  horariosMap: {},
  excecoesMap: {},
  dataSelecionada: getDataHojeLocal(),
  filtroProfissional: '',
  carregando: false,
  erro: null,
  modalNovoAberto: false,
  modalNovoPrefill: null,
  agendamentoSelecionado: null,
  comandaAtivaView: null,
  modalAlertaCaixaFechadoAberto: false,

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
      const dataSel = get().dataSelecionada;
      const [agendamentos, profissionais, horEex] = await Promise.all([
        agendaService.buscarAgendamentosDoDia(dataSel),
        agendaService.buscarProfissionais(dataSel),
        agendaService.buscarHorariosEExcecoesDosProfissionais(),
      ]);
      set({
        agendamentos,
        profissionais,
        horariosMap: horEex.horariosMap,
        excecoesMap: horEex.excecoesMap,
        carregando: false,
      });
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

  abrirAlertaCaixaFechado: () => {
    set({ modalAlertaCaixaFechadoAberto: true });
  },

  fecharAlertaCaixaFechado: () => {
    set({ modalAlertaCaixaFechadoAberto: false });
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
          return {
            ...apt,
            comandaStatus,
            status: comandaStatus === 'finalizada' ? 'concluido' : apt.status,
          };
        }
        return apt;
      }),
    }));
  },
}));

// Escutar eventos de atualização de horários de profissionais para recarregar a agenda
eventBus.on('profissionais:horarios_atualizados', () => {
  useAgendaStore.getState().carregarAgenda();
});
