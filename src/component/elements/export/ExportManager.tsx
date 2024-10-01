import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useExportViewPort } from '../../hooks/useExport';

import { ExportContent } from './ExportContent';

type ExportFormat = 'png' | 'svg';
type ExportDestination = 'file' | 'clipboard';

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

  async function handleExport(targetElement: HTMLElement) {
    if (!exportOptions) {
      return null;
    }

    const { format, destination = 'file' } = exportOptions;

    if (destination === 'file') {
      switch (format) {
        case 'png':
          await saveAsPNGHandler(targetElement);
          break;
        case 'svg':
          await saveAsSVGHandler(targetElement);
          break;

        default:
          break;
      }
    }
    if (destination === 'clipboard') {
      switch (format) {
        case 'png':
          await copyPNGToClipboardHandler(targetElement);
          break;
        default:
          break;
      }
    }

    handleCloseExportOptionsDialog();
  }

  if (!exportOptions) return null;

  return (
    <ExportContent
      onExportReady={handleExport}
      onExportDialogClose={handleCloseExportOptionsDialog}
    >
      {children}
    </ExportContent>
  );
}
