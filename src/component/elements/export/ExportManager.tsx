import type { ExportPreferences, ExportSettings } from '@zakodium/nmrium-core';
import type { ReactNode, RefObject } from 'react';
import {
  createContext,
  use,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { useExportViewport } from '../../hooks/useExport.js';
import { useWorkspaceExportSettings } from '../../hooks/useWorkspaceExportSettings.js';
import type { BlobObject } from '../../utility/export.js';
import { getBlob } from '../../utility/export.js';

import { ExportContent } from './ExportContent.js';

type ExportFormat = 'png' | 'svg';
type ExportDestination = 'file' | 'clipboard' | 'blob';
type ExportHandlers = Record<
  Exclude<ExportDestination, 'blob'>,
  Partial<Record<ExportFormat, (targetElement: HTMLElement) => Promise<void>>>
>;
interface ExportOptions {
  format: ExportFormat;
  /**
   * Where the figure goes. `blob` hands the SVG to `onBlob`, rendered at the
   * size of the viewer, without asking for export options.
   * @default 'file'
   */
  destination?: ExportDestination;
  /**
   * Receives the figure when `destination` is `blob`: an SVG, or `null` when
   * none could be made.
   * @default undefined
   */
  onBlob?: (blob: BlobObject | null) => void;
}

interface ExportManagerState {
  export: (options: ExportOptions) => void;
  exportFinished: () => void;
}

const ExportManagerContext =
  createContext<RefObject<ExportManagerState | null> | null>(null);

export function useExportManagerAPI() {
  const context = use(ExportManagerContext);

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

  return <ExportManagerContext value={ref}>{children}</ExportManagerContext>;
}

interface ExportManagerControllerProps {
  children: ReactNode;
}

export function ExportManagerController(props: ExportManagerControllerProps) {
  const { children } = props;
  const { data, width, height } = useChartData();
  const hasDataToExport = data.length > 0;
  const [exportOptions, triggerExport] = useState<ExportOptions | null>(null);
  // The caller waiting for the figure of the export in progress, answered
  // however that export ends.
  const pendingBlob = useRef<ExportOptions['onBlob']>(undefined);
  const exportRef = useExportManagerAPI();
  const workspaceExportSettings = useWorkspaceExportSettings();
  const { dispatch } = usePreferences();
  const toaster = useToaster();
  useImperativeHandle(
    exportRef,
    () => ({
      export: (options: ExportOptions) => {
        pendingBlob.current?.(null);
        pendingBlob.current = options.onBlob;
        triggerExport(options);
      },
      exportFinished: () => {
        const onBlob = pendingBlob.current;
        pendingBlob.current = undefined;
        triggerExport(null);
        onBlob?.(null);
      },
    }),
    [],
  );

  const { saveAsPNGHandler, saveAsSVGHandler, copyPNGToClipboardHandler } =
    useExportViewport();

  function handleCloseExportOptionsDialog(blob: BlobObject | null = null) {
    const onBlob = pendingBlob.current;
    pendingBlob.current = undefined;
    triggerExport(null);
    onBlob?.(blob);
  }

  function handleExport(
    targetElement: HTMLElement,
    options: ExportSettings,
  ): void {
    if (!exportOptions) {
      return;
    }

    const { format, destination = 'file' } = exportOptions;

    if (destination === 'blob') {
      handleCloseExportOptionsDialog(
        hasDataToExport && format === 'svg'
          ? getBlob('nmrSVG', { rootElement: targetElement })
          : null,
      );
      return;
    }

    if (!hasDataToExport) {
      handleCloseExportOptionsDialog();
      toaster.show({
        intent: 'danger',
        message: 'No spectra available for export',
      });
      return;
    }

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

  if (!exportOptions) return null;

  const { destination = 'file' } = exportOptions;

  if (destination === 'blob') {
    // The figure keeps the viewer's size, as it is on screen.
    const settings: ExportSettings = {
      mode: 'advance',
      width,
      height,
      unit: 'px',
      dpi: 96,
      useDefaultSettings: true,
    };
    return (
      <ExportContent
        onExportReady={handleExport}
        onExportDialogClose={handleCloseExportOptionsDialog}
        exportOptions={settings}
        renderOptions={{ width, preserveAspectRatio: false }}
      >
        {children}
      </ExportContent>
    );
  }

  let exportAs: keyof ExportPreferences = exportOptions.format;

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
