import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

interface ExportSettingsContextProps {
  width: number;
  height: number;
  exportWidth?: number;
  exportHeight?: number;
}

const ExportSettingsContext =
  createContext<Required<ExportSettingsContextProps> | null>(null);

export function useExportSettings() {
  return use(ExportSettingsContext);
}

interface ExportSettingsProviderProps extends ExportSettingsContextProps {
  children: ReactNode;
}

export function ExportSettingsProvider(props: ExportSettingsProviderProps) {
  const { children, width, height, exportWidth, exportHeight } = props;

  const state = useMemo(() => {
    return {
      width,
      height,
      exportWidth: exportWidth ?? width,
      exportHeight: exportHeight ?? height,
    };
  }, [exportHeight, exportWidth, height, width]);

  return (
    <ExportSettingsContext value={state}>{children}</ExportSettingsContext>
  );
}
