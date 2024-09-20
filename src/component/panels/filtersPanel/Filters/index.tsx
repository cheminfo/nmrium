import { Filters } from 'nmr-processing';

import { LabelStyle } from '../../../elements/Label';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';
import PhaseCorrectionOptionsPanel from './PhaseCorrectionOptionsPanel';
import ZeroFillingOptionsPanel from './ZeroFillingOptionsPanel';

const { apodization, phaseCorrection, zeroFilling } = Filters;
export const filterOptionPanels = {
  [apodization.id]: ApodizationOptionsPanel,
  [phaseCorrection.id]: PhaseCorrectionOptionsPanel,
  [phaseCorrection.id]: PhaseCorrectionOptionsPanel,
  [zeroFilling.id]: ZeroFillingOptionsPanel,
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
