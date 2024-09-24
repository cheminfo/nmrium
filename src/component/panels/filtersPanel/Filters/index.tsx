import { Filters } from 'nmr-processing';

import { LabelStyle } from '../../../elements/Label';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';
import BaseLineCorrectionOptionsPanel from './BaseLineCorrectionOptionsPanel';
import PhaseCorrectionOptionsPanel from './PhaseCorrectionOptionsPanel';
import PhaseCorrectionTwoDimensionsOptionsPanel from './PhaseCorrectionTwoDimensionsOptionsPanel';
import ShiftOptionsPanel from './ShiftOptionsPanel';
import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel';

const {
  apodization,
  phaseCorrection,
  phaseCorrectionTwoDimensions,
  zeroFilling,
  baselineCorrection,
  shiftX,
  shift2DX,
  shift2DY,
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
};

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
