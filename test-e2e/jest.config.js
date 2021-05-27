module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: process.env.PWDEBUG ? 1e9 : 60000,
};
