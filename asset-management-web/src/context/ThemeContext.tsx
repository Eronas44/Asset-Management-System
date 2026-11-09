import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export type ThemePalette = {
  bg: string;
  card: string;
  border: string;
  primaryText: string;
  accentBrand: string; // Electric Blue (#2563EB) in Light, Sky Cyan (#38BDF8) in Dark
  semanticEmerald: string; // Vault / Available / QR
  semanticAmber: string; // Borrowed / Maintenance
  semanticRose: string; // Overdue / Retired
};

export const THEME_PALETTES: Record<Theme, ThemePalette> = {
  light: {
    bg: '#F4F3EF', // Warm Alabaster
    card: '#FFFFFF', // Crisp White
    border: '#E2E0D8', // 1px solid Alabaster Border
    primaryText: '#0F172A', // Deep Slate
    accentBrand: '#2563EB', // Professional Electric Blue
    semanticEmerald: '#10B981', // Emerald
    semanticAmber: '#F59E0B', // Amber
    semanticRose: '#F43F5E', // Rose
  },
  dark: {
    bg: '#090D16', // Deep Obsidian
    card: 'rgba(17, 24, 39, 0.8)', // #111827/80
    border: 'rgba(255, 255, 255, 0.1)', // border-white/10
    primaryText: '#F8FAFC',
    accentBrand: '#38BDF8', // Sky Cyan
    semanticEmerald: '#34D399', // Cyber Mint
    semanticAmber: '#F59E0B', // Amber
    semanticRose: '#F43F5E', // Rose
  },
};

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  palette: ThemePalette;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';

    setTheme(initialTheme);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    window.localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);

    // Update browser theme-color meta tag for seamless status bar tinting
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#090D16' : '#F4F3EF');
  }, [theme, initialized]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const palette = THEME_PALETTES[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, palette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
