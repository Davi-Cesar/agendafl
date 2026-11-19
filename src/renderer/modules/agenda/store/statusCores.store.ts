import { create } from 'zustand';

export interface StatusCorConfig {
  id: string;
  label: string;
  cor: string;
  fixo?: boolean;
}

const STORAGE_KEY = 'fl_agenda_status_cores_v1';

export const CORES_PRESET: string[] = [
  '#3b82f6', // Azul
  '#e9c340', // Dourado
  '#10b981', // Verde Esmeralda
  '#ef4444', // Vermelho
  '#a855f7', // Roxo
  '#ec4899', // Rosa
  '#f97316', // Laranja
  '#06b6d4', // Ciano
  '#14b8a6', // Turquesa
  '#84cc16', // Lima
];

export const STATUS_PADRAO: StatusCorConfig[] = [
  { id: 'agendado', label: 'Agendado', cor: '#3b82f6', fixo: true },
  { id: 'em_atendimento', label: 'Em Atendimento', cor: '#e9c340', fixo: true },
  { id: 'concluido', label: 'Concluído', cor: '#10b981', fixo: true },
  { id: 'faltou', label: 'Faltou', cor: '#ef4444', fixo: true },
];

export function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || '#3b82f6').replace('#', '').trim();
  if (clean.length !== 6) {
    return `rgba(59, 130, 246, ${alpha})`;
  }
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function carregarStatusSalvos(): StatusCorConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return STATUS_PADRAO;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return STATUS_PADRAO;

    // Garante que os 4 status padrão sempre existam (com a cor personalizada salva)
    const mapaSalvo = new Map<string, StatusCorConfig>();
    parsed.forEach((item: any) => {
      if (item && typeof item.id === 'string' && typeof item.cor === 'string') {
        mapaSalvo.set(item.id, {
          id: item.id,
          label: String(item.label || item.id),
          cor: item.cor,
          fixo: Boolean(item.fixo),
        });
      }
    });

    const base: StatusCorConfig[] = STATUS_PADRAO.map((padrao) => {
      const salvo = mapaSalvo.get(padrao.id);
      return salvo
        ? { ...padrao, cor: salvo.cor, label: salvo.label || padrao.label, fixo: true }
        : padrao;
    });

    const extras: StatusCorConfig[] = [];
    mapaSalvo.forEach((val, key) => {
      if (!STATUS_PADRAO.some((p) => p.id === key)) {
        extras.push({ ...val, fixo: false });
      }
    });

    return [...base, ...extras];
  } catch {
    return STATUS_PADRAO;
  }
}

function salvarStatusNoStorage(lista: StatusCorConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // ignore storage errors
  }
}

function gerarSlugStatus(label: string): string {
  const base = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base || `status_${Date.now()}`;
}

interface StatusCoresState {
  statusList: StatusCorConfig[];
  modalAberto: boolean;
  abrirModal: () => void;
  fecharModal: () => void;
  alterarCorStatus: (id: string, novaCor: string) => void;
  adicionarStatus: (label: string, cor: string) => void;
  removerStatus: (id: string) => void;
  restaurarPadrao: () => void;
  getStatusConfig: (id: string) => StatusCorConfig;
}

export const useStatusCoresStore = create<StatusCoresState>((set, get) => ({
  statusList: carregarStatusSalvos(),
  modalAberto: false,

  abrirModal: () => set({ modalAberto: true }),
  fecharModal: () => set({ modalAberto: false }),

  alterarCorStatus: (id: string, novaCor: string) => {
    const atualizada = get().statusList.map((item) =>
      item.id === id ? { ...item, cor: novaCor } : item
    );
    salvarStatusNoStorage(atualizada);
    set({ statusList: atualizada });
  },

  adicionarStatus: (label: string, cor: string) => {
    const nomeLimpo = label.trim();
    if (!nomeLimpo) return;

    const listaAtual = get().statusList;
    let id = gerarSlugStatus(nomeLimpo);
    if (listaAtual.some((s) => s.id === id)) {
      id = `${id}_${Date.now().toString().slice(-4)}`;
    }

    const novaLista: StatusCorConfig[] = [
      ...listaAtual,
      {
        id,
        label: nomeLimpo,
        cor: cor || '#a855f7',
        fixo: false,
      },
    ];
    salvarStatusNoStorage(novaLista);
    set({ statusList: novaLista });
  },

  removerStatus: (id: string) => {
    const novaLista = get().statusList.filter((item) => item.fixo || item.id !== id);
    salvarStatusNoStorage(novaLista);
    set({ statusList: novaLista });
  },

  restaurarPadrao: () => {
    salvarStatusNoStorage(STATUS_PADRAO);
    set({ statusList: STATUS_PADRAO });
  },

  getStatusConfig: (id: string) => {
    const found = get().statusList.find((item) => item.id === id);
    if (found) return found;
    return STATUS_PADRAO[0];
  },
}));
