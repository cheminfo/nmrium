import React, { createContext, useContext, useMemo, useState } from 'react';

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

export function FilterSyncOptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sharedFilterOptions, updateFilterOptions] = useState<unknown | null>(
    null,
  );

  const state = useMemo(() => {
    return {
      sharedFilterOptions,
      updateFilterOptions: (options) => updateFilterOptions({ ...options }),
    };
  }, [sharedFilterOptions]);

  return (
    <FilterSyncOptionsContext.Provider value={state}>
      {children}
    </FilterSyncOptionsContext.Provider>
  );
}
