import {
  MultipleSpectraAnalysisPreferences,
  PanelsPreferences,
  SpectraNucleusPreferences,
} from '../../workspaces/Workspace';

function getPreferences<T>(data: T, nucleus?: string) {
  return { nuclei: { ...(nucleus ? { [nucleus]: data } : {}) } };
}

const getSpectraDefaultValues = (
  nucleus?: string,
): PanelsPreferences['spectra'] => {
  const preferences: SpectraNucleusPreferences = {
    columns: [
      {
        name: 'visible',
        label: '',
        description: 'Show/Hide Spectrum',
        visible: true,
      },
      {
        name: 'name',
        label: 'Spectrum Name',
        description: 'Spectrum Name',
        jpath: ['info', 'name'],
        visible: true,
      },
      {
        name: 'solvent',
        label: 'Solvent',
        description: 'Solvent',
        jpath: ['info', 'solvent'],
        visible: true,
      },
      {
        jpath: ['info', 'pulseSequence'],
        label: 'Pulse',
        visible: true,
      },
      {
        jpath: ['info', 'experiment'],
        label: 'Experiment',
        visible: true,
      },
      {
        name: 'color',
        label: '',
        description: 'Spectrum Color',
        visible: true,
      },
    ],
  };

  return getPreferences(preferences, nucleus);
};

const getIntegralDefaultValues = (
  nucleus?: string,
): PanelsPreferences['integrals'] => {
  const preferences = {
    absolute: { show: false, format: '0.00' },
    relative: { show: true, format: '0.00' },
    color: '#000000',
    strokeWidth: 1,
    showKind: true,
  };
  return getPreferences(preferences, nucleus);
};

const getZoneDefaultValues = (
  nucleus?: string,
): PanelsPreferences['zones'] => ({
  absolute: { show: false, format: '0.00' },
  relative: { show: true, format: '0.00' },
  ...getPreferences({ deltaPPM: { show: true, format: '0.00' } }, nucleus),
});

const getRangeDefaultValues = (
  nucleus?: string,
): PanelsPreferences['ranges'] => {
  const preferences = {
    from: { show: false, format: '0.00' },
    to: { show: false, format: '0.00' },
    absolute: { show: false, format: '0.00' },
    relative: { show: true, format: '0.00' },
    deltaPPM: { show: true, format: '0.00' },
    deltaHz: { show: false, format: '0.00' },
    coupling: { show: true, format: '0.00' },
    jGraphTolerance: nucleus === '1H' ? 0.2 : nucleus === '13C' ? 2 : 0, //J Graph tolerance for: 1H: 0.2Hz 13C: 2Hz
    showKind: true,
  };

  return getPreferences(preferences, nucleus);
};

const getPeaksDefaultValues = (
  nucleus?: string,
): PanelsPreferences['peaks'] => {
  const preferences = {
    peakNumber: { show: true, format: '0' },
    deltaPPM: { show: true, format: '0.00' },
    deltaHz: { show: false, format: '0.00' },
    peakWidth: { show: false, format: '0.00' },
    intensity: { show: true, format: '0.00' },
    showKind: true,
    fwhm: { show: true, format: '0.00000' },
    mu: { show: false, format: '0.00000' },
  };

  return getPreferences(preferences, nucleus);
};

const databaseDefaultValues: PanelsPreferences['database'] = {
  previewJcamp: true,
  showSmiles: true,
  showSolvent: false,
  showNames: true,
  range: { show: false, format: '0.00' },
  delta: { show: true, format: '0.00' },
  showAssignment: false,
  coupling: { show: true, format: '0.0' },
  showMultiplicity: true,
  color: '#C0B000',
  marginBottom: 30,
  allowSaveAsNMRium: false,
};
const getMultipleSpectraAnalysisDefaultValues = (
  nucleus?: string,
): PanelsPreferences['multipleSpectraAnalysis'] => {
  const preferences: MultipleSpectraAnalysisPreferences = {
    analysisOptions: {
      resortSpectra: true,
      code: null,
      columns: {},
      sum: 100,
      columnIndex: 0,
    },
    legendsFields: [
      { name: 'intensity', label: 'Intensity', visible: true },
      { name: 'name', label: 'Name', visible: true },
    ],
  };
  return nucleus ? { [nucleus]: preferences } : {};
};

export {
  getSpectraDefaultValues,
  getPeaksDefaultValues,
  getIntegralDefaultValues,
  getRangeDefaultValues,
  getZoneDefaultValues,
  databaseDefaultValues,
  getMultipleSpectraAnalysisDefaultValues,
};
