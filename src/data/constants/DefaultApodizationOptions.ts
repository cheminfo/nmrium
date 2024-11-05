export const defaultApodizationOptions = {
  lorentzToGauss: {
    apply: true,
    shape: {
      kind: 'lorentzToGauss',
      options: {
        lineBroadening: 1,
        gaussBroadening: 0,
        lineBroadeningCenter: 0,
      },
    },
  },
};
