import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

export interface ExportSettingsContextProps {
  width: number;
  height: number;
}

const ExportSettingsContext = createContext<ExportSettingsContextProps | null>(
  null,
);

export function useExportSettings() {
  return useContext(ExportSettingsContext);
}

interface ExportSettingsProviderProps extends ExportSettingsContextProps {
  children: ReactNode;
}

export function ExportSettingsProvider(props: ExportSettingsProviderProps) {
  const { children, width, height } = props;

  const state = useMemo(() => {
    return {
      width,
      height,
    };
  }, [height, width]);

  return (
    <ExportSettingsContext.Provider value={state}>
      {children}
    </ExportSettingsContext.Provider>
  );
}
