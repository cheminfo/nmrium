import { Info1D, Info2D } from 'nmr-load-save';

import * as Filters from '../../data/Filters';
import { NMRiumToolBarPreferences } from '../../types/NMRiumToolBarPreferences';
import { DISPLAYER_MODE } from '../reducer/core/Constants';

type InfoKey = keyof Info1D | keyof Info2D;

export interface ToolOptionItem {
  id: string;
  label: string;
  mode?: DISPLAYER_MODE;
  spectraOptions?: (
    | {
        info?: { key: InfoKey; value: any }[]; // check if the active spectrum has these info
        active: true;
      }
    | { active: false }
  )[];
  isToggle: boolean;
  hasOptionPanel: boolean;
  isFilter: boolean;
}

type Tools = keyof NMRiumToolBarPreferences;

type RecordOptions = Record<
  | Tools
  | (
      | 'HMove'
      | 'equalizer'
      | 'generalSelector'
      | 'editRange'
      | 'databaseRangesSelection'
      | 'matrixGenerationExclusionZones'
    ),
  ToolOptionItem
>;

export const options: RecordOptions = {
  zoom: {
    id: 'zoom',
    label: 'Zoom in',
    hasOptionPanel: false,
    isFilter: false,
    isToggle: true,
  },
  peakPicking: {
    id: 'peakPicking',
    label: 'Peaks picking',
    hasOptionPanel: true,
    isFilter: false,
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  zonePicking: {
    id: 'zonePicking',
    label: 'Zone tool',
    hasOptionPanel: true,
    isFilter: false,
    mode: DISPLAYER_MODE.DM_2D,
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
    mode: DISPLAYER_MODE.DM_2D,
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
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },
  apodization: {
    id: Filters.apodization.id,
    label: Filters.apodization.name,
    hasOptionPanel: true,
    isFilter: true,
    mode: DISPLAYER_MODE.DM_1D,
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
    id: Filters.zeroFilling.id,
    label: Filters.zeroFilling.name,
    hasOptionPanel: true,
    isFilter: true,
    mode: DISPLAYER_MODE.DM_1D,
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
  phaseCorrection: {
    id: Filters.phaseCorrection.id,
    label: Filters.phaseCorrection.name,
    hasOptionPanel: true,
    isFilter: true,
    mode: DISPLAYER_MODE.DM_1D,
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
    id: Filters.baselineCorrection.id,
    label: Filters.baselineCorrection.name,
    hasOptionPanel: true,
    isFilter: true,
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
    spectraOptions: [
      {
        info: [{ key: 'isFt', value: true }],
        active: true,
      },
    ],
    isToggle: true,
  },

  editRange: {
    id: 'editRange',
    label: 'edit range',
    hasOptionPanel: false,
    isFilter: false,
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
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
    isFilter: false,
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
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
    mode: DISPLAYER_MODE.DM_1D,
    isToggle: false,
  },
  spectraStackAlignments: {
    id: 'spectraStackAlignments',
    label: 'Stack spectra',
    hasOptionPanel: false,
    isFilter: false,
    mode: DISPLAYER_MODE.DM_1D,
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
};
