export interface Apodization1DOptions {
  lineBroadening: number;
  gaussBroadening: number;
  lineBroadeningCenter: number;
}

export const defaultApodizationOptions: Apodization1DOptions = {
  lineBroadening: 1,
  gaussBroadening: 0,
  lineBroadeningCenter: 0,
};
