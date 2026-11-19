import { create } from 'zustand';
import * as agendaService from '../services/agenda.service';
import type { AgendaStore } from '../types/agenda.types';
import type {
  Agendamento,
  CriarAgendamentoInput,
  AtualizarAgendamentoInput,
} from '../schemas/agendamento.schema';
import { eventBus } from '@shared/lib/events';
import { getDataHojeLocal } from '@shared/lib/formatters';
import {
  obterOrdemSalva,
  salvarOrdem,
  limparOrdemSalva,
  aplicarOrdemSalva,
} from '../utils/ordemProfissionais';

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
  movimentoAnimacao: null,
  comandaAtivaView: null,
  modalAlertaCaixaFechadoAberto: false,
  ordemPersonalizadaAtiva: obterOrdemSalva().length > 0,

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

      const ordemSalva = obterOrdemSalva();
      const profsOrdenados = aplicarOrdemSalva(profissionais, ordemSalva);

      set({
        agendamentos,
        profissionais: profsOrdenados,
        ordemPersonalizadaAtiva: ordemSalva.length > 0,
        horariosMap: horEex.horariosMap,
        excecoesMap: horEex.excecoesMap,
        carregando: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do Supabase';
      set({ erro: message, carregando: false });
    }
  },

  reordenarProfissionais: (origemId: string, destinoId: string, side: 'left' | 'right' = 'left') => {
    set((state) => {
      const lista = [...state.profissionais];
      const fromIdx = lista.findIndex((p) => p.id === origemId);
      if (fromIdx === -1) return state;

      const [item] = lista.splice(fromIdx, 1);
      let toIdx = lista.findIndex((p) => p.id === destinoId);

      if (toIdx === -1) {
        lista.push(item);
      } else {
        if (side === 'right') {
          toIdx += 1;
        }
        lista.splice(toIdx, 0, item);
      }

      const novaOrdem = lista.map((p) => p.id);
      salvarOrdem(novaOrdem);

      return {
        profissionais: lista,
        ordemPersonalizadaAtiva: true,
      };
    });
  },

  resetarOrdemProfissionais: () => {
    limparOrdemSalva();
    set((state) => {
      const lista = [...state.profissionais].sort((a, b) => a.nome.localeCompare(b.nome));
      return {
        profissionais: lista,
        ordemPersonalizadaAtiva: false,
      };
    });
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

  atualizarAgendamento: async (input: AtualizarAgendamentoInput) => {
    const anterior = get().agendamentos.find((a) => a.id === input.id);
    set({ carregando: true, erro: null });
    try {
      await agendaService.atualizarAgendamentoNoSupabase(input);
      await get().carregarAgenda();

      const mudouPosicao =
        anterior &&
        (anterior.profissionalId !== input.profissionalId ||
          anterior.horarioInicio !== input.horarioInicio);

      if (mudouPosicao && anterior) {
        const animTimestamp = Date.now();
        set({
          agendamentoSelecionado: null,
          carregando: false,
          movimentoAnimacao: {
            agendamentoId: input.id,
            origemProfissionalId: anterior.profissionalId,
            destinoProfissionalId: input.profissionalId,
            origemHorarioInicio: anterior.horarioInicio,
            origemHorarioFim: anterior.horarioFim,
            destinoHorarioInicio: input.horarioInicio,
            destinoHorarioFim: input.horarioFim,
            timestamp: animTimestamp,
          },
        });
        setTimeout(() => {
          const atual = get().movimentoAnimacao;
          if (atual && atual.timestamp === animTimestamp) {
            set({ movimentoAnimacao: null });
          }
        }, 1400);
      } else {
        set({ agendamentoSelecionado: null, carregando: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
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

  limparMovimentoAnimacao: () => {
    set({ movimentoAnimacao: null });
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
