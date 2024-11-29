import { useFilter } from '../hooks/useFilter.js';
import { getDefaultFilterOptions } from '../utility/getDefaultFilterOptions.js';

import { BaseSimpleZeroFillingOptionsPanel } from './base/BaseSimpleZeroFillingOptionsPanel.js';

const defaultOptions = getDefaultFilterOptions('zeroFillingDimension1');

export function SimpleZeroFillingDimensionOneOptionsPanel() {
  const filter = useFilter('zeroFillingDimension1');

  return (
    <BaseSimpleZeroFillingOptionsPanel filter={filter || defaultOptions} />
  );
}
