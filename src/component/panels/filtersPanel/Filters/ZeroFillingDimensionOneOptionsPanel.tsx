import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';

import { BaseZeroFillingOptions } from './base/BaseZeroFillingOptions.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

export default function ZeroFillingDimensionOneOptionsPanel(
  props: BaseFilterOptionsPanelProps<
    ExtractFilterEntry<'zeroFillingDimension1'>
  >,
) {
  return <BaseZeroFillingOptions {...props} />;
}
