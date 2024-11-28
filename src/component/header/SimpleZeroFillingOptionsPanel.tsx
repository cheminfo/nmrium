import { useFilter } from '../hooks/useFilter.js';

import { BaseSimpleZeroFillingOptionsPanel } from './base/BaseSimpleZeroFillingOptionsPanel.js';

export function SimpleZeroFillingOptionsPanel() {
  const filter = useFilter('zeroFilling');

  return <BaseSimpleZeroFillingOptionsPanel filter={filter} />;
}
