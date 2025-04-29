import type {
  AdvanceExportSettings,
  BasicExportSettings,
  ExportSettings,
} from '@zakodium/nmrium-core';

import { getPageDimension } from '../../print/pageSize.js';

type ReturnExportOptions = Omit<AdvanceExportSettings, 'mode'>;

const INITIAL_ADVANCE_EXPORT_OPTIONS: ExportSettings = {
  mode: 'advance',
  dpi: 300,
  width: 21,
  height: 14.8,
  unit: 'cm',
  useDefaultSettings: false,
};
export const INITIAL_BASIC_EXPORT_OPTIONS: ExportSettings = {
  mode: 'basic',
  size: 'A5',
  layout: 'landscape',
  dpi: 300,
  useDefaultSettings: false,
};

function isBasicOptions(
  options: ExportSettings,
): options is BasicExportSettings {
  const { mode } = options;
  return mode === 'basic';
}

export function getExportOptions(options: ExportSettings): ReturnExportOptions {
  const { mode, ...otherOptions } = options;

  if (isBasicOptions(options)) {
    const { size, layout, mode, ...other } = options;
    const { width = 0, height = 0 } = getPageDimension(size, layout) || {};
    return { width, height, unit: 'cm', ...other };
  }

  return otherOptions as ReturnExportOptions;
}

export function getExportDefaultOptions(options?: ExportSettings) {
  if (!options || isBasicOptions(options)) {
    return options || INITIAL_BASIC_EXPORT_OPTIONS;
  }

  return options || INITIAL_ADVANCE_EXPORT_OPTIONS;
}
export function getExportDefaultOptionsByMode(mode: 'basic' | 'advance') {
  if (mode === 'basic') {
    return INITIAL_BASIC_EXPORT_OPTIONS;
  }

  return INITIAL_ADVANCE_EXPORT_OPTIONS;
}
