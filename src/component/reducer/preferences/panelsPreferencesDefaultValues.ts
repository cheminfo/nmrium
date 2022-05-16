const integralDefaultValues = {
  showAbsolute: false,
  absoluteFormat: '0.00',
  showRelative: true,
  relativeFormat: '0.00',
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

const getRangeDefaultValues = (nucleus?: string) => ({
  showFrom: false,
  fromFormat: '0.00',
  showTo: false,
  toFormat: '0.00',
  showAbsolute: false,
  absoluteFormat: '0.00',
  showRelative: true,
  showDeltaPPM: true,
  deltaPPMFormat: '0.00',
  showDeltaHz: false,
  deltaHzFormat: '0.00',
  relativeFormat: '0.00',
  jGraphTolerance: nucleus === '1H' ? 0.2 : nucleus === '13C' ? 2 : 0, //J Graph tolerance for: 1H: 0.2Hz 13C: 2Hz
});

const peaksDefaultValues = {
  showPeakNumber: true,
  peakNumberFormat: '0',
  showDeltaPPM: true,
  deltaPPMFormat: '0.00',
  showDeltaHz: false,
  deltaHzFormat: '0.00',
  showPeakWidth: false,
  peakWidthFormat: '0.00',
  showIntensity: true,
  intensityFormat: '0.00',
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
