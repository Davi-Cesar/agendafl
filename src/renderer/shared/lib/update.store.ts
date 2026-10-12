import { create } from 'zustand';

export type UpdateStatus = 'idle' | 'available' | 'downloading' | 'ready' | 'error';

interface UpdateState {
  status: UpdateStatus;
  versao: string | null;
  percentual: number;
  erro: string | null;
  dispensado: boolean;
  dispensar: () => void;
  instalar: () => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
  status: 'idle',
  versao: null,
  percentual: 0,
  erro: null,
  dispensado: false,

  dispensar: () => set({ dispensado: true }),

  instalar: () => {
    window.electronAPI?.installUpdate();
  },
}));

let monitoramentoIniciado = false;

/**
 * Assina os eventos de atualização do processo main (electron-updater) UMA única vez,
 * no bootstrap do app. Fica fora de componentes para não depender de useEffect.
 * No navegador (sem Electron) não há `window.electronAPI`, então vira um no-op.
 */
export function iniciarMonitoramentoAtualizacao(): void {
  if (monitoramentoIniciado) return;

  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  if (!api?.onUpdateAvailable) return;
  monitoramentoIniciado = true;

  const { setState } = useUpdateStore;

  api.onUpdateAvailable((versao) =>
    setState({ status: 'downloading', versao, percentual: 0, erro: null, dispensado: false })
  );
  api.onUpdateProgress((percentual) => setState({ status: 'downloading', percentual }));
  api.onUpdateReady((versao) =>
    setState({ status: 'ready', versao, percentual: 100, erro: null, dispensado: false })
  );
  api.onUpdateError((erro) => {
    // Só sinaliza erro se estava no meio de um download; falha de checagem não incomoda a recepção.
    if (useUpdateStore.getState().status === 'downloading') {
      setState({ status: 'error', erro });
    }
  });
}
