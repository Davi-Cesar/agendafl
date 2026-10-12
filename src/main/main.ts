import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente do .env
dotenv.config();

let mainWindow: BrowserWindow | null = null;

/**
 * Atualização OTA via electron-updater.
 * Os arquivos (latest.yml, instalador, .blockmap) ficam no bucket público
 * "updates" do Supabase Storage (ver bloco "build.publish" no package.json).
 */
function enviarParaRenderer(canal: string, payload?: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(canal, payload);
  }
}

function configurarAtualizador(): void {
  autoUpdater.autoDownload = true;
  // O usuário decide quando reiniciar (botão no banner). Se ignorar, instala ao fechar o app.
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => enviarParaRenderer('update:available', info.version));
  autoUpdater.on('download-progress', (p) => enviarParaRenderer('update:progress', Math.round(p.percent)));
  autoUpdater.on('update-downloaded', (info) => enviarParaRenderer('update:ready', info.version));
  autoUpdater.on('error', (err) => {
    // Falha de rede/servidor nunca deve derrubar o app: apenas registra e avisa a UI.
    console.error('[updater] erro:', err?.message ?? err);
    enviarParaRenderer('update:error', err?.message ?? 'Falha ao verificar atualizações');
  });

  // Em desenvolvimento (app não empacotado) não há o que atualizar.
  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[updater] checkForUpdates falhou:', err?.message ?? err);
    });
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'Agenda FL',
    icon: fs.existsSync(path.join(__dirname, '../../assets/icon.png'))
      ? path.join(__dirname, '../../assets/icon.png')
      : path.join(__dirname, '../renderer/assets/icon.png'),
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0e1a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('system:notify', (_event, payload: { title: string; body: string }) => {
  if (Notification.isSupported()) {
    new Notification({ title: payload.title, body: payload.body }).show();
    return true;
  }
  return false;
});

ipcMain.handle('system:get-env', () => {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',
  };
});

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());

// Reinicia o app e aplica a atualização já baixada.
ipcMain.on('update:install', () => autoUpdater.quitAndInstall());

app.whenReady().then(() => {
  createWindow();
  configurarAtualizador();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
