const config = {
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
  ],
  presets: [['@babel/preset-react', { runtime: 'automatic' }]],
};

if (process.env.BABEL_MODE === 'cjs') {
  config.plugins.push('@babel/plugin-transform-modules-commonjs');
}

module.exports = config;
