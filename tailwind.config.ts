import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        catolica: {
          primary: '#800020',
          dark: '#5e0017',
          light: '#fbf7f8',
        },
      },
    },
  },
  plugins: [],
};
export default config;