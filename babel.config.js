module.exports = {
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-react',
      { runtime: 'automatic', importSource: '@emotion/react' },
    ],
  ],
};
