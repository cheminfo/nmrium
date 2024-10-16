/** @jsxImportSource @emotion/react */
import type { ExportSettings } from 'nmr-load-save';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ExportOptionsModal } from './ExportOptionsModal.js';
import { ExportSettingsProvider } from './ExportSettingsProvider.js';
import { RenderDetector } from './RenderDetector.js';
import { INITIAL_BASIC_EXPORT_OPTIONS } from './utilities/getExportOptions.js';
import { getSizeInPixel } from './utilities/getSizeInPixel.js';
import { transferDocumentStyles } from './utilities/transferDocumentStyles.js';

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

export interface BaseExportProps {
  onExportOptionsChange: (options: ExportSettings) => void;
  defaultExportOptions?: ExportSettings;
}

interface RenderSizeOption {
  width: number;
  minWidth?: number;
  rescale?: boolean;
}
interface BaseExportFrameProps {
  children: ReactNode;
  onExportReady: (
    documentElement: HTMLElement,
    options: ExportSettings,
  ) => void;
  renderOptions: RenderSizeOption;
}
interface InnerExportFrameProps extends BaseExportFrameProps {
  exportOptions: ExportSettings;
}
interface ExportFrameProps
  extends BaseExportFrameProps,
    Partial<BaseExportProps> {
  exportOptions?: ExportSettings;
  onExportDialogClose?: () => void;
  confirmButtonText?: string;
}

export function ExportContent(props: ExportFrameProps) {
  const [innerExportOptions, setInnerExportOptions] =
    useState<ExportSettings | null>();

  const {
    children,
    exportOptions,
    defaultExportOptions,
    onExportOptionsChange,
    onExportReady,
    onExportDialogClose,
    confirmButtonText = 'Save',
    renderOptions,
  } = props;

  if (!innerExportOptions && exportOptions?.useDefaultSettings === false) {
    return (
      <ExportOptionsModal
        isOpen
        onCloseDialog={() => {
          onExportDialogClose?.();
        }}
        onExportOptionsChange={(options) => {
          onExportOptionsChange?.(options);
          setInnerExportOptions(options);
        }}
        defaultExportOptions={defaultExportOptions}
        confirmButtonText={confirmButtonText}
      />
    );
  }

  const options =
    innerExportOptions ||
    exportOptions ||
    defaultExportOptions ||
    INITIAL_BASIC_EXPORT_OPTIONS;

  return (
    <>
      <div
        style={{
          backgroundColor: 'white',
          opacity: 0.5,
          left: 0,
          top: 0,
          position: 'fixed',
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}
      />
      <InnerPrintFrame
        exportOptions={options}
        onExportReady={onExportReady}
        renderOptions={renderOptions}
      >
        {children}
      </InnerPrintFrame>
    </>
  );
}

export function InnerPrintFrame(props: InnerExportFrameProps) {
  const { children, exportOptions, onExportReady, renderOptions } = props;
  const { width, height } = getSizeInPixel(exportOptions);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [content, setContent] = useState<HTMLElement>();

  const load = useCallback(() => {
    const contentWindow = frameRef.current?.contentWindow;
    if (!contentWindow) return;
    const document = contentWindow.document;

    setContent(document.body);

    transferDocumentStyles(document);
    return contentWindow;
  }, []);

  useEffect(() => {
    if (!isFirefox) {
      load();
    }
  }, [load]);

  let widthInPixel = Math.round(width);
  let heightInPixel = Math.round(height);

  const {
    width: baseRenderWidth,
    rescale = true,
    minWidth = 0,
  } = renderOptions;

  if (rescale) {
    const renderWidth = Math.max(baseRenderWidth, minWidth);
    widthInPixel = Math.round(renderWidth);
    heightInPixel = Math.round((height / width) * renderWidth);
  }

  return (
    <ExportSettingsProvider width={widthInPixel} height={heightInPixel}>
      <iframe
        ref={frameRef}
        style={{
          width: 0,
          height: 0,
          border: 'none',
        }}
        onLoad={() => {
          if (isFirefox) {
            load();
          }
        }}
      >
        {content &&
          createPortal(
            <RenderDetector
              onRender={() => {
                const document = frameRef.current?.contentWindow?.document;
                if (document) {
                  onExportReady(document.documentElement, exportOptions);
                }
              }}
              style={{
                width: `${widthInPixel}px`,
                height: `${heightInPixel}px`,
                margin: 0,
              }}
            >
              {children}
            </RenderDetector>,
            content,
          )}
      </iframe>
    </ExportSettingsProvider>
  );
}
