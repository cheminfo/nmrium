import { useMemo } from 'react';

import { databases } from '../../../data/data1d/database';
import { usePreferences } from '../../context/PreferencesContext';

export function useDatabases() {
  const { current } = usePreferences();

  return useMemo(() => {
    const data = current.databases || [];
    return databases.concat(data);
  }, [current.databases]);
}
