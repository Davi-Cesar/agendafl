import type { ElectronAPI } from '../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

class App {
  private navItems: NodeListOf<HTMLButtonElement>;

  constructor() {
    this.navItems = document.querySelectorAll<HTMLButtonElement>('.nav-item');
    this.init();
  }

  private init(): void {
    this.setupWindowControls();
    this.setupNavigation();
  }

  private setupWindowControls(): void {
    const api = window.electronAPI;
    if (!api) return;

    document.getElementById('btn-minimize')?.addEventListener('click', () => api.minimizeWindow());
    document.getElementById('btn-maximize')?.addEventListener('click', () => api.maximizeWindow());
    document.getElementById('btn-close')?.addEventListener('click', () => api.closeWindow());
  }

  private setupNavigation(): void {
    this.navItems.forEach((item) => {
      item.addEventListener('click', () => {
        this.navItems.forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
        const route = item.dataset.route ?? '/agenda';
        console.log(`Navigating to: ${route}`);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
