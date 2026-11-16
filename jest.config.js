const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'src/app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  moduleNameMapper: {
    '^@/(.*)
  },
};

module.exports = createJestConfig(customJestConfig);: '<rootDir>/src/$1',
    '^lucide-react
  },
};

module.exports = createJestConfig(customJestConfig);: '<rootDir>/__mocks__/lucide-react.js',
  },
};

module.exports = createJestConfig(customJestConfig);