import dlv from 'dlv';
import type { Spectrum } from 'nmr-load-save';
import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import nucleusToString from '../utility/nucleusToString.js';

type SortDirection = 'asc' | 'desc' | null;
type SpectraReference = { id: string } & Partial<Record<string, any>>;

interface BaseSortOptions {
  sortDirection?: SortDirection;
}

interface SortByReferenceOptions extends BaseSortOptions {
  path: string;
  sortByReferences: SpectraReference[];
  sortType: 'sortByReference';
}
interface SortByReferenceIndexesOptions {
  sortByReferences: SpectraReference[];
  sortType: 'sortByReferenceIndexes';
}

interface SortByPathOptions extends BaseSortOptions {
  path: string;
  nucleus?: string;
  sortType: 'sortByPath';
}

type SortOptions =
  | SortByPathOptions
  | SortByReferenceOptions
  | SortByReferenceIndexesOptions;

type SortFuncOptions = SortOptions & { activeSort?: string };

interface SortSpectraContextState {
  sortOptions: SortOptions | null;
  sort: (options: SortFuncOptions) => void;
  reset: () => void;
  activeSort: string | null;
}

const SortSpectraContext = createContext<SortSpectraContextState | null>(null);

export function useSortSpectra(): SortSpectraContextState {
  const context = useContext(SortSpectraContext);
  if (!context) {
    throw new Error('useSpectra must be used within a SpectraProvider');
  }

  return context;
}

interface SpectraProviderProps {
  children: ReactNode;
}

function sortSpectraByPath(
  originSpectra: Spectrum[],
  sortOptions: SortByPathOptions,
) {
  const outSpectra = [...originSpectra];
  const { path, sortDirection, nucleus } = sortOptions;

  const sortedSpectra: SortItem[] = [];
  const originIndexes: number[] = [];

  for (let index = 0; index < originSpectra.length; index++) {
    const spectrum = originSpectra[index];
    if (
      !nucleus ||
      (nucleus && nucleusToString(spectrum.info.nucleus) === nucleus)
    ) {
      sortedSpectra.push({
        spectrum,
        sortValue: dlv(spectrum, path),
      });
      originIndexes.push(index);
    }
  }

  sortArray(sortedSpectra, sortDirection);

  for (let index = 0; index < sortedSpectra.length; index++) {
    outSpectra[originIndexes[index]] = sortedSpectra[index].spectrum;
  }
  return outSpectra;
}

function sortSpectraByReferences(
  originSpectra: Spectrum[],
  sortOptions: SortByReferenceOptions,
) {
  const outSpectra = [...originSpectra];
  const { path, sortDirection, sortByReferences } = sortOptions;

  const spectraReferenceMap = new Map<string, SpectraReference>();
  const sortedSpectra: SortItem[] = [];
  const originIndexes: number[] = [];

  for (const reference of sortByReferences || []) {
    spectraReferenceMap.set(reference.id, reference);
  }

  for (let index = 0; index < originSpectra.length; index++) {
    const spectrum = originSpectra[index];
    if (spectraReferenceMap.size > 0 && spectraReferenceMap.has(spectrum.id)) {
      sortedSpectra.push({
        spectrum,
        sortValue: dlv(spectraReferenceMap.get(spectrum.id), path),
      });
      originIndexes.push(index);
    }
  }
  sortArray(sortedSpectra, sortDirection);

  for (let index = 0; index < sortedSpectra.length; index++) {
    outSpectra[originIndexes[index]] = sortedSpectra[index].spectrum;
  }
  return outSpectra;
}
function sortSpectraByReferenceIndexes(
  originSpectra: Spectrum[],
  sortOptions: SortByReferenceIndexesOptions,
) {
  const { sortByReferences } = sortOptions;
  const outSpectra = [...originSpectra];
  const spectraReferenceMap = new Map<string, SpectraReference>();
  const originIndexes: number[] = [];
  const sortedSpectra = new Map<string, Spectrum>();

  for (const reference of sortByReferences || []) {
    spectraReferenceMap.set(reference.id, reference);
  }

  for (let index = 0; index < originSpectra.length; index++) {
    const spectrum = originSpectra[index];
    if (spectraReferenceMap.size > 0 && spectraReferenceMap.has(spectrum.id)) {
      originIndexes.push(index);
      sortedSpectra.set(spectrum.id, spectrum);
    }
  }

  for (let index = 0; index < originIndexes.length; index++) {
    const spectrum = sortedSpectra.get(sortByReferences[index].id);
    if (spectrum) {
      outSpectra[originIndexes[index]] = spectrum;
    }
  }
  return outSpectra;
}

interface SortItem {
  spectrum: Spectrum;
  sortValue: string | number | boolean | null | undefined;
}

function sortArray(data: SortItem[], sortDirection?: SortDirection) {
  const direction = sortDirection === 'asc' ? 1 : -1;

  if (!sortDirection) {
    return data;
  }

  data.sort((a, b) => {
    const valueA = a.sortValue;
    const valueB = b.sortValue;

    if (valueA == null && valueB != null) return -1 * direction;
    if (valueB == null && valueA != null) return 1 * direction;
    if (valueA == null && valueB == null) return 0;

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction * valueA.localeCompare(valueB);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction * (valueA - valueB);
    }

    if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
      return direction * (Number(valueA) - Number(valueB));
    }

    return 0;
  });
}

export function sortSpectra(
  originSpectra: Spectrum[],
  sortOptions: SortOptions,
) {
  const { sortType } = sortOptions;
  switch (sortType) {
    case 'sortByPath':
      return sortSpectraByPath(originSpectra, sortOptions);
    case 'sortByReference':
      return sortSpectraByReferences(originSpectra, sortOptions);
    case 'sortByReferenceIndexes':
      return sortSpectraByReferenceIndexes(originSpectra, sortOptions);

    default:
      return originSpectra;
  }
}

function getNextSortType(currentSort: SortDirection): SortDirection {
  if (currentSort === null) return 'asc';
  if (currentSort === 'asc') return 'desc';
  return null;
}

export function SortSpectraProvider(props: SpectraProviderProps) {
  const { children } = props;
  const [sortOptions, setSortOptions] = useState<SortOptions | null>(null);
  const [activeSort, setActiveSort] = useState<string | null>(null);

  const sort = useCallback(
    (options: SortFuncOptions) => {
      setActiveSort(options?.activeSort ?? null);
      setSortOptions((prevOptions) => {
        if (options.sortType !== 'sortByReferenceIndexes') {
          let previousOptions = { ...prevOptions };
          if (activeSort !== options.activeSort) {
            previousOptions = { ...prevOptions, sortDirection: null };
          }
          const newOptions: SortOptions = {
            ...previousOptions,
            ...options,
            sortDirection:
              options.sortDirection ??
              getNextSortType(
                (previousOptions as BaseSortOptions)?.sortDirection ?? null,
              ),
          };
          return newOptions;
        }

        return {
          ...prevOptions,
          ...options,
        };
      });
    },
    [activeSort],
  );

  const state = useMemo(() => {
    function reset() {
      setSortOptions(null);
    }
    return {
      activeSort,
      sortOptions,
      sort,
      reset,
    };
  }, [activeSort, sort, sortOptions]);

  return (
    <SortSpectraContext.Provider value={state}>
      {children}
    </SortSpectraContext.Provider>
  );
}
