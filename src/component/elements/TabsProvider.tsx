import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

type TabId = string | number;

interface TabsContextOptions<T extends TabId = TabId> {
  selectedTabId: T | undefined;
  selectTab: (id: T) => void;
}

const TabsContext = createContext<TabsContextOptions | undefined>(undefined);

interface TabsProviderProps<T extends TabId> {
  children: ReactNode;
  defaultSelectedTabId?: T;
}

export function TabsProvider<T extends TabId>(props: TabsProviderProps<T>) {
  const { defaultSelectedTabId, children } = props;
  const [selectedTabId, setSelectedTabId] = useState<T | undefined>(
    defaultSelectedTabId,
  );

  const tabState = useMemo(() => {
    return {
      selectTab: (tabId) => tabId !== undefined && setSelectedTabId(tabId),
      selectedTabId,
    };
  }, [selectedTabId]);

  return (
    <TabsContext.Provider value={tabState}>{children}</TabsContext.Provider>
  );
}

export function useTabsController<T extends TabId>() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsProvider');
  }
  return context as unknown as TabsContextOptions<T>;
}
