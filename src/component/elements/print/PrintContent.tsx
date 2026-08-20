import { DialogFooter, Tag } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import type { PrintPageOptions } from '@zakodium/nmrium-core';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppForm, Button, coerceNumberInput, useForm } from 'react-science/ui';
import { z } from 'zod';

import { StandardDialog } from '../StandardDialog.tsx';
import { StyledDialogBody } from '../StyledDialogBody.js';

import { PrintProvider } from './PrintProvider.js';
import { getSizesList, pageSizes } from './pageSize.js';

interface BasePrintProps {
  onPrint: (options: PrintPageOptions) => void;
  defaultPrintPageOptions: Partial<PrintPageOptions>;
}
interface InnerPrintFrameProps {
  children: ReactNode;
  onAfterPrint?: () => void;
  onBeforePrint?: () => void;
  onError?: (error: Error) => void;
  printPageOptions?: Partial<PrintPageOptions>;
}
interface PrintFrameProps
  extends InnerPrintFrameProps, Partial<BasePrintProps> {}

export function PrintContent(props: PrintFrameProps) {
  const [isPageOptionModalOpened, togglePageOptionDialog] =
    useState<boolean>(false);
  const [pageOptions, setPageOptions] =
    useState<Partial<PrintPagOptionsOutput> | null>();

  const {
    onBeforePrint,
    onAfterPrint,
    children,
    printPageOptions,
    defaultPrintPageOptions,
    onPrint,
    onError,
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
        onError={(error) => {
          setPageOptions(null);
          onError?.(error);
        }}
      >
        {children}
      </InnerPrintFrame>
    </>
  );
}

function InnerPrintFrame(props: InnerPrintFrameProps) {
  const {
    children,
    onAfterPrint,
    onBeforePrint,
    onError,
    printPageOptions = {},
  } = props;

  const {
    size = 'A4',
    margin = 0,
    layout = 'landscape',
  } = printPageOptions || {};
  const [iframeDocument, setIframeDocument] = useState<Document>();
  const { width = 0, height = 0 } =
    pageSizes.find((pageItem) => pageItem.name === size)?.[layout] || {};

  const handleAfterPrint = useCallback(() => {
    onAfterPrint?.();
  }, [onAfterPrint]);

  const handleBeforePrint = useCallback(() => {
    onBeforePrint?.();
  }, [onBeforePrint]);

  function refHandler(frame: HTMLIFrameElement | null) {
    if (!frame) return;

    const document = frame.contentWindow?.document;

    if (!document) {
      onError?.(new Error('Print document is not available'));
      return;
    }

    transferStyles(document);
    appendPrintPageStyle(document, { size, layout, margin });
    setIframeDocument(document);
  }

  useEffect(() => {
    const contentWindow = iframeDocument?.defaultView;
    if (!contentWindow) return;

    contentWindow.addEventListener('afterprint', handleAfterPrint);
    contentWindow.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      contentWindow.removeEventListener('afterprint', handleAfterPrint);
      contentWindow.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [iframeDocument, handleAfterPrint, handleBeforePrint]);

  return (
    <PrintProvider width={width} height={height} margin={margin}>
      <iframe
        ref={refHandler}
        style={{
          width: 0,
          height: 0,
          border: 'none',
        }}
      >
        {iframeDocument &&
          createPortal(
            <RenderContainer
              onRenderComplete={() => {
                const contentWindow = iframeDocument.defaultView;

                if (!contentWindow) {
                  onError?.(new Error('Print content window is not available'));
                  return;
                }

                contentWindow.focus();
                contentWindow.print();
              }}
              style={{
                width: `${width - margin}cm`,
                height: `${height - margin}cm`,
                margin: `${margin}cm`,
              }}
            >
              {children}
            </RenderContainer>,
            iframeDocument.body,
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

const printOptionsValidation = z.object({
  margin: coerceNumberInput(z.number().min(0)),
  layout: z.enum(['landscape', 'portrait']),
  size: z.enum([
    'Letter',
    'Legal',
    'Tabloid',
    'Executive',
    'Statement',
    'Folio',
    'A3',
    'A4',
    'A5',
    'B4',
    'B5',
  ]),
});

type PrintPagOptionsInput = z.input<typeof printOptionsValidation>;
type PrintPagOptionsOutput = z.output<typeof printOptionsValidation>;

const INITIAL_VALUE: PrintPagOptionsInput = {
  size: 'A4',
  layout: 'landscape',
  margin: '0',
};

function InnerPrintOptionsModal(props: InnerPrintOptionsModalProps) {
  const { onCloseDialog, onPrint, defaultPrintPageOptions } = props;

  const defaultValues = useMemo(() => {
    return {
      ...INITIAL_VALUE,
      ...defaultPrintPageOptions,
    };
  }, [defaultPrintPageOptions]);

  const form = useForm({
    defaultValues,
    validators: {
      onDynamic: printOptionsValidation,
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    onSubmit: ({ value }) => {
      const parsedValues = printOptionsValidation.parse(value);
      onPrint(parsedValues);
      onCloseDialog?.();
    },
  });

  const layoutStore = useSelector(form.store, (store) => store.values.layout);
  const sizesList = getSizesList(layoutStore);

  return (
    <StandardDialog
      isOpen
      title="Print options"
      onClose={onCloseDialog}
      style={{ width: 600 }}
    >
      <AppForm form={form} layout="inline">
        <StyledDialogBody>
          <form.AppField name="size">
            {(field) => <field.Select label="Size" items={sizesList} />}
          </form.AppField>

          <form.AppField name="layout">
            {(field) => (
              <field.RadioGroup
                label="Layout"
                options={[
                  { label: 'Portrait', value: 'portrait' },
                  { label: 'Landscape', value: 'landscape' },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="margin">
            {(field) => (
              <field.NumericInput
                label="Margin"
                min={0}
                rightElement={<Tag>cm</Tag>}
              />
            )}
          </form.AppField>
        </StyledDialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                onClick={onCloseDialog}
                intent="danger"
                variant="outlined"
              >
                Cancel
              </Button>
              <form.SubmitButton intent="success">Print</form.SubmitButton>
            </>
          }
        />
      </AppForm>
    </StandardDialog>
  );
}
