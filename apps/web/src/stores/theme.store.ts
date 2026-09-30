import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type Lang = 'id' | 'en';

const THEME_KEY = 'bt_theme';
const LANG_KEY = 'bt_lang';

function detectInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function detectInitialLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'id' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'id';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

interface UIState {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  setLang: (lang: Lang) => void;
  init: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  lang: 'id',

  init: () => {
    const theme = detectInitialTheme();
    const lang = detectInitialLang();
    applyTheme(theme);
    set({ theme, lang });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },

  setLang: (lang) => {
    localStorage.setItem(LANG_KEY, lang);
    set({ lang });
  },
}));