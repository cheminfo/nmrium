import { Filters } from 'nmr-processing';

import { LabelStyle } from '../../../elements/Label';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';
import PhaseCorrectionOptionsPanel from './PhaseCorrectionOptionsPanel';
import PhaseCorrectionTwoDimensionsOptionsPanel from './PhaseCorrectionTwoDimensionsOptionsPanel';
import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel';
import BaseLineCorrectionOptionsPanel from './BaseLineCorrectionOptionsPanel';

const {
  apodization,
  phaseCorrection,
  phaseCorrectionTwoDimensions,
  zeroFilling,
  baselineCorrection,
} = Filters;
export const filterOptionPanels = {
  [apodization.id]: ApodizationOptionsPanel,
  [phaseCorrection.id]: PhaseCorrectionOptionsPanel,
  [zeroFilling.id]: ZeroFillingOptionsPanel,
  [phaseCorrectionTwoDimensions.id]: PhaseCorrectionTwoDimensionsOptionsPanel,
  [baselineCorrection.id]: BaseLineCorrectionOptionsPanel,
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
