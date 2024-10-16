import type { ButtonProps } from '@blueprintjs/core';
import type { Filter } from 'nmr-processing';
import { Filters } from 'nmr-processing';

import type { LabelStyle } from '../../../elements/Label.js';

import ApodizationOptionsPanel from './ApodizationOptionsPanel.js';
import BaseLineCorrectionOptionsPanel from './BaseLineCorrectionOptionsPanel.js';
import ExclusionZonesOptionsPanel from './ExclusionZonesOptionsPanel.js';
import PhaseCorrectionOptionsPanel from './PhaseCorrectionOptionsPanel.js';
import PhaseCorrectionTwoDimensionsOptionsPanel from './PhaseCorrectionTwoDimensionsOptionsPanel.js';
import ShiftOptionsPanel from './ShiftOptionsPanel.js';
import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel.js';

const {
  apodization,
  phaseCorrection,
  phaseCorrectionTwoDimensions,
  zeroFilling,
  baselineCorrection,
  shiftX,
  shift2DX,
  shift2DY,
  exclusionZones,
} = Filters;
export const filterOptionPanels = {
  [apodization.id]: ApodizationOptionsPanel,
  [phaseCorrection.id]: PhaseCorrectionOptionsPanel,
  [zeroFilling.id]: ZeroFillingOptionsPanel,
  [phaseCorrectionTwoDimensions.id]: PhaseCorrectionTwoDimensionsOptionsPanel,
  [baselineCorrection.id]: BaseLineCorrectionOptionsPanel,
  [shiftX.id]: ShiftOptionsPanel,
  [shift2DX.id]: ShiftOptionsPanel,
  [shift2DY.id]: ShiftOptionsPanel,
  [exclusionZones.id]: ExclusionZonesOptionsPanel,
};

export interface BaseFilterOptionsPanelProps {
  filter: Filter;
  enableEdit: boolean;
  onConfirm: ButtonProps['onClick'];
  onCancel: ButtonProps['onClick'];
}

export const formLabelStyle: LabelStyle = {
  label: {
    flex: 5,
  },
  wrapper: {
    flex: 7,
  },
  container: {
    marginBottom: '5px',
  },
};
