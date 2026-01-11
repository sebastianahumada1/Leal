import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores Principales - Compatibilidad con código existente
        primary: '#C5B48F', // Crema Orgánico / Kraft - Base
        'forest-green': '#14533D',
        'background-light': '#f7f7f6',
        'background-dark': '#14533D',
        'card-bg': 'rgba(20, 83, 61, 0.7)',
        
        // Variaciones de Forest Green (uso: bg-forest-500, text-forest-300, etc.)
        forest: {
          50: '#E8F5F0',
          100: '#D1EBE1',
          200: '#A3D7C3',
          300: '#75C3A5',
          400: '#47AF87',
          500: '#14533D', // BASE - Verde Bosque Profundo
          600: '#0F3E2E',
          700: '#0A2A1F',
          800: '#05150F',
          900: '#020A07',
          DEFAULT: '#14533D', // Permite usar "forest" directamente: bg-forest
        },
        
        // Variaciones de Kraft Cream
        kraft: {
          50: '#FDFAF3',
          100: '#FAF5E7',
          200: '#F5EBDE',
          300: '#EBE1D6',
          400: '#C5B48F', // BASE - Crema Orgánico / Kraft
          500: '#A89D7A',
          600: '#8B8265',
          700: '#6E6750',
          800: '#514C3B',
          900: '#343126',
          DEFAULT: '#C5B48F', // Alias para uso directo como "kraft"
        },
        
        // Alias para compatibilidad
        accent: '#C5B48F',
        
        // Colores Funcionales
        success: '#47AF87',
        warning: '#C5B48F',
        error: '#D97757',
        info: '#75C3A5',
      },
      fontFamily: {
        logo: ['var(--font-roboto-slab)', 'Roboto Slab', 'serif'], // Slab Serif Western/Vintage para LEAL
        display: ['var(--font-roboto-slab)', 'Roboto Slab', 'serif'], // Roboto Slab para labels y botones
        sans: ['var(--font-roboto)', 'Roboto', 'sans-serif'], // Sans Serif moderna para texto secundario
        body: ['var(--font-inter)', 'Inter', 'sans-serif'], // Para cuerpo de texto y UI
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '2px',
        md: '0.5rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem',  // 352px
      },
      letterSpacing: {
        'widest': '0.05em',
        'extra-widest': '0.1em',
      },
      boxShadow: {
        'rustic-sm': '0 1px 2px rgba(197, 180, 143, 0.1)',
        'rustic-md': '0 4px 6px rgba(20, 83, 61, 0.15)',
        'rustic-lg': '0 10px 15px rgba(20, 83, 61, 0.2)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
