import { Shapes as Apodization1DOptions } from 'nmr-processing';

export const defaultApodizationOptions: Apodization1DOptions = {
  lorentzToGauss: {
    shape: {
      lineBroadening: 1,
      gaussBroadening: 0,
      lineBroadeningCenter: 0,
    },
  },
};
