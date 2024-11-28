import { memo } from 'react';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import { useFilter } from '../hooks/useFilter.js';
import { getDefaultFilterOptions } from '../utility/getDefaultFilterOptions.js';

import { BaseSimpleApodizationOptionsPanel } from './base/BaseSimpleApodizationOptionsPanel.js';

const defaultOptions = getDefaultFilterOptions('apodization');
interface ApodizationOptionsInnerPanelProps {
  filter: ExtractFilterEntry<'apodization'> | null;
}

function ApodizationOptionsInnerPanel(
  props: ApodizationOptionsInnerPanelProps,
) {
  return (
    <BaseSimpleApodizationOptionsPanel
      filter={props.filter || defaultOptions}
    />
  );
}

const MemoizedApodizationPanel = memo(ApodizationOptionsInnerPanel);

export function SimpleApodizationOptionsPanel() {
  const filter = useFilter('apodization');
  return <MemoizedApodizationPanel filter={filter} />;
}
