import { contextBridge, ipcRenderer } from 'electron';

/** Função que cancela a assinatura de um evento do updater. */
export type Unsubscribe = () => void;

export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  sendNotification: (payload: { title: string; body: string }) => Promise<boolean>;
  getEnv: () => Promise<{ SUPABASE_URL: string; SUPABASE_ANON_KEY: string }>;
  onUpdateAvailable: (cb: (versao: string) => void) => Unsubscribe;
  onUpdateProgress: (cb: (percentual: number) => void) => Unsubscribe;
  onUpdateReady: (cb: (versao: string) => void) => Unsubscribe;
  onUpdateError: (cb: (mensagem: string) => void) => Unsubscribe;
  installUpdate: () => void;
}

/** Assina um canal IPC e devolve a função para cancelar a assinatura. */
function assinar<T>(canal: string, cb: (valor: T) => void): Unsubscribe {
  const listener = (_event: Electron.IpcRendererEvent, valor: T) => cb(valor);
  ipcRenderer.on(canal, listener);
  return () => ipcRenderer.removeListener(canal, listener);
}

const api: ElectronAPI = {
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  sendNotification: (payload) => ipcRenderer.invoke('system:notify', payload),
  getEnv: () => ipcRenderer.invoke('system:get-env'),
  onUpdateAvailable: (cb) => assinar<string>('update:available', cb),
  onUpdateProgress: (cb) => assinar<number>('update:progress', cb),
  onUpdateReady: (cb) => assinar<string>('update:ready', cb),
  onUpdateError: (cb) => assinar<string>('update:error', cb),
  installUpdate: () => ipcRenderer.send('update:install'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
