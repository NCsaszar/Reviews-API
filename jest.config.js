const jest = require('jest');

module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testPathIgnorePatterns: ['\\\\node_modules\\\\'],
  transformIgnorePatterns: ['\\\\node_modules\\\\'],
  verbose: false,
};
