import { ExportPreferences, ExportSettings } from 'nmr-load-save';
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useExportViewPort } from '../../hooks/useExport';
import { useWorkspaceExportSettings } from '../../hooks/useWorkspaceExportSettings';

import { ExportContent } from './ExportContent';
import { getSizeInPixel } from './utilities/getSizeInPixel';

export type ExportFormat = 'png' | 'svg';
export type ExportDestination = 'file' | 'clipboard';

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

  async function handleExport(
    targetElement: HTMLElement,
    options: ExportSettings,
  ) {
    if (!exportOptions) {
      return null;
    }

    const { format, destination = 'file' } = exportOptions;
    let exportKey: keyof ExportPreferences = format;

    const sizeInPixel = getSizeInPixel(options);

    if (destination === 'file') {
      switch (format) {
        case 'png':
          await saveAsPNGHandler(targetElement, sizeInPixel);
          break;
        case 'svg':
          await saveAsSVGHandler(targetElement, sizeInPixel);
          break;

        default:
          // eslint-disable-next-line no-console
          console.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Unsupported format '${format}' for destination 'file'.`,
          );
          break;
      }
    }
    if (destination === 'clipboard') {
      exportKey = 'clipboard';
      switch (format) {
        case 'png':
          await copyPNGToClipboardHandler(targetElement, sizeInPixel);
          break;
        default:
          // eslint-disable-next-line no-console
          console.error(
            `Unsupported format '${format}' for destination 'clipboard'.`,
          );
          break;
      }
    }
    handleCloseExportOptionsDialog();
    dispatch({
      type: 'CHANGE_EXPORT_SETTINGS',
      payload: { key: exportKey, options },
    });
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
      renderOptions={{ minWidth: 800, width, rescale: format !== 'svg' }}
    >
      {children}
    </ExportContent>
  );
}
