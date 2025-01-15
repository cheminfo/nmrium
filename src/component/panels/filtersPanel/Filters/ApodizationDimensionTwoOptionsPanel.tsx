import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';

import { BaseApodizationOptions } from './base/BaseApodizationOptions.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

export default function ApodizationDimensionTwoOptionsPanel(
  props: BaseFilterOptionsPanelProps<
    ExtractFilterEntry<'apodizationDimension2'>
  >,
) {
  const { filter, enableEdit = true, onCancel, onConfirm, onEditStart } = props;

  return (
    <BaseApodizationOptions
      enableEdit={enableEdit}
      filter={filter}
      onCancel={onCancel}
      onConfirm={onConfirm}
      onEditStart={onEditStart}
    />
  );
}
