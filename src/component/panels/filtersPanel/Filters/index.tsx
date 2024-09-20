import { Filters } from 'nmr-processing';

import { LabelStyle } from '../../../elements/Label';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';
import PhaseCorrectionOptionsPanel from './PhaseCorrectionOptionsPanel';

const { apodization, phaseCorrection } = Filters;
export const filterOptionPanels = {
  [apodization.id]: ApodizationOptionsPanel,
  [phaseCorrection.id]: PhaseCorrectionOptionsPanel,
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
