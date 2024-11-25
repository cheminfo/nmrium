import { memo, useCallback } from 'react';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useFilter } from '../hooks/useFilter.js';

import { BaseSimpleApodizationOptionsPanel } from './BaseSimpleApodizationOptionsPanel.js';

interface ApodizationOptionsInnerPanelProps {
  filter: ExtractFilterEntry<'apodizationDimension2'> | null;
}

function ApodizationOptionsInnerPanel(
  props: ApodizationOptionsInnerPanelProps,
) {
  const dispatch = useDispatch();

  const applyHandler = useCallback(
    (data) => {
      const { options } = data;
      dispatch({
        type: 'APPLY_APODIZATION_DIMENSION_TWO_FILTER',
        payload: { options },
      });
    },
    [dispatch],
  );
  const changeHandler = useCallback(
    (data) => {
      const { livePreview, options } = data;

      dispatch({
        type: 'CALCULATE_APODIZATION_DIMENSION_TWO_FILTER',
        payload: { livePreview, options: structuredClone(options) },
      });
    },
    [dispatch],
  );

  return (
    <BaseSimpleApodizationOptionsPanel
      filter={props.filter}
      onApplyDispatch={applyHandler}
      onChangeDispatch={changeHandler}
    />
  );
}

const MemoizedApodizationPanel = memo(ApodizationOptionsInnerPanel);

export function SimpleApodizationDimensionTwoOptionsPanel() {
  const filter = useFilter('apodizationDimension2');
  return <MemoizedApodizationPanel filter={filter} />;
}
