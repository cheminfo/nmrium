import type { Shapes as Apodization1DOptions } from 'nmr-processing';

export const defaultApodizationOptions: Apodization1DOptions = {
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
