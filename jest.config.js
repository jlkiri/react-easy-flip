module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.test.json'
    }
  }
}
