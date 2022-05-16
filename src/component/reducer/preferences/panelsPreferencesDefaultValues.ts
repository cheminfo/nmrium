import {
  IntegralsPanelPreferences,
  PeaksPanelPreferences,
  RangesPanelPreferences,
} from '../../workspaces/Workspace';

const integralDefaultValues: IntegralsPanelPreferences = {
  absolute: { show: false, format: '0.00' },
  relative: { show: true, format: '0.00' },
  color: '#000000',
  strokeWidth: 1,
};
const zoneDefaultValues = {
  showFrom: false,
  fromFormat: '0.00',
  showTo: false,
  toFormat: '0.00',
  showAbsolute: false,
  absoluteFormat: '0.00',
  showRelative: true,
  relativeFormat: '0.00',
};

const getRangeDefaultValues = (nucleus?: string): RangesPanelPreferences => ({
  from: { show: false, format: '0.00' },
  to: { show: false, format: '0.00' },
  absolute: { show: false, format: '0.00' },
  relative: { show: true, format: '0.00' },
  deltaPPM: { show: true, format: '0.00' },
  deltaHz: { show: false, format: '0.00' },
  coupling: { show: true, format: '0.00' },
  jGraphTolerance: nucleus === '1H' ? 0.2 : nucleus === '13C' ? 2 : 0, //J Graph tolerance for: 1H: 0.2Hz 13C: 2Hz
});

const peaksDefaultValues: PeaksPanelPreferences = {
  peakNumber: { show: true, format: '0' },
  deltaPPM: { show: true, format: '0.00' },
  deltaHz: { show: false, format: '0.00' },
  peakWidth: { show: false, format: '0.00' },
  intensity: { show: true, format: '0.00' },
};

const databaseDefaultValues = {
  showSmiles: true,
  showSolvent: false,
  showNames: true,
  showRange: false,
  showDelta: true,
  showAssignment: false,
  showCoupling: true,
  showMultiplicity: true,
};

export {
  peaksDefaultValues,
  integralDefaultValues,
  getRangeDefaultValues,
  zoneDefaultValues,
  databaseDefaultValues,
};
