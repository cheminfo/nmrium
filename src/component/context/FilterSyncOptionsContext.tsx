import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface FilterSyncOptionsState<T> {
  sharedFilterOptions: T | null;
  updateFilterOptions: (options: T) => void;
}

const FilterSyncOptionsContext =
  createContext<FilterSyncOptionsState<any> | null>(null);

export function useFilterSyncOptions<T>(): FilterSyncOptionsState<T> {
  const context = useContext(
    FilterSyncOptionsContext,
  ) as FilterSyncOptionsState<T>;

  if (!context) {
    throw new Error(
      'Filter sync options context must be used within an FilterSyncOptionsProvider',
    );
  }

  return context;
}

export function useSyncedFilterOptions(
  onWatch: (options: any) => void,
  onReset?: () => void,
) {
  const { sharedFilterOptions, updateFilterOptions } = useFilterSyncOptions();
  const isSyncOptionsDirty = useRef(true);

  const watchRef = useRef(onWatch);
  const resetRef = useRef(onReset);

  // Update the ref when onWatch changes
  useEffect(() => {
    watchRef.current = onWatch;
  }, [onWatch]);
  // Update the ref when onWatch changes
  useEffect(() => {
    resetRef.current = onReset;
  }, [onReset]);

  useEffect(() => {
    if (sharedFilterOptions === null) {
      resetRef.current?.();
    }

    if (sharedFilterOptions && isSyncOptionsDirty.current) {
      watchRef.current(sharedFilterOptions);
    } else {
      isSyncOptionsDirty.current = true;
    }
  }, [sharedFilterOptions]);

  const clearSyncFilterOptions = useCallback(() => {
    isSyncOptionsDirty.current = true;
    resetRef.current?.();
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

export function FilterSyncOptionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sharedFilterOptions, updateFilterOptions] = useState<unknown | null>(
    null,
  );

  const state = useMemo(() => {
    return {
      sharedFilterOptions,
      updateFilterOptions: (options) =>
        updateFilterOptions(structuredClone(options)),
    };
  }, [sharedFilterOptions]);

  return (
    <FilterSyncOptionsContext.Provider value={state}>
      {children}
    </FilterSyncOptionsContext.Provider>
  );
}
