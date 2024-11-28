import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';

import { BaseApodizationOptions } from './base/BaseApodizationOptions.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

export default function ApodizationDimensionOneOptionsPanel(
  props: BaseFilterOptionsPanelProps<
    ExtractFilterEntry<'apodizationDimension1'>
  >,
) {
  const { filter, enableEdit = true, onCancel, onConfirm } = props;

  return (
    <BaseApodizationOptions
      enableEdit={enableEdit}
      filter={filter}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
