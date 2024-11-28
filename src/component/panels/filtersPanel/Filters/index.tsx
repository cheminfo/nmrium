import type { ButtonProps } from '@blueprintjs/core';
import { Filters1D, Filters2D } from 'nmr-processing';

import type { LabelStyle } from '../../../elements/Label.js';

import ApodizationDimensionOneOptionsPanel from './ApodizationDimensionOneOptionsPanel.js';
import ApodizationDimensionTwoOptionsPanel from './ApodizationDimensionTwoOptionsPanel.js';
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
  zeroFilling,
  baselineCorrection,
  shiftX,
  exclusionZones,
} = Filters1D;

const {
  shift2DX,
  shift2DY,
  phaseCorrectionTwoDimensions,
  apodizationDimension1,
  apodizationDimension2,
} = Filters2D;

export const filterOptionPanels = {
  [apodization.name]: ApodizationOptionsPanel,
  [apodizationDimension1.name]: ApodizationDimensionOneOptionsPanel,
  [apodizationDimension2.name]: ApodizationDimensionTwoOptionsPanel,
  [phaseCorrection.name]: PhaseCorrectionOptionsPanel,
  [zeroFilling.name]: ZeroFillingOptionsPanel,
  [phaseCorrectionTwoDimensions.name]: PhaseCorrectionTwoDimensionsOptionsPanel,
  [baselineCorrection.name]: BaseLineCorrectionOptionsPanel,
  [shiftX.name]: ShiftOptionsPanel,
  [shift2DX.name]: ShiftOptionsPanel,
  [shift2DY.name]: ShiftOptionsPanel,
  [exclusionZones.name]: ExclusionZonesOptionsPanel,
};

export interface BaseFilterOptionsPanelProps<T> {
  filter: T;
  enableEdit: boolean;
  onConfirm: ButtonProps['onClick'];
  onCancel: ButtonProps['onClick'];
}

export interface BaseFilterDispatchActions<T> {
  onApplyDispatch: (options: T) => void;
  onChangeDispatch: (options: T) => void;
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
