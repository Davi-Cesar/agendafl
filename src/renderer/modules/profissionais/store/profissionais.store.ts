import { create } from 'zustand';
import type { Profissional, ProfissionalHorario, ExcecaoHorario, TipoExcecaoHorario } from '../schemas/profissional.schema';
import type { ServicoOption, FiltroStatusProfissional } from '../types/profissionais.types';
import * as service from '../services/profissionais.service';
import { eventBus } from '@shared/lib/events';

export interface ModalExcecaoConfig {
  aberto: boolean;
  profissionalId?: string | null;
  profissionalNome?: string | null;
  diaSemana?: number | null;
  dataStr?: string | null;
  inicio?: string | null;
  fim?: string | null;
  tipo?: TipoExcecaoHorario | null;
  tipoTravado?: boolean;
  onSalvarSuccess?: (dataStr: string, inicio: string, fim: string) => void;
}

interface ProfissionaisStore {
  profissionais: Profissional[];
  profissionalSelecionadoId: string | null;
  servicosDoProfissional: ServicoOption[];
  horariosDoProfissional: ProfissionalHorario[];
  todosServicos: ServicoOption[];
  categorias: { id: string; nome: string }[];

  filtroStatus: FiltroStatusProfissional;
  busca: string;
  carregando: boolean;
  salvandoHorarios: boolean;
  horariosSalvosSucesso: boolean;
  erroHorarios: string | null;

  modalNovoAberto: boolean;
  modalServicosAberto: boolean;
  modalExcecaoAberto: boolean;
  modalExcluirAberto: boolean;
  profissionalParaExcluir: Profissional | null;
  salvandoExclusao: boolean;
  diaExcecaoSelecionado: number | null;
  modalExcecaoConfig: ModalExcecaoConfig;
  profissionalParaEditar: Profissional | null;

  setFiltroStatus: (filtro: FiltroStatusProfissional) => void;
  setBusca: (busca: string) => void;
  setProfissionalSelecionadoId: (id: string) => void;
  setModalNovoAberto: (aberto: boolean, profissional?: Profissional | null) => void;
  setModalServicosAberto: (aberto: boolean) => void;
  setModalExcecaoAberto: (aberto: boolean, diaSemana?: number | null) => void;
  setModalExcecaoConfig: (config: Partial<ModalExcecaoConfig>) => void;
  setModalExcluirAberto: (aberto: boolean, profissional?: Profissional | null) => void;
  confirmarExclusaoProfissional: () => Promise<void>;

  carregarProfissionais: () => Promise<void>;
  carregarDetalhesProfissional: (id: string) => Promise<void>;
  salvarProfissional: (dados: Partial<Profissional>, servicoIds?: string[]) => Promise<Profissional>;
  toggleStatusProfissional: (id: string) => Promise<void>;
  excluirProfissional: (id: string) => Promise<void>;

  atualizarHorarioSemanal: (diaSemana: number, campo: keyof ProfissionalHorario, valor: any) => void;
  salvarHorarios: () => Promise<void>;
  replicarHorariosSemana: (diaOrigemSemana: number) => void;
  salvarServicos: (servicoIds: string[]) => Promise<void>;

  adicionarExcecaoHorario: (diaSemana: number, data: string, inicio: string, fim: string, tipo: TipoExcecaoHorario, motivo?: string) => void;
  adicionarExcecaoDireta: (profissionalId: string, data: string, inicio: string, fim: string, tipo: TipoExcecaoHorario, motivo?: string) => Promise<ExcecaoHorario>;
  removerExcecaoHorario: (diaSemana: number, excecaoId: string) => void;
}

export const useProfissionaisStore = create<ProfissionaisStore>((set, get) => ({
  profissionais: [],
  profissionalSelecionadoId: null,
  servicosDoProfissional: [],
  horariosDoProfissional: [],
  todosServicos: [],
  categorias: [],

  filtroStatus: 'ativo',
  busca: '',
  carregando: false,
  salvandoHorarios: false,
  horariosSalvosSucesso: false,
  erroHorarios: null,

  modalNovoAberto: false,
  modalServicosAberto: false,
  modalExcecaoAberto: false,
  modalExcluirAberto: false,
  profissionalParaExcluir: null,
  salvandoExclusao: false,
  diaExcecaoSelecionado: null,
  modalExcecaoConfig: { aberto: false },
  profissionalParaEditar: null,

  setFiltroStatus: (filtro) => set({ filtroStatus: filtro }),
  setBusca: (busca) => set({ busca }),

  setProfissionalSelecionadoId: (id) => {
    set({ profissionalSelecionadoId: id, horariosSalvosSucesso: false, erroHorarios: null });
    get().carregarDetalhesProfissional(id);
  },

  setModalNovoAberto: (aberto, profissional = null) => {
    set({ modalNovoAberto: aberto, profissionalParaEditar: profissional });
  },

  setModalServicosAberto: (aberto) => set({ modalServicosAberto: aberto }),
  setModalExcecaoAberto: (aberto, diaSemana = null) => {
    set({
      modalExcecaoAberto: aberto,
      diaExcecaoSelecionado: diaSemana,
      modalExcecaoConfig: { aberto, diaSemana, tipoTravado: false },
    });
  },
  setModalExcecaoConfig: (config) => {
    set((state) => ({
      modalExcecaoAberto: config.aberto ?? state.modalExcecaoConfig.aberto ?? false,
      modalExcecaoConfig: { ...state.modalExcecaoConfig, ...config },
    }));
  },

  setModalExcluirAberto: (aberto, profissional = null) => {
    set({ modalExcluirAberto: aberto, profissionalParaExcluir: profissional });
  },

  confirmarExclusaoProfissional: async () => {
    const prof = get().profissionalParaExcluir;
    if (!prof) return;
    set({ salvandoExclusao: true });
    try {
      await get().excluirProfissional(prof.id);
      set({ modalExcluirAberto: false, profissionalParaExcluir: null, salvandoExclusao: false });
    } catch (err) {
      set({ salvandoExclusao: false });
      throw err;
    }
  },

  carregarProfissionais: async () => {
    set({ carregando: true });
    try {
      const [lista, todosServ, cats] = await Promise.all([
        service.buscarProfissionais(),
        service.buscarTodosServicos(),
        service.buscarCategoriasServicos(),
      ]);
      
      set({ profissionais: lista, todosServicos: todosServ, categorias: cats, carregando: false });

      const atualId = get().profissionalSelecionadoId;
      const existeAtual = lista.some((p) => p.id === atualId);
      if (!existeAtual) {
        const novoId = lista[0]?.id || null;
        set({ profissionalSelecionadoId: novoId });
        if (novoId) {
          get().carregarDetalhesProfissional(novoId);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
      set({ carregando: false });
    }
  },

  carregarDetalhesProfissional: async (id: string) => {
    try {
      const [servicos, horarios] = await Promise.all([
        service.buscarServicosDoProfissional(id),
        service.buscarHorariosDoProfissional(id),
      ]);
      set({ servicosDoProfissional: servicos, horariosDoProfissional: horarios });
    } catch (err) {
      console.error('Erro ao carregar detalhes do profissional:', err);
    }
  },

  salvarProfissional: async (dados, servicoIds) => {
    const salvo = await service.salvarProfissionalNoSupabase(dados);
    if (servicoIds !== undefined) {
      await service.salvarServicosDoProfissional(salvo.id, servicoIds);
    }
    // Para novo profissional cadastrado, inicializar grade semanal padrão
    if (!dados.id) {
      const todosDias = [0, 1, 2, 3, 4, 5, 6];
      const horariosPadrao = todosDias.map((d) => ({
        profissionalId: salvo.id,
        diaSemana: d,
        ativo: d !== 0,
        manhaInicio: d === 0 ? '' : '08:00',
        manhaFim: d === 0 ? '' : '11:00',
        tardeInicio: d === 0 ? '' : '13:30',
        tardeFim: d === 0 ? '' : '17:00',
        intervaloAlmoco: d === 0 ? '' : '11:00 - 13:30',
        excecoes: [],
      }));
      try {
        await service.salvarHorariosDoProfissional(salvo.id, horariosPadrao);
      } catch (e) {
        console.warn('Falha ao inicializar horários padrão do novo profissional:', e);
      }
    }
    await get().carregarProfissionais();
    set({ profissionalSelecionadoId: salvo.id });
    await get().carregarDetalhesProfissional(salvo.id);
    return salvo;
  },

  toggleStatusProfissional: async (id) => {
    const prof = get().profissionais.find((p) => p.id === id);
    if (!prof) return;
    const novoStatus = prof.status === 'ativo' ? 'inativo' : 'ativo';
    
    set((state) => ({
      profissionais: state.profissionais.map((p) => (p.id === id ? { ...p, status: novoStatus } : p)),
    }));

    try {
      await service.alterarStatusProfissional(id, novoStatus);
      eventBus.emit('profissionais:horarios_atualizados', { id });
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      await get().carregarProfissionais();
    }
  },

  excluirProfissional: async (id) => {
    try {
      await service.excluirProfissionalNoSupabase(id);
      set((state) => {
        const restantes = state.profissionais.filter((p) => p.id !== id);
        const novoSelecionadoId =
          state.profissionalSelecionadoId === id
            ? (restantes[0]?.id || null)
            : state.profissionalSelecionadoId;

        return {
          profissionais: restantes,
          profissionalSelecionadoId: novoSelecionadoId,
        };
      });
      const selId = get().profissionalSelecionadoId;
      if (selId) {
        get().carregarDetalhesProfissional(selId);
      }
      eventBus.emit('profissionais:horarios_atualizados', { id });
    } catch (err) {
      console.error('Erro ao remover profissional:', err);
      throw err;
    }
  },

  atualizarHorarioSemanal: (diaSemana, campo, valor) => {
    set((state) => {
      let lista = state.horariosDoProfissional;
      if (!lista || lista.length === 0 || !lista.some((h) => h.diaSemana === diaSemana)) {
        const todosDias = [0, 1, 2, 3, 4, 5, 6];
        lista = todosDias.map((d) => {
          const item = (state.horariosDoProfissional || []).find((x) => x.diaSemana === d);
          if (item) return item;
          const isDom = d === 0;
          return {
            profissionalId: state.profissionalSelecionadoId || '',
            diaSemana: d,
            ativo: !isDom,
            manhaInicio: isDom ? '' : '08:00',
            manhaFim: isDom ? '' : '11:00',
            tardeInicio: isDom ? '' : '13:30',
            tardeFim: isDom ? '' : '17:00',
            intervaloAlmoco: isDom ? '' : '11:00 - 13:30',
            excecoes: [],
          };
        });
      }

      return {
        horariosDoProfissional: lista.map((h) => {
          if (h.diaSemana !== diaSemana) return h;
          const updated = { ...h, [campo]: valor };
          updated.intervaloAlmoco = `${updated.manhaFim || '11:00'} - ${updated.tardeInicio || '13:30'}`;
          return updated;
        }),
        horariosSalvosSucesso: false,
        erroHorarios: null,
      };
    });
  },

  salvarHorarios: async () => {
    const profId = get().profissionalSelecionadoId;
    if (!profId) return;
    set({ salvandoHorarios: true, horariosSalvosSucesso: false, erroHorarios: null });
    try {
      let lista = get().horariosDoProfissional;
      if (!lista || lista.length === 0) {
        const todosDias = [0, 1, 2, 3, 4, 5, 6];
        lista = todosDias.map((d) => ({
          profissionalId: profId,
          diaSemana: d,
          ativo: d !== 0,
          manhaInicio: d === 0 ? '' : '08:00',
          manhaFim: d === 0 ? '' : '11:00',
          tardeInicio: d === 0 ? '' : '13:30',
          tardeFim: d === 0 ? '' : '17:00',
          intervaloAlmoco: d === 0 ? '' : '11:00 - 13:30',
          excecoes: [],
        }));
      }
      await service.salvarHorariosDoProfissional(profId, lista);
      set({ salvandoHorarios: false, horariosSalvosSucesso: true, erroHorarios: null });

      // Emitir evento para a Agenda atualizar imediatamente
      eventBus.emit('profissionais:horarios_atualizados', { profissionalId: profId });

      setTimeout(() => {
        set({ horariosSalvosSucesso: false });
      }, 3500);
    } catch (err: any) {
      console.error('Erro ao salvar horários:', err);
      const msg = err instanceof Error ? err.message : 'Falha ao salvar horários no Supabase';
      set({ salvandoHorarios: false, erroHorarios: msg });
      setTimeout(() => {
        set({ erroHorarios: null });
      }, 6000);
    }
  },

  replicarHorariosSemana: (diaOrigemSemana) => {
    const modelo = get().horariosDoProfissional.find((h) => h.diaSemana === diaOrigemSemana);
    if (!modelo) return;

    set((state) => ({
      horariosDoProfissional: state.horariosDoProfissional.map((h) => ({
        ...h,
        ativo: modelo.ativo,
        manhaInicio: modelo.manhaInicio,
        manhaFim: modelo.manhaFim,
        tardeInicio: modelo.tardeInicio,
        tardeFim: modelo.tardeFim,
        intervaloAlmoco: `${modelo.manhaFim || '11:00'} - ${modelo.tardeInicio || '13:30'}`,
      })),
      horariosSalvosSucesso: false,
      erroHorarios: null,
    }));

    get().salvarHorarios();
  },

  salvarServicos: async (servicoIds) => {
    const profId = get().profissionalSelecionadoId;
    if (!profId) return;
    await service.salvarServicosDoProfissional(profId, servicoIds);
    await get().carregarDetalhesProfissional(profId);
    eventBus.emit('profissionais:horarios_atualizados', { profissionalId: profId });
  },

  adicionarExcecaoHorario: (diaSemana, data, inicio, fim, tipo = 'bloqueio', motivo = '') => {
    const novaExcecao: ExcecaoHorario = {
      id: Math.random().toString(36).substring(2, 9),
      data,
      inicio,
      fim,
      tipo,
      motivo: motivo || (tipo === 'bloqueio' || tipo === 'indisponibilidade' ? 'Não Trabalho / Folga' : 'Atendimento Extra'),
    };

    set((state) => ({
      horariosDoProfissional: state.horariosDoProfissional.map((h) => {
        if (h.diaSemana === diaSemana) {
          const listaAtual = h.excecoes || [];
          return { ...h, excecoes: [...listaAtual, novaExcecao] };
        }
        return h;
      }),
      horariosSalvosSucesso: false,
    }));

    get().salvarHorarios();
  },

  adicionarExcecaoDireta: async (profissionalId, data, inicio, fim, tipo = 'atendimento_extra', motivo = '') => {
    const novaExcecao = await service.adicionarExcecaoDiretaNoSupabase(profissionalId, {
      data,
      inicio,
      fim,
      tipo,
      motivo,
    });

    if (get().profissionalSelecionadoId === profissionalId) {
      const partes = data.split('-');
      let diaNum = 0;
      if (partes.length === 3) {
        diaNum = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])).getDay();
      }
      set((state) => ({
        horariosDoProfissional: state.horariosDoProfissional.map((h) => {
          if (h.diaSemana === diaNum) {
            return { ...h, excecoes: [...(h.excecoes || []), novaExcecao] };
          }
          return h;
        }),
      }));
    }

    eventBus.emit('profissionais:horarios_atualizados', { profissionalId });
    return novaExcecao;
  },

  removerExcecaoHorario: (diaSemana, excecaoId) => {
    set((state) => ({
      horariosDoProfissional: state.horariosDoProfissional.map((h) => {
        if (h.diaSemana === diaSemana && h.excecoes) {
          return { ...h, excecoes: h.excecoes.filter((e) => e.id !== excecaoId) };
        }
        return h;
      }),
      horariosSalvosSucesso: false,
    }));

    get().salvarHorarios();
  },
}));
