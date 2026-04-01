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

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import { useFilter } from '../hooks/useFilter.ts';
import useSpectrum from '../hooks/useSpectrum.ts';

import { useChartData } from './ChartContext.tsx';

type FilterSyncOptionsUpdater<T> = T | null | ((prev: T | null) => T | null);

interface FilterSyncOptionsState<T> {
  sharedFilterOptions: T | null;
  updateFilterOptions: (options: FilterSyncOptionsUpdater<T>) => void;
}

const FilterSyncOptionsContext =
  createContext<FilterSyncOptionsState<unknown> | null>(null);

export function useFilterSyncOptions<T>(): FilterSyncOptionsState<T> {
  const context = useContext(FilterSyncOptionsContext);

  if (!context) {
    throw new Error(
      'Filter sync options context must be used within a FilterSyncOptionsProvider',
    );
  }

  return context as FilterSyncOptionsState<T>;
}

export function useSyncedFilterOptions<T>(
  onWatch: (options: T) => void,
  onReset?: () => void,
) {
  const { sharedFilterOptions, updateFilterOptions } = useFilterSyncOptions<T>();
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
    (options: T) => {
      isSyncOptionsDirty.current = false;
      updateFilterOptions(options);
    },
    [updateFilterOptions],
  );

  return { clearSyncFilterOptions, syncFilterOptions };
}

export function FilterSyncOptionsProvider({ children }: { children: ReactNode }) {
  const [sharedFilterOptions, setSharedFilterOptions] = useState<unknown | null>(null);

  const filter = useFilter('baselineCorrection');
  const { toolOptions: { selectedTool } } = useChartData();
  const spectrum = useSpectrum();

  const updateFilterOptions = useCallback(
    (options: FilterSyncOptionsUpdater<unknown>) => {
      setSharedFilterOptions((prev: any) => {
        const next = typeof options === 'function' ? options(prev) : options;
        return structuredClone(next);
      });
    },
    [],
  );

  const baseOptions = useMemo(() => {
    const isBaselineCorrection =
      filter && selectedTool === 'baselineCorrection' && isSpectrum1D(spectrum);

    if (!isBaselineCorrection) return null;

    const anchors = Array.from(filter.value.anchors?.x ?? []).map((index: number) => ({
      id: crypto.randomUUID(),
      x: spectrum.data?.x[index],
    }));

    return { ...filter.value, anchors };
  }, [filter, selectedTool, spectrum]);

  const state = useMemo<FilterSyncOptionsState<unknown>>(() => ({
    sharedFilterOptions: baseOptions
      ? { ...baseOptions, ...(sharedFilterOptions as any) }
      : sharedFilterOptions,
    updateFilterOptions,
  }), [baseOptions, sharedFilterOptions, updateFilterOptions]);

  return (
    <FilterSyncOptionsContext.Provider value={state}>
      {children}
    </FilterSyncOptionsContext.Provider>
  );
}