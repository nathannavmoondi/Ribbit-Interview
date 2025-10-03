// config Jest
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    // Mock static assets & styles
    '\\.(css|less|scss)$': '<rootDir>/test/__mocks__/styleMock.js',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^ol$': '<rootDir>/__mocks__/ol.js'
  },
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/junit-reports',
        uniqueOutputName: 'false',
        suiteName: 'React tests',
        outputName: 'template-react.xml',
        addFileAttribute: 'true',
        reportTestSuiteErrors: 'true',
        includeConsoleOutput: 'false',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' > '
      }
    ]
  ]
};
