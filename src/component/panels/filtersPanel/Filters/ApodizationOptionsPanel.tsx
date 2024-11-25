import { useCallback } from 'react';

import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../context/DispatchContext.js';

import { BaseApodizationOptions } from './apodization/BaseApodizationOptions.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

export default function ApodizationOptionsPanel(
  props: BaseFilterOptionsPanelProps<ExtractFilterEntry<'apodization'>>,
) {
  const dispatch = useDispatch();

  const { filter, enableEdit = true, onCancel, onConfirm } = props;

  const applyHandler = useCallback(
    (data) => {
      const { options } = data;
      dispatch({
        type: 'APPLY_APODIZATION_FILTER',
        payload: { options },
      });
    },
    [dispatch],
  );
  const changeHandler = useCallback(
    (data) => {
      const { livePreview, options } = data;

      dispatch({
        type: 'CALCULATE_APODIZATION_FILTER',
        payload: { livePreview, options: structuredClone(options) },
      });
    },
    [dispatch],
  );

  return (
    <BaseApodizationOptions
      enableEdit={enableEdit}
      filter={filter}
      onCancel={onCancel}
      onConfirm={onConfirm}
      onApplyDispatch={applyHandler}
      onChangeDispatch={changeHandler}
    />
  );
}
