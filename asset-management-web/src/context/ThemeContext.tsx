import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export type ThemePalette = {
  bg: string;
  card: string;
  border: string;
  primaryText: string;
  deepPetrol: string; // #2B4C6F (Headings)
  estateNavy: string; // #1E3A5F (Primary Solid Containers & Brand)
  marigold: string;   // #F4B752 (Warm Accent & Indicators)
  accentBrand: string; // #1E3A5F / #F4B752 for compatibility
  semanticEmerald: string; // Available / Safe
  semanticAmber: string;   // Borrowed / Warning
  semanticRose: string;    // Overdue / Danger
};

export const THEME_PALETTES: Record<Theme, ThemePalette> = {
  light: {
    bg: '#FAF7F2',          // Warm Cream
    card: '#FFFFFF',        // Crisp White
    border: '#E6E1D6',      // Warm Stone 1px border
    primaryText: '#334155', // Charcoal Body
    deepPetrol: '#2B4C6F',  // Deep Petrol Slate
    estateNavy: '#1E3A5F',  // Estate Navy
    marigold: '#F4B752',    // Marigold / Warm Ochre
    accentBrand: '#1E3A5F',
    semanticEmerald: '#10B981',
    semanticAmber: '#D97706',
    semanticRose: '#E11D48',
  },
  dark: {
    bg: '#111822',          // Warm Deep Navy-Charcoal
    card: '#1A2433',        // Solid Slate-Navy
    border: '#2A374A',      // Slate-Navy Border
    primaryText: '#FAF7F2', // Warm Cream Text
    deepPetrol: '#93C5FD',  // Lightened Petrol for contrast
    estateNavy: '#1E3A5F',  // Estate Navy
    marigold: '#F4B752',    // Marigold Accent
    accentBrand: '#F4B752',
    semanticEmerald: '#10B981',
    semanticAmber: '#F59E0B',
    semanticRose: '#F43F5E',
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

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#111822' : '#FAF7F2');
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
