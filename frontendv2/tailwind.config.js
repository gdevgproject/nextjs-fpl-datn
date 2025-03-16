/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      backgroundImage: {
        'gradient-1': 'linear-gradient(90deg, #4173E3 0%, #1250DC 50%, #0E40B0 100%)',
        'gradient-2': 'linear-gradient(180deg, #4173E3 0%, #1250DC 50%, #0E40B0 100%)',
        'gradient-3':
          'linear-gradient(180deg, rgba(65, 115, 227, 0.8) 0%, rgba(18, 80, 220, 0.8) 50%, rgba(14, 64, 176, 0.8) 100%)',
        'gradient-4': 'linear-gradient(90deg, #1250DC 0%, #0E40B0 100%)',
        'gradient-5': 'linear-gradient(90deg, #FF5246 0%, #CD1A0C 100%)',
        'light-0':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))',
        'light-1':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18))',
        'light-2':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.16))',
        'light-3':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.14), rgba(0, 0, 0, 0.14))',
        'light-4':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12))',
        'light-6':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))',
        'light-8':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08))',
        'light-12':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.06))',
        'light-16':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.04))',
        'light-24':
          'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))',
      },
      colors: {
        primary: {
          DEFAULT: '#1250DC',
          5: '#e7edfb',
          10: '#d0dcf8',
          20: '#a0b9f1',
          30: '#7196ea',
          40: '#4173e3',
          50: '#1250DC',
          60: '#0e40b0',
          70: '#0c348f',
          80: '#09286e',
          90: '#061c4d',
          100: '#04102c',
        },
        secondary: {
          DEFAULT: '#667085',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#FF0000',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F2F4F7',
          foreground: '#667085',
        },
        accent: {
          DEFAULT: '#F9FAFB',
          foreground: '#101828',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#101828',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#101828',
        },
        // Grayscale
        grayscale: {
          0: '#FCFCFD',
          5: '#F9F9FB',
          10: '#EFF1F5',
          20: '#DCDFEA',
          30: '#B9C0D4',
          40: '#7D89B0',
          50: '#5D6B98',
          60: '#4A5578',
          70: '#404968',
          80: '#30374F',
          90: '#111322',
          100: '#0E101B',
        },

        // Secondary Colors
        secondary: {
          DEFAULT: '#667085',
          foreground: '#FFFFFF',
        },

        // Error Colors
        error: {
          DEFAULT: '#FF0000',
          5: '#ffe5e5',
          10: '#ffcccc',
          20: '#ff9999',
          30: '#ff6666',
          40: '#ff3333',
          50: '#FF0000',
          60: '#cc0000',
          70: '#a60000',
          80: '#800000',
          90: '#590000',
          100: '#330000',
          foreground: '#FFFFFF',
        },

        // Info Colors
        info: {
          DEFAULT: '#2897FF',
          5: '#e9f4ff',
          10: '#d4eaff',
          20: '#a9d5ff',
          30: '#7ec1ff',
          40: '#53acff',
          50: '#2897ff',
          60: '#2079cc',
          70: '#1a62a6',
          80: '#144c80',
          90: '#0e3559',
          100: '#081e33',
          foreground: '#FFFFFF',
        },

        // Success Colors
        success: {
          DEFAULT: '#2da216',
          5: '#ebfae8',
          10: '#d7f5d2',
          20: '#afeaa4',
          30: '#88e077',
          40: '#60d549',
          50: '#38cb1c',
          60: '#2da216',
          70: '#248412',
          80: '#1c660e',
          90: '#14470a',
          100: '#0b2906',
          foreground: '#FFFFFF',
        },

        // Warning Colors
        warning: {
          DEFAULT: '#ccb500',
          5: '#fffce5',
          10: '#fff9cc',
          20: '#fff399',
          30: '#ffee66',
          40: '#ffe833',
          50: '#ffe200',
          60: '#ccb500',
          70: '#a69300',
          80: '#807100',
          90: '#594f00',
          100: '#332d00',
          foreground: '#000000',
        },

        // Link Colors
        link: {
          DEFAULT: '#0e55ff',
          5: '#e6eeff',
          10: '#cfddff',
          20: '#9fbbff',
          30: '#6e99ff',
          40: '#3e77ff',
          50: '#0e55ff',
          60: '#0b44cc',
          70: '#0937a6',
          80: '#072b80',
          90: '#051e59',
          100: '#031133',
          foreground: '#FFFFFF',
        },

        // UI Component Colors
        background: '#F1F4FD',
        foreground: '#101828',
        border: '#EAECF0',
        input: '#EAECF0',
        ring: '#3582EE',
      },

      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Body text sizes
        'body-xs': ['0.75rem', { lineHeight: '1rem' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-base': ['1rem', { lineHeight: '1.5rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],

        // Heading sizes
        'heading-xs': ['1.25rem', { lineHeight: '1.75rem' }],
        'heading-sm': ['1.5rem', { lineHeight: '2rem' }],
        'heading-base': ['1.875rem', { lineHeight: '2.25rem' }],
        'heading-lg': ['2.25rem', { lineHeight: '2.5rem' }],
        'heading-xl': ['3rem', { lineHeight: '3.5rem' }],
        'heading-2xl': ['3.75rem', { lineHeight: '4rem' }],
      },

      boxShadow: {
        // Dark Mode Shadows
        'dark-00': '0 0 0 0 #12121200',
        'dark-08': '0 8px 8px 0 #12121224',
        'dark-12': '0 12px 12px 0 #12121233',
        'dark-16': '0 16px 16px 0 #12121242',
        'dark-24': '0 24px 24px 0 #12121266',

        // Light Mode Shadows
        'light-00': '0 0 0 0 #00000033',
        'light-08': '0 8px 8px 0 #00000033',
        'light-12': '0 12px 12px 0 #00000033',
        'light-16': '0 16px 16px 0 #00000033',
        'light-24': '0 24px 24px 0 #00000033',

        // Effect Shadows
        '01': '0 1px 1px 0 #00000024',
        '02': '0 2px 2px 0 #00000024',
        '04': '0 4px 4px 0 #00000024',
        '08': '0 8px 8px 0 #00000024',
        12: '0 12px 12px 0 #00000024',
        16: '0 16px 16px 0 #00000024',
        24: '0 24px 24px 0 #00000024',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

