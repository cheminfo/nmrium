import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';

import { BaseZeroFillingOptions } from './base/BaseZeroFillingOptions.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

export default function ZeroFillingOptionsPanel(
  props: BaseFilterOptionsPanelProps<ExtractFilterEntry<'zeroFilling'>>,
) {
  return <BaseZeroFillingOptions {...props} />;
}
