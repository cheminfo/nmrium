import * as absolute from './absolute';
import * as baselineCorrection from './baselineCorrection';
import * as digitalFilter from './digitalFilter';
import * as fft from './fft';
import * as lineBroadening from './lineBroadening';
import * as phaseCorrection from './phaseCorrection';
import * as autoPhaseCorrection from './autoPhaseCorrection';
import * as shiftX from './shiftX';
import * as zeroFilling from './zeroFilling';

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
};
