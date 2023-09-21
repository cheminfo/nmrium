import {
  MultipleSpectraAnalysisPreferences,
  PanelsPreferences,
  SpectraNucleusPreferences,
} from 'nmr-load-save';

import { is2DNucleus } from '../../utility/nucleusToString';

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
    showSerialNumber: true,
    absolute: { show: false, format: '0.00' },
    relative: { show: true, format: '0.00' },
    from: { show: true, format: '0.00' },
    to: { show: true, format: '0.00' },
    color: '#000000',
    strokeWidth: 1,
    showKind: true,
    showDeleteAction: true,
  };

  return getPreferences(preferences, nucleus);
};

const getZoneDefaultValues = (nucleus?: string): PanelsPreferences['zones'] => {
  const common = {
    absolute: { show: false, format: '0.00' },
    relative: { show: true, format: '0.00' },
  };

  if (!nucleus) {
    return { nuclei: {} };
  }

  if (is2DNucleus(nucleus)) {
    const perferences2D = {
      showSerialNumber: true,
      showKind: true,
      showDeleteAction: true,
      showZoomAction: true,
      showEditAction: true,
      showAssignment: true,
    };
    return { ...common, ...getPreferences(perferences2D, nucleus) };
  } else {
    const perferences1D = {
      deltaPPM: { show: true, format: '0.00' },
    };
    return { ...common, ...getPreferences(perferences1D, nucleus) };
  }
};

const getRangeDefaultValues = (
  nucleus?: string,
): PanelsPreferences['ranges'] => {
  const preferences = {
    showSerialNumber: true,
    from: { show: false, format: '0.00' },
    to: { show: false, format: '0.00' },
    absolute: { show: false, format: '0.00' },
    relative: { show: true, format: '0.00' },
    deltaPPM: { show: true, format: '0.00' },
    deltaHz: { show: false, format: '0.00' },
    coupling: { show: true, format: '0.00' },
    jGraphTolerance: nucleus === '1H' ? 0.2 : nucleus === '13C' ? 2 : 0, //J Graph tolerance for: 1H: 0.2Hz 13C: 2Hz
    showKind: true,
    showMultiplicity: true,
    showAssignment: true,
    showDeleteAction: true,
    showZoomAction: true,
    showEditAction: true,
  };

  return getPreferences(preferences, nucleus);
};

const getPeaksDefaultValues = (
  nucleus?: string,
): PanelsPreferences['peaks'] => {
  const preferences = {
    showSerialNumber: true,
    deltaPPM: { show: true, format: '0.00' },
    deltaHz: { show: false, format: '0.00' },
    peakWidth: { show: false, format: '0.00' },
    intensity: { show: true, format: '0.00' },
    fwhm: { show: true, format: '0.00000' },
    mu: { show: false, format: '0.00000' },
    showDeleteAction: true,
    showEditPeakShapeAction: true,
    showKind: true,
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
