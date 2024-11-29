import { useFilter } from '../hooks/useFilter.js';
import { getDefaultFilterOptions } from '../utility/getDefaultFilterOptions.js';

import { BaseSimpleZeroFillingOptionsPanel } from './base/BaseSimpleZeroFillingOptionsPanel.js';

const defaultOptions = getDefaultFilterOptions('zeroFillingDimension2');

export function SimpleZeroFillingDimensionTwoOptionsPanel() {
  const filter = useFilter('zeroFillingDimension2');

  return (
    <BaseSimpleZeroFillingOptionsPanel filter={filter || defaultOptions} />
  );
}
