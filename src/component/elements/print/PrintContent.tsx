/** @jsxImportSource @emotion/react */
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Radio,
  RadioGroup,
  Tag,
} from '@blueprintjs/core';
import { css } from '@emotion/react';
import type { PageSizeName, PrintPageOptions } from 'nmr-load-save';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Controller, useForm } from 'react-hook-form';

import ActionButtons from '../ActionButtons.js';
import type { LabelStyle } from '../Label.js';
import Label from '../Label.js';
import { NumberInput2Controller } from '../NumberInput2Controller.js';
import { Select2Controller } from '../Select2Controller.js';

import { PrintProvider } from './PrintProvider.js';
import { getSizesList, pageSizes } from './pageSize.js';

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

type Layout = 'portrait' | 'landscape';

interface BasePrintProps {
  onPrint: (options: PrintPageOptions) => void;
  defaultPrintPageOptions: Partial<PrintPageOptions>;
}
interface InnerPrintFrameProps {
  children: ReactNode;
  onAfterPrint?: () => void;
  onBeforePrint?: () => void;
  printPageOptions?: Partial<PrintPageOptions>;
}
interface PrintFrameProps
  extends InnerPrintFrameProps,
    Partial<BasePrintProps> {}

export function PrintContent(props: PrintFrameProps) {
  const [isPageOptionModalOpened, togglePageOptionDialog] =
    useState<boolean>(false);
  const [pageOptions, setPageOptions] =
    useState<Partial<PrintPagOptions> | null>();

  const {
    onBeforePrint,
    onAfterPrint,
    children,
    printPageOptions,
    defaultPrintPageOptions,
    onPrint,
  } = props;

  useEffect(() => {
    function handleKeyDow(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        if (!printPageOptions) {
          togglePageOptionDialog(true);
        } else {
          setPageOptions(printPageOptions);
        }
      }
    }

    globalThis.addEventListener('keydown', handleKeyDow);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDow);
    };
  }, [printPageOptions]);

  if (!pageOptions) {
    return (
      <PrintPageOptionsModal
        isOpen={isPageOptionModalOpened}
        onCloseDialog={() => {
          togglePageOptionDialog(false);
        }}
        onPrint={(options) => {
          togglePageOptionDialog(false);
          onPrint?.(options);
          setPageOptions(options);
        }}
        defaultPrintPageOptions={defaultPrintPageOptions || {}}
      />
    );
  }
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
        printPageOptions={pageOptions}
        onAfterPrint={() => {
          setPageOptions(null);
          onAfterPrint?.();
        }}
        onBeforePrint={() => {
          onBeforePrint?.();
        }}
      >
        {children}
      </InnerPrintFrame>
    </>
  );
}

export function InnerPrintFrame(props: InnerPrintFrameProps) {
  const {
    children,
    onAfterPrint,
    onBeforePrint,
    printPageOptions = {},
  } = props;

  const {
    size = 'A4',
    margin = 0,
    layout = 'landscape',
  } = printPageOptions || {};

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [content, setContent] = useState<HTMLElement>();
  const { width = 0, height = 0 } =
    pageSizes.find((pageItem) => pageItem.name === size)?.[layout] || {};

  const handleAfterPrint = useCallback(() => {
    onAfterPrint?.();
  }, [onAfterPrint]);
  const handleBeforePrint = useCallback(() => {
    onBeforePrint?.();
  }, [onBeforePrint]);

  const load = useCallback(() => {
    const contentWindow = frameRef.current?.contentWindow;
    if (!contentWindow) return;
    const document = contentWindow.document;

    setContent(document.body);

    transferStyles(document);
    appendPrintPageStyle(document, { size, layout, margin });

    contentWindow.addEventListener('afterprint', handleAfterPrint);
    contentWindow.addEventListener('beforeprint', handleBeforePrint);

    return contentWindow;
  }, [handleAfterPrint, handleBeforePrint, layout, margin, size]);

  useEffect(() => {
    const contentWindow = frameRef.current?.contentWindow;

    if (!isFirefox) {
      load();
    }

    return () => {
      if (!contentWindow) return;

      contentWindow.removeEventListener('afterprint', handleAfterPrint);
      contentWindow.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [
    onBeforePrint,
    onAfterPrint,
    handleBeforePrint,
    handleAfterPrint,
    size,
    layout,
    margin,
    load,
  ]);

  return (
    <PrintProvider width={width} height={height} margin={margin}>
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
            <RenderContainer
              onRenderComplete={() => {
                frameRef.current?.contentWindow?.focus();
                frameRef.current?.contentWindow?.print();
              }}
              style={{
                width: `${width - margin}cm`,
                height: `${height - margin}cm`,
                margin: `${margin}cm`,
              }}
            >
              {children}
            </RenderContainer>,
            content,
          )}
      </iframe>
    </PrintProvider>
  );
}

function RenderContainer(props: {
  onRenderComplete: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const { onRenderComplete, style, children } = props;

  useEffect(() => {
    const handleRenderComplete = () => {
      setTimeout(() => {
        onRenderComplete();
      }, 250);
    };

    const animationFrameId = requestAnimationFrame(handleRenderComplete);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onRenderComplete]);

  return <div style={style}>{children}</div>;
}

interface Style extends Pick<CSSProperties, 'margin' | 'padding'> {
  layout?: 'portrait' | 'landscape';
  size?: string;
}
function appendPrintPageStyle(document: Document, style: Style = {}) {
  const { layout = 'landscape', size = 'A4' } = style;
  const styleElement = document.createElement('style');
  styleElement.textContent = `
      @media print {

    @page {
      size: ${size} ${layout};
      padding:0;
      margin:0;
    }
}
  `;
  document.head.append(styleElement);
}

function transferStyles(targetDocument: Document) {
  // Copy the style from the main page and inject it inside the iframe
  const styleSheets = Array.from(document.styleSheets);
  const targetHead = targetDocument.head;

  for (const styleSheet of styleSheets) {
    try {
      if (styleSheet.cssRules) {
        const newStyleEl = document.createElement('style');
        const cssRules = Array.from(styleSheet.cssRules);
        const cssText = cssRules.map((rule) => rule.cssText).join('\n');

        newStyleEl.append(document.createTextNode(cssText));
        targetHead.append(newStyleEl);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error transferring styles:', error);
    }
  }
}

interface InnerPrintOptionsModalProps extends BasePrintProps {
  onCloseDialog: () => void;
}
interface PrintOptionsModalProps extends InnerPrintOptionsModalProps {
  isOpen: boolean;
}

function PrintPageOptionsModal(props: PrintOptionsModalProps) {
  const { isOpen, ...otherProps } = props;

  if (!isOpen) return;

  return <InnerPrintOptionsModal {...otherProps} />;
}

const labelStyle: LabelStyle = {
  label: {
    flex: 4,
    color: '#232323',
  },
  wrapper: {
    flex: 8,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  container: { margin: '5px 0' },
};

interface PrintPagOptions {
  size: PageSizeName;
  layout: Layout;
  margin: number;
}

const INITIAL_VALUE: PrintPagOptions = {
  size: 'A4',
  layout: 'landscape',
  margin: 0,
};

function InnerPrintOptionsModal(props: InnerPrintOptionsModalProps) {
  const { onCloseDialog, onPrint, defaultPrintPageOptions } = props;

  function submitHandler(values) {
    onPrint(values);
    onCloseDialog?.();
  }

  const { handleSubmit, control, watch } = useForm<PrintPagOptions>({
    defaultValues: { ...INITIAL_VALUE, ...defaultPrintPageOptions },
  });

  const layout = watch('layout');
  const sizesList = getSizesList(layout);
  return (
    <Dialog
      isOpen
      title="Print options"
      onClose={onCloseDialog}
      style={{ width: 600 }}
    >
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <Label style={labelStyle} title="Size">
          <Select2Controller control={control} name="size" items={sizesList} />
        </Label>
        <Label style={labelStyle} title="Layout">
          <Controller
            name="layout"
            control={control}
            render={({ field }) => {
              const { value, onChange, ...otherFieldProps } = field;
              return (
                <RadioGroup
                  inline
                  onChange={onChange}
                  selectedValue={value}
                  {...otherFieldProps}
                >
                  <Radio label="Portrait" value="portrait" />
                  <Radio label="Landscape" value="landscape" />
                </RadioGroup>
              );
            }}
          />
        </Label>

        <Label style={labelStyle} title="Margin">
          <NumberInput2Controller
            name="margin"
            control={control}
            min={0}
            rightElement={<Tag>cm</Tag>}
          />
        </Label>
      </DialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => {
            void handleSubmit(submitHandler)();
          }}
          doneLabel="Print"
          onCancel={() => onCloseDialog?.()}
        />
      </DialogFooter>
    </Dialog>
  );
}
