import * as absolute from './data1d/filter1d/absolute';
import * as autoPhaseCorrection from './data1d/filter1d/autoPhaseCorrection';
import * as baselineCorrection from './data1d/filter1d/baselineCorrection';
import * as digitalFilter from './data1d/filter1d/digitalFilter';
import * as fft from './data1d/filter1d/fft';
import * as fromTo from './data1d/filter1d/fromTo';
import * as lineBroadening from './data1d/filter1d/lineBroadening';
import * as phaseCorrection from './data1d/filter1d/phaseCorrection';
import * as shiftX from './data1d/filter1d/shiftX';
import * as zeroFilling from './data1d/filter1d/zeroFilling';
import * as shift2DX from './data2d/filter2d/shiftX';
import * as shift2DY from './data2d/filter2d/shiftY';

export const Filters = {
  absolute,
  baselineCorrection,
  lineBroadening,
  fft,
  phaseCorrection,
  autoPhaseCorrection,
  shiftX,
  zeroFilling,
  digitalFilter,
  fromTo,
  shift2DX,
  shift2DY,
};
