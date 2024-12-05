import { memo } from 'react';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import { useFilter } from '../hooks/useFilter.js';
import { getDefaultFilterOptions } from '../utility/getDefaultFilterOptions.js';

import { BaseSimpleApodizationOptionsPanel } from './base/BaseSimpleApodizationOptionsPanel.js';

const defaultOptions = getDefaultFilterOptions('apodizationDimension1');

interface ApodizationOptionsInnerPanelProps {
  filter: ExtractFilterEntry<'apodizationDimension2'> | null;
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

export function SimpleApodizationDimensionTwoOptionsPanel() {
  const filter = useFilter('apodizationDimension2');
  return <MemoizedApodizationPanel filter={filter} />;
}
