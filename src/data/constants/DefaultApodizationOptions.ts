import type { Apodization1DOptions } from 'nmr-processing';

export const defaultApodizationOptions: Apodization1DOptions = {
  gaussian: {
    apply: true,
    options: {
      lineBroadening: 0,
      lineBroadeningCenter: 1,
    },
  },
};
