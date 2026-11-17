const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^lucide-react$': '<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js',
  },
  collectCoverageFrom: [
    'src/components/auth/**/*.{ts,tsx}',
    'src/components/montador/**/*.{ts,tsx}',
    'src/components/impressao/**/*.{ts,tsx}',
    'src/components/leitura/**/*.{ts,tsx}',
    'src/components/relatorios/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary', 'clover'],
};

module.exports = createJestConfig(customJestConfig);
