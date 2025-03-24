import type { ExportPreferences, ExportSettings } from 'nmr-load-save';
import type { ReactNode, RefObject } from 'react';
import {
  createContext,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useExportViewPort } from '../../hooks/useExport.js';
import { useWorkspaceExportSettings } from '../../hooks/useWorkspaceExportSettings.js';

import { ExportContent } from './ExportContent.js';

type ExportFormat = 'png' | 'svg';
type ExportDestination = 'file' | 'clipboard';
type ExportHandlers = Record<
  ExportDestination,
  Partial<Record<ExportFormat, (targetElement: HTMLElement) => Promise<void>>>
>;
interface ExportOptions {
  format: ExportFormat;
  destination?: ExportDestination;
}

interface ExportManagerState {
  export: (options: ExportOptions) => void;
  exportFinished: () => void;
}

const ExportManagerContext =
  createContext<RefObject<ExportManagerState> | null>(null);

export function useExportManagerAPI() {
  const context = useContext(ExportManagerContext);

  if (!context) {
    throw new Error(
      'useExportManagerAPI must be used within an ExportManagerProvider',
    );
  }

  return context;
}

interface ExportManagerProviderProps {
  children: ReactNode;
}

export function ExportManagerProvider(props: ExportManagerProviderProps) {
  const { children } = props;
  const ref = useRef<ExportManagerState>(null);

  return (
    <ExportManagerContext.Provider value={ref}>
      {children}
    </ExportManagerContext.Provider>
  );
}

interface ExportManagerControllerProps {
  children: ReactNode;
}

export function ExportManagerController(props: ExportManagerControllerProps) {
  const { children } = props;

  const [exportOptions, triggerExport] = useState<ExportOptions | null>(null);
  const exportRef = useExportManagerAPI();
  const workspaceExportSettings = useWorkspaceExportSettings();
  const { dispatch } = usePreferences();
  useImperativeHandle(
    exportRef,
    () => ({
      export: (options: ExportOptions) => {
        triggerExport(options);
      },
      exportFinished: () => {
        triggerExport(null);
      },
    }),
    [],
  );

  const { saveAsPNGHandler, saveAsSVGHandler, copyPNGToClipboardHandler } =
    useExportViewPort();

  function handleCloseExportOptionsDialog() {
    triggerExport(null);
  }

  function handleExport(targetElement: HTMLElement, options: ExportSettings) {
    if (!exportOptions) {
      return null;
    }

    const { format, destination = 'file' } = exportOptions;

    const handlers: ExportHandlers = {
      file: {
        png: saveAsPNGHandler,
        svg: saveAsSVGHandler,
      },
      clipboard: {
        png: copyPNGToClipboardHandler,
      },
    };

    const runExport = async () => {
      const handler = handlers[destination]?.[format];
      if (handler) {
        try {
          await handler(targetElement);
        } catch {
          handleCloseExportOptionsDialog();
        }
      } else {
        // eslint-disable-next-line no-console
        console.error(
          `Unsupported format '${format}' for destination '${destination}'.`,
        );
      }

      handleCloseExportOptionsDialog();
      dispatch({
        type: 'CHANGE_EXPORT_SETTINGS',
        payload: { key: format, options },
      });
    };
    void runExport();
  }

  const { width } = useChartData();

  if (!exportOptions) return null;

  const { format, destination = 'file' } = exportOptions;

  let exportAs: keyof ExportPreferences = format;

  if (destination === 'clipboard') {
    exportAs = 'clipboard';
  }

  const settings = workspaceExportSettings[exportAs];

  return (
    <ExportContent
      onExportReady={handleExport}
      onExportDialogClose={handleCloseExportOptionsDialog}
      exportOptions={settings}
      defaultExportOptions={settings}
      confirmButtonText={destination === 'clipboard' ? 'Copy' : 'Save'}
      renderOptions={{ minWidth: 800, width }}
    >
      {children}
    </ExportContent>
  );
}
