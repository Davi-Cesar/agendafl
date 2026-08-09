import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  sendNotification: (payload: { title: string; body: string }) => Promise<boolean>;
  getEnv: () => Promise<{ SUPABASE_URL: string; SUPABASE_ANON_KEY: string }>;
}

const api: ElectronAPI = {
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  sendNotification: (payload) => ipcRenderer.invoke('system:notify', payload),
  getEnv: () => ipcRenderer.invoke('system:get-env'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
