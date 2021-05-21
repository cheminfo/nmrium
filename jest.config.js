module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/test-e2e/'],
  // Remove /data to include component files when components are tested.
  collectCoverageFrom: ['src/data/**/*.{js,jsx,ts,tsx}', '!src/demo/**'],
};
