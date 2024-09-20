import { useCallback, useEffect, useRef } from 'react';

import { useFilterSyncOptions } from '../../../context/FilterSyncOptionsContext';

export function useSyncedFilterOptions(onWatch: (options: any) => void) {
  const { sharedFilterOptions, updateFilterOptions } = useFilterSyncOptions();
  const isSyncOptionsDirty = useRef(true);

  const watchRef = useRef(onWatch);

  // Update the ref when onWatch changes
  useEffect(() => {
    watchRef.current = onWatch;
  }, [onWatch]);

  useEffect(() => {
    if (sharedFilterOptions && isSyncOptionsDirty.current) {
      watchRef.current(sharedFilterOptions);
    } else {
      isSyncOptionsDirty.current = true;
    }
  }, [sharedFilterOptions]);

  const clearSyncFilterOptions = useCallback(() => {
    isSyncOptionsDirty.current = true;
    updateFilterOptions(null);
  }, [updateFilterOptions]);

  const syncFilterOptions = useCallback(
    (options) => {
      isSyncOptionsDirty.current = false;
      updateFilterOptions(options);
    },
    [updateFilterOptions],
  );

  return { clearSyncFilterOptions, syncFilterOptions };
}
