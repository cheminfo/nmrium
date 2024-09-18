import { Filters } from 'nmr-processing';

import { LabelStyle } from '../../../elements/Label';

import ApodizationOptionsPanel from './ApodizationOptionsPanel';

const { apodization } = Filters;
export const filterOptionPanels = {
  [apodization.id]: ApodizationOptionsPanel,
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
