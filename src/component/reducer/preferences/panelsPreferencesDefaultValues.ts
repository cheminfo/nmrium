import type {
  BaseNucleus1DPreferences,
  BaseNucleus2DPreferences,
  MatrixGenerationOptions,
  MultipleSpectraAnalysisPreferences,
  PanelsPreferences,
  SpectraPreferences,
  Zones1DNucleusPreferences,
  Zones2DNucleusPreferences,
} from 'nmrium-core';

import { is2DNucleus } from '../../utility/nucleusToString.js';

function getPreferences<T>(data: T, nucleus?: string) {
  return { nuclei: { ...(nucleus ? { [nucleus]: data } : {}) } };
}

const getSpectraDefaultValues = (
  nucleus?: string,
): PanelsPreferences['spectra'] => {
  const preferences: SpectraPreferences = {
    columns: [
      {
        name: 'visible',
        label: '',
        description: 'Show/Hide Spectrum',
        visible: true,
      },
      {
        label: 'Spectrum Name',
        jpath: ['info', 'name'],
        visible: true,
      },
      {
        label: 'Solvent',
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
    isSumConstant: true,
  };

  return getPreferences(preferences, nucleus);
};

const getZoneDefaultValues = (nucleus?: string): PanelsPreferences['zones'] => {
  const common = {
    absolute: { show: false, format: '0.00' },
    relative: { show: true, format: '0.00' },
    nuclei: {},
  };

  if (!nucleus) {
    return { ...common, nuclei: {} };
  }

  if (is2DNucleus(nucleus)) {
    const preferences2D: Zones2DNucleusPreferences = {
      showSerialNumber: true,
      showKind: true,
      showDeleteAction: true,
      showZoomAction: true,
      showEditAction: true,
      showAssignment: true,
      showAssignmentLabel: false,
    };

    const output: BaseNucleus2DPreferences<Zones2DNucleusPreferences> = {
      ...common,
      ...getPreferences(preferences2D, nucleus),
    };

    return output;
  } else {
    const preferences1D: Zones1DNucleusPreferences = {
      deltaPPM: { show: true, format: '0.00' },
    };

    const output: BaseNucleus1DPreferences<Zones1DNucleusPreferences> = {
      ...common,
      ...getPreferences(preferences1D, nucleus),
    };
    return output;
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
    showAssignmentLabel: false,
    isSumConstant: true,
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
    gamma: { show: false, format: '0.000' },
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
  structureSize: {
    minWidth: 0,
    minHeight: 100,
  },
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

function getMatrixGenerationDefaultOptions(): MatrixGenerationOptions {
  return {
    matrixOptions: {
      exclusionsZones: [],
      filters: [],
      numberOfPoints: 1024,
      range: { from: 0, to: 0 },
    },
    chemicalShift: null,
    scaleRatio: 1,
    showBoxPlot: false,
    showStocsy: false,
  };
}

const getMatrixGenerationDefaultValues = (
  nucleus?: string,
): PanelsPreferences['matrixGeneration'] => {
  return nucleus ? { [nucleus]: getMatrixGenerationDefaultOptions() } : {};
};

export {
  getSpectraDefaultValues,
  getPeaksDefaultValues,
  getIntegralDefaultValues,
  getRangeDefaultValues,
  getZoneDefaultValues,
  databaseDefaultValues,
  getMultipleSpectraAnalysisDefaultValues,
  getMatrixGenerationDefaultOptions,
  getMatrixGenerationDefaultValues,
};
