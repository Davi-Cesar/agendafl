import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'fl_agenda_theme_mode';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'light' ? 'light' : 'dark';
}

function applyThemeToDOM(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('theme-light');
  } else {
    root.classList.remove('theme-light');
  }
}

interface ThemeStore {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(STORAGE_KEY, next);
    applyThemeToDOM(next);
    set({ theme: next });
  },
  setTheme: (theme: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    applyThemeToDOM(theme);
    set({ theme });
  },
}));
