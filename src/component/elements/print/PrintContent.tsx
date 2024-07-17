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
import { PageSizeName, PrintPageOptions } from 'nmr-load-save';
import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Controller, useForm } from 'react-hook-form';

import ActionButtons from '../ActionButtons';
import Label, { LabelStyle } from '../Label';
import { NumberInput2Controller } from '../NumberInput2Controller';
import { Select2Controller } from '../Select2Controller';

import { PrintProvider } from './PrintProvider';

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

interface PageSize {
  name: PageSizeName;
  portrait: {
    width: number;
    height: number;
  };
  landscape: {
    width: number;
    height: number;
  };
}

const pageSizes: PageSize[] = [
  {
    name: 'Letter',
    portrait: { width: 21.59, height: 27.94 },
    landscape: { width: 27.94, height: 21.59 },
  },
  {
    name: 'Legal',
    portrait: { width: 21.59, height: 35.56 },
    landscape: { width: 35.56, height: 21.59 },
  },
  {
    name: 'Tabloid',
    portrait: { width: 27.94, height: 43.18 },
    landscape: { width: 43.18, height: 27.94 },
  },
  {
    name: 'Executive',
    portrait: { width: 26.67, height: 18.42 },
    landscape: { width: 18.42, height: 26.67 },
  },
  {
    name: 'Statement',
    portrait: { width: 21.59, height: 13.97 },
    landscape: { width: 13.97, height: 21.59 },
  },
  {
    name: 'Folio',
    portrait: { width: 33.02, height: 21.59 },
    landscape: { width: 21.59, height: 33.02 },
  },
  {
    name: 'A3',
    portrait: { width: 29.7, height: 42 },
    landscape: { width: 42, height: 29.7 },
  },
  {
    name: 'A4',
    portrait: { width: 21, height: 29.7 },
    landscape: { width: 29.7, height: 21 },
  },
  {
    name: 'A5',
    portrait: { width: 14.8, height: 21 },
    landscape: { width: 21, height: 14.8 },
  },
  {
    name: 'B4',
    portrait: { width: 25.7, height: 36.4 },
    landscape: { width: 36.4, height: 25.7 },
  },
  {
    name: 'B5',
    portrait: { width: 18.2, height: 25.7 },
    landscape: { width: 25.7, height: 18.2 },
  },
];

function getSizesList(layout: Layout) {
  const output: Array<{ label: string; value: string }> = [];

  for (const item of pageSizes) {
    const { name, ...otherKeys } = item;
    const { width, height } = otherKeys[layout];
    output.push({ label: `${name} (${width} cm x ${height} cm)`, value: name });
  }

  return output;
}

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

    window.addEventListener('keydown', handleKeyDow);

    return () => {
      window.removeEventListener('keydown', handleKeyDow);
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

  useEffect(() => {
    const contentWindow = frameRef.current?.contentWindow;
    if (!contentWindow) return;
    const document = contentWindow.document;

    setContent(document.body);

    transferStyles(document);
    appendPrintPageStyle(document, { size, layout, margin });

    function handleAfterPrint() {
      onAfterPrint?.();
    }
    function handleBeforePrint() {
      onBeforePrint?.();
    }
    contentWindow.addEventListener('beforeprint', handleBeforePrint);
    contentWindow.addEventListener('afterprint', handleAfterPrint);

    return () => {
      contentWindow.removeEventListener('afterprint', handleAfterPrint);
      contentWindow.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [layout, onBeforePrint, onAfterPrint, margin, size]);

  return (
    <PrintProvider width={width} height={height} margin={margin}>
      <iframe ref={frameRef} style={{ width: 0, height: 0, border: 'none' }}>
        {content &&
          createPortal(
            <RenderContainer
              onRenderComplete={() => frameRef.current?.contentWindow?.print()}
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
      margin:0;
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

        <Label style={labelStyle} title="margin">
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
