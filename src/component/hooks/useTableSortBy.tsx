import lodashGet from 'lodash/get';
import { useCallback, useMemo, useState } from 'react';

export enum SortType {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
  ORIGINAL = 'original',
}

interface SortConfig {
  key: string;
  direction: SortType;
}

export default function useTableSortBy(items, config = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(config);
  const sortedItems = useMemo(() => {
    const sortableItems = items.slice();
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.direction === SortType.ASCENDING) {
          return (
            lodashGet(a, sortConfig.key, 0) - lodashGet(b, sortConfig.key, 0)
          );
        } else if (sortConfig.direction === SortType.DESCENDING) {
          return (
            lodashGet(b, sortConfig.key, 0) - lodashGet(a, sortConfig.key, 0)
          );
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const sortHandler = useCallback(
    (event) => {
      const key = event.currentTarget?.id;
      let direction = SortType.ASCENDING;
      if (key && sortConfig && sortConfig.key === key) {
        switch (sortConfig.direction) {
          case SortType.ASCENDING:
            direction = SortType.DESCENDING;

            break;
          case SortType.DESCENDING:
            direction = SortType.ORIGINAL;

            break;
          default:
            direction = SortType.ASCENDING;

            break;
        }
      }
      setSortConfig({ key, direction });
    },
    [sortConfig],
  );

  const isSortedDesc = useCallback(
    (columnName): { flag: boolean | null; content: string } => {
      const defaultContent = { flag: null, content: ' ' };

      if (!sortConfig || sortConfig.key !== columnName) {
        return defaultContent;
      }
      switch (sortConfig.direction) {
        case SortType.DESCENDING:
          return { flag: true, content: ' ▼' };

        case SortType.ASCENDING:
          return { flag: false, content: ' ▲' };

        default:
          return defaultContent;
      }
    },
    [sortConfig],
  );

  return { items: sortedItems, isSortedDesc, onSort: { onClick: sortHandler } };
}
