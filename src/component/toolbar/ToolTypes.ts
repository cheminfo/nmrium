import type { Info1D, Info2D } from '@zakodium/nmr-types';
import type { NMRiumToolBarPreferences } from '@zakodium/nmrium-core';
import { Filters1D, Filters2D } from 'nmr-processing';

import type { DisplayerMode } from '../reducer/Reducer.js';

type InfoKey = keyof Info1D | keyof Info2D;

export interface ToolOptionItem {
  id: string;
  label: string;
  mode?: DisplayerMode;
  spectraOptions?: Array<
    | {
        info?: Array<{ key: InfoKey; value: any }>; // check if the active spectrum has these info
        active: true;
      }
    | { active: false }
  >;
  isToggle: boolean;
  hasOptionPanel: boolean;
  isFilter: boolean;
  isExperimental?: true;
}

export type Tool =
  | keyof NMRiumToolBarPreferences
  | 'HMove'
  | 'equalizer'
  | 'generalSelector'
  | 'databaseRangesSelection'
  | 'matrixGenerationExclusionZones'
  | 'inset';

type RecordOptions = Record<Tool, ToolOptionItem>;

export const options: RecordOptions = {
  zoom: {
    id: 'zoom',
    label: 'Zoom in / out',
    hasOptionPanel: false,
    isFilter: false,
    isToggle: true,
  },
  peakPicking: {
    id: 'peakPicking',
    label: 'Peaks picking',
    hasOptionPanel: true,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  integral: {
    id: 'integral',
    label: 'Integral Tool',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  inset: {
    id: 'inset',
    label: 'Inset Tool',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        active: true,
      },
    ],
    isToggle: true,
    isExperimental: true,
  },
  zonePicking: {
    id: 'zonePicking',
    label: 'Zone tool',
    hasOptionPanel: true,
    isFilter: false,
    mode: '2D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  slicing: {
    id: 'slicing',
    label: 'Slicing tool',
    hasOptionPanel: false,
    isFilter: false,
    mode: '2D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  HMove: {
    id: 'HMove',
    label: 'Move spectrum horizontally',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  equalizer: {
    id: 'equalizer',
    label: 'Equalizer tool',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  rangePicking: {
    id: 'rangePicking',
    label: 'Range picking and multiplet analysis',
    hasOptionPanel: true,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  apodization: {
    id: Filters1D.apodization.name,
    label: Filters1D.apodization.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: true,
  },
  zeroFilling: {
    id: Filters1D.zeroFilling.name,
    label: Filters1D.zeroFilling.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: true,
  },
  zeroFillingDimension1: {
    id: Filters2D.zeroFillingDimension1.name,
    label: Filters2D.zeroFillingDimension1.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: true,
  },
  zeroFillingDimension2: {
    id: Filters2D.zeroFillingDimension2.name,
    label: Filters2D.zeroFillingDimension2.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isFtDimensionOne', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: true,
  },
  phaseCorrection: {
    id: Filters1D.phaseCorrection.name,
    label: Filters1D.phaseCorrection.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraOptions: [
      {
        info: [
          { key: 'isFt', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: true,
  },
  baselineCorrection: {
    id: Filters1D.baselineCorrection.name,
    label: Filters1D.baselineCorrection.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  generalSelector: {
    id: 'generalSelector',
    label: 'range general selector',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  multipleSpectraAnalysis: {
    id: 'multipleSpectraAnalysis',
    label: 'Multiple spectra analysis',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
      {
        active: false,
      },
    ],
    isToggle: true,
  },
  exclusionZones: {
    id: 'exclusionZones',
    label: 'Exclusion zones',
    hasOptionPanel: false,
    isFilter: true,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
      {
        active: false,
      },
    ],
    isToggle: true,
  },
  matrixGenerationExclusionZones: {
    id: 'matrixGenerationExclusionZones',
    label: 'Matrix generations exclusion zones',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
      {
        active: false,
      },
    ],
    isToggle: true,
  },
  databaseRangesSelection: {
    id: 'databaseRangesSelection',
    label: 'Filter database',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  exportAs: {
    id: 'exportAs',
    label: 'Export as',
    hasOptionPanel: false,
    isFilter: false,
    isToggle: false,
  },
  fft: {
    id: 'fft',
    label: 'Fourier transform',
    hasOptionPanel: false,
    isFilter: true,
    mode: '1D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: false,
  },
  fftDimension1: {
    id: 'fftDimension1',
    label: 'Fourier transform dimension 1',
    hasOptionPanel: false,
    isFilter: true,
    mode: '2D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: false,
  },
  fftDimension2: {
    id: 'fftDimension2',
    label: 'Fourier transform dimension 2',
    hasOptionPanel: false,
    isFilter: true,
    mode: '2D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: false,
  },
  phaseCorrectionTwoDimensions: {
    id: 'phaseCorrectionTwoDimensions',
    label: 'Phase correction two dimension',
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraOptions: [
      {
        active: true,
      },
    ],
    isToggle: true,
  },
  import: {
    id: 'import',
    label: 'Import',
    hasOptionPanel: false,
    isFilter: false,
    isToggle: false,
  },
  realImaginary: {
    id: 'realImaginary',
    label: 'Real / Imaginary',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isComplex', value: true }],
        active: true,
      },
    ],
    isToggle: false,
  },
  spectraCenterAlignments: {
    id: 'spectraCenterAlignments',
    label: 'Align spectrum',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    isToggle: false,
  },
  spectraStackAlignments: {
    id: 'spectraStackAlignments',
    label: 'Stack spectra',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
      {
        active: false,
      },
    ],
    isToggle: false,
  },
  zoomOut: {
    id: 'zoomOut',
    label: 'Zoom out',
    hasOptionPanel: false,
    isFilter: false,
    isToggle: false,
  },
  autoRangeAndZonePicking: {
    id: 'autoRangeAndZonePicking',
    label: 'Auto range and zone picking',
    hasOptionPanel: false,
    isFilter: false,
    isToggle: false,
  },
  apodizationDimension1: {
    id: Filters2D.apodizationDimension1.name,
    label: Filters2D.apodizationDimension1.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraOptions: [
      {
        info: [{ key: 'isFid', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  apodizationDimension2: {
    id: Filters2D.apodizationDimension2.name,
    label: Filters2D.apodizationDimension2.label,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraOptions: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isFtDimensionOne', value: true },
          { key: 'isComplex', value: true },
        ],
        active: true,
      },
    ],
    isToggle: true,
  },
};
