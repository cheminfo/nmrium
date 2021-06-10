import lodashGet from 'lodash/get';
import { useCallback, useMemo, useState } from 'react';

export enum SortType {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
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

  const sorthandler = useCallback(
    (event) => {
      let direction = SortType.ASCENDING;
      if (event.target.id) {
        const key = event.target.id;
        if (
          sortConfig &&
          sortConfig.key === key &&
          sortConfig.direction === SortType.ASCENDING
        ) {
          direction = SortType.DESCENDING;
        }
        setSortConfig({ key, direction });
      }
    },
    [sortConfig],
  );

  const isSortedDesc = useCallback(
    (columnName): { flag: boolean | null; content: string } => {
      if (!sortConfig) {
        return { flag: null, content: ' ' };
      }
      return sortConfig.key === columnName
        ? sortConfig.direction === SortType.DESCENDING
          ? { flag: true, content: ' ▼' }
          : { flag: false, content: ' ▲' }
        : { flag: null, content: ' ' };
    },
    [sortConfig],
  );

  return { items: sortedItems, isSortedDesc, onSort: { onClick: sorthandler } };
}
