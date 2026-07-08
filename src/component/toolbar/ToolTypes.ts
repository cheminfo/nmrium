import type { Info1D, Info2D } from '@zakodium/nmr-types';
import type { NMRiumToolbarPreferences } from '@zakodium/nmrium-core';
import {
  SvgNmrAlignBottom,
  SvgNmrAlignCenter,
  SvgNmrApodization,
  SvgNmrBaselineCorrection,
  SvgNmrFourierTransform,
  SvgNmrIntegrate,
  SvgNmrMultipleAnalysis,
  SvgNmrOverlay3,
  SvgNmrOverlay3Aligned,
  SvgNmrPeakPicking,
  SvgNmrPhaseCorrection,
  SvgNmrRangePicking,
  SvgNmrRealImag,
  SvgNmrZeroFilling,
} from 'cheminfo-font';
import { Filters1D, Filters2D } from 'nmr-processing';
import type { ComponentType } from 'react';
import {
  FaDiceFour,
  FaExpand,
  FaFileExport,
  FaFileImport,
  FaICursor,
} from 'react-icons/fa';
import { PiKnifeBold, PiSelectionPlusDuotone } from 'react-icons/pi';
import { TbZoom } from 'react-icons/tb';

import type { DisplayerMode } from '../reducer/Reducer.js';

type InfoKey = keyof Info1D | keyof Info2D;

interface StaticIcon {
  icon: ToolIconComponent;
  getIcon?: never;
}

interface DynamicIcon {
  icon?: never;
  getIcon: (ctx: IconDataContext) => ToolIconComponent;
}
export interface IconOptions {
  fontSize?: number;
  strokeWidth?: number;
}

export type ToolIconComponent = ComponentType<IconOptions>;

export interface IconDataContext {
  verticalAlign?: 'bottom' | 'center' | 'stack';
  isRealSpectrumShown?: boolean;
}
interface BaseToolOption {
  id: Tool;
  label: string;
  mode?: DisplayerMode;
  spectraFilter?: Array<{
    info?: Array<{ key: InfoKey; value: any }>; // check if the active spectrum has these info
  }>;
  /**
   * Minium and Maximum number of spectra that must be selected
   * @default({min:1,max:1}}) exact one spectrum selected
   */
  selectedSpectra?: {
    min?: number;
    max?: number;
  }; /**
   * controls how spectraFilter is evaluated
   * 'all' : every selected spectrum must meet spectraFilter.
   * 'any' : at least one selected spectrum must meet the spectraFilter.
   */
  spectraMatch?: 'any' | 'all';
  isToggle: boolean;
  hasOptionPanel: boolean;
  isFilter: boolean;
  isExperimental?: true;
}

export type ToolOptionItem = BaseToolOption & (StaticIcon | DynamicIcon);

export type MainTool = keyof NMRiumToolbarPreferences;

/**
 * Tools that are selectable in panels, not in the main toolbar.
 */
type PanelTool = 'databaseRangesSelection' | 'matrixGenerationExclusionZones';

export type Tool = MainTool | PanelTool;

type RecordOptions = Record<Tool, ToolOptionItem>;

export const options: RecordOptions = {
  zoom: {
    id: 'zoom',
    label: 'Zoom in / out',
    icon: TbZoom,
    hasOptionPanel: false,
    isFilter: false,
    isToggle: true,
  },
  peakPicking: {
    id: 'peakPicking',
    label: 'Peaks picking',
    icon: SvgNmrPeakPicking,
    hasOptionPanel: true,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    selectedSpectra: { min: 1 },
    spectraMatch: 'all',
    isToggle: true,
  },
  integral: {
    id: 'integral',
    label: 'Integral Tool',
    icon: SvgNmrIntegrate,
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
  },
  inset: {
    id: 'inset',
    label: 'Inset Tool',
    icon: PiSelectionPlusDuotone,
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
  },
  zonePicking: {
    id: 'zonePicking',
    label: 'Zone tool',
    icon: FaDiceFour,
    hasOptionPanel: true,
    isFilter: false,
    mode: '2D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
  },
  slicing: {
    id: 'slicing',
    label: 'Slicing tool',
    icon: PiKnifeBold,
    hasOptionPanel: false,
    isFilter: false,
    mode: '2D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
  },
  rangePicking: {
    id: 'rangePicking',
    label: 'Range picking and multiplet analysis',
    icon: SvgNmrRangePicking,
    hasOptionPanel: true,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
  },
  apodization: {
    id: Filters1D.apodization.name,
    label: Filters1D.apodization.label,
    icon: SvgNmrApodization,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraFilter: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: true,
  },
  zeroFilling: {
    id: Filters1D.zeroFilling.name,
    label: Filters1D.zeroFilling.label,
    icon: SvgNmrZeroFilling,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraFilter: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: true,
  },
  zeroFillingDimension1: {
    id: Filters2D.zeroFillingDimension1.name,
    label: Filters2D.zeroFillingDimension1.label,
    icon: SvgNmrZeroFilling,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraFilter: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: true,
  },
  zeroFillingDimension2: {
    id: Filters2D.zeroFillingDimension2.name,
    label: Filters2D.zeroFillingDimension2.label,
    icon: SvgNmrZeroFilling,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraFilter: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isFtDimensionOne', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: true,
  },
  phaseCorrection: {
    id: Filters1D.phaseCorrection.name,
    label: Filters1D.phaseCorrection.label,
    icon: SvgNmrPhaseCorrection,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraFilter: [
      {
        info: [
          { key: 'isFt', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: true,
  },
  baselineCorrection: {
    id: Filters1D.baselineCorrection.name,
    label: Filters1D.baselineCorrection.label,
    icon: SvgNmrBaselineCorrection,
    hasOptionPanel: true,
    isFilter: true,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
  },
  multipleSpectraAnalysis: {
    id: 'multipleSpectraAnalysis',
    label: 'Multiple spectra integration',
    icon: SvgNmrMultipleAnalysis,
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    selectedSpectra: { min: 0 },
    isToggle: true,
  },
  exclusionZones: {
    id: 'exclusionZones',
    label: 'Exclusion zones',
    icon: SvgNmrMultipleAnalysis,
    hasOptionPanel: false,
    isFilter: true,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    selectedSpectra: { min: 0 },
    isToggle: true,
  },
  matrixGenerationExclusionZones: {
    id: 'matrixGenerationExclusionZones',
    label: 'Matrix generations exclusion zones',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    selectedSpectra: { min: 0 },
    isToggle: true,
    icon: SvgNmrMultipleAnalysis,
  },
  databaseRangesSelection: {
    id: 'databaseRangesSelection',
    label: 'Filter database',
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
    icon: FaICursor,
  },
  exportAs: {
    id: 'exportAs',
    label: 'Export as',
    icon: FaFileExport,
    hasOptionPanel: false,
    isFilter: false,
    isToggle: false,
  },
  fft: {
    id: 'fft',
    label: 'Fourier transform',
    icon: SvgNmrFourierTransform,
    hasOptionPanel: false,
    isFilter: true,
    mode: '1D',
    spectraFilter: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: false,
  },
  fftDimension1: {
    id: 'fftDimension1',
    label: 'Fourier transform dimension 1',
    icon: SvgNmrFourierTransform,
    hasOptionPanel: false,
    isFilter: true,
    mode: '2D',
    spectraFilter: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: false,
  },
  fftDimension2: {
    id: 'fftDimension2',
    label: 'Fourier transform dimension 2',
    icon: SvgNmrFourierTransform,
    hasOptionPanel: false,
    isFilter: true,
    mode: '2D',
    spectraFilter: [
      {
        info: [
          { key: 'isFtDimensionOne', value: true },
          { key: 'isFt', value: false },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: false,
  },
  phaseCorrectionTwoDimensions: {
    id: 'phaseCorrectionTwoDimensions',
    label: 'Phase correction two dimension',
    icon: SvgNmrPhaseCorrection,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    isToggle: true,
  },
  import: {
    id: 'import',
    label: 'Import',
    icon: FaFileImport,
    hasOptionPanel: false,
    isFilter: false,
    isToggle: false,
  },
  realImaginary: {
    id: 'realImaginary',
    label: 'Real / Imaginary',
    icon: SvgNmrRealImag,
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isComplex', value: true }],
      },
    ],
    isToggle: false,
  },
  spectraCenterAlignments: {
    id: 'spectraCenterAlignments',
    label: 'Align spectrum',
    // depends on current vertical alignment state
    getIcon: (idc: IconDataContext) =>
      idc.verticalAlign === 'bottom' ? SvgNmrAlignCenter : SvgNmrAlignBottom,
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    isToggle: false,
  },
  spectraStackAlignments: {
    id: 'spectraStackAlignments',
    label: 'Stack spectra',
    // depends on current vertical alignment state
    getIcon: (idc: IconDataContext) =>
      idc.verticalAlign === 'stack' ? SvgNmrOverlay3Aligned : SvgNmrOverlay3,
    hasOptionPanel: false,
    isFilter: false,
    mode: '1D',
    spectraFilter: [
      {
        info: [{ key: 'isFt', value: true }],
      },
    ],
    selectedSpectra: { min: 0 },
    isToggle: false,
  },
  zoomOut: {
    id: 'zoomOut',
    label: 'Zoom out',
    icon: FaExpand,
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
    icon: SvgNmrRangePicking,
  },
  apodizationDimension1: {
    id: Filters2D.apodizationDimension1.name,
    label: Filters2D.apodizationDimension1.label,
    icon: SvgNmrApodization,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraFilter: [
      {
        info: [{ key: 'isFid', value: true }],
      },
    ],
    isToggle: true,
  },
  apodizationDimension2: {
    id: Filters2D.apodizationDimension2.name,
    label: Filters2D.apodizationDimension2.label,
    icon: SvgNmrApodization,
    hasOptionPanel: true,
    isFilter: true,
    mode: '2D',
    spectraFilter: [
      {
        info: [
          { key: 'isFid', value: true },
          { key: 'isFtDimensionOne', value: true },
          { key: 'isComplex', value: true },
        ],
      },
    ],
    isToggle: true,
  },
};

export function getToolIcon(
  id: Tool,
  idc: IconDataContext = {},
): ToolIconComponent | undefined {
  const option = options[id];

  return 'getIcon' in option ? option.getIcon?.(idc) : option.icon;
}
