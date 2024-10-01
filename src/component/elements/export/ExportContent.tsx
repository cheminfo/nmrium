/** @jsxImportSource @emotion/react */
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Tag,
} from '@blueprintjs/core';
import { css } from '@emotion/react';
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';

import ActionButtons from '../ActionButtons';
import Label, { LabelStyle } from '../Label';
import { NumberInput2Controller } from '../NumberInput2Controller';
import { Select2Controller } from '../Select2Controller';

import { ExportSettingsProvider } from './ExportSettingsProvider';
import { convert, convertToPixels, round, Unit, units } from './units';

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

function getSizeInPixel(exportPageOptions: ExportOptions) {
  const { width, height, dpi, unit } = exportPageOptions;
  const widthInPixel = convertToPixels(width, unit, dpi);
  const heightInPixel = convertToPixels(height, unit, dpi);

  return { width: widthInPixel, height: heightInPixel };
}

interface BaseExportProps {
  onExportOptionsChange: (options: ExportOptions) => void;
  defaultExportPageOptions: Partial<ExportOptions>;
}

interface BaseExportFrameProps {
  children: ReactNode;
  onExportReady: (
    documentElement: HTMLElement,
    dimension: Pick<ExportOptions, 'width' | 'height'>,
  ) => void;
}
interface InnerExportFrameProps extends BaseExportFrameProps {
  exportPageOptions: Pick<ExportOptions, 'width' | 'height'>;
}
interface ExportFrameProps
  extends BaseExportFrameProps,
    Partial<BaseExportProps> {
  exportPageOptions?: ExportOptions;
  onExportDialogClose?: () => void;
}

export function ExportContent(props: ExportFrameProps) {
  // const [isPageOptionModalOpened, togglePageOptionDialog] =
  //   useState<boolean>(false);
  const [pageOptions, setPageOptions] = useState<Pick<
    ExportOptions,
    'width' | 'height'
  > | null>();

  const {
    children,
    exportPageOptions,
    defaultExportPageOptions,
    onExportOptionsChange,
    onExportReady,
    onExportDialogClose,
  } = props;

  // useEffect(() => {
  //   if (!exportPageOptions) {
  //     setPageOptions(null);
  //   } else {
  //     setPageOptions(getSizeInPixel(exportPageOptions));
  //   }
  // }, [exportPageOptions]);

  if (!pageOptions) {
    return (
      <PrintPageOptionsModal
        isOpen
        onCloseDialog={() => {
          onExportDialogClose?.();
        }}
        onExportOptionsChange={(options) => {
          onExportOptionsChange?.(options);
          setPageOptions(getSizeInPixel(options));
        }}
        defaultExportPageOptions={defaultExportPageOptions || {}}
      />
    );
  }

  const { width = 400, height = 400 } =
    (exportPageOptions && getSizeInPixel(exportPageOptions)) || pageOptions;
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
        exportPageOptions={{ width, height }}
        onExportReady={onExportReady}
      >
        {children}
      </InnerPrintFrame>
    </>
  );
}

export function InnerPrintFrame(props: InnerExportFrameProps) {
  const { children, exportPageOptions, onExportReady } = props;

  const { width, height } = exportPageOptions;

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [content, setContent] = useState<HTMLElement>();

  const load = useCallback(() => {
    const contentWindow = frameRef.current?.contentWindow;
    if (!contentWindow) return;
    const document = contentWindow.document;

    setContent(document.body);

    transferStyles(document);
    return contentWindow;
  }, []);

  useEffect(() => {
    if (!isFirefox) {
      load();
    }
  }, [load]);

  return (
    <ExportSettingsProvider width={width} height={height}>
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
              onExportReady={() => {
                const document = frameRef.current?.contentWindow?.document;
                if (document) {
                  onExportReady(document.documentElement, { width, height });
                }
              }}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                margin: 0,
              }}
            >
              {children}
            </RenderContainer>,
            content,
          )}
      </iframe>
    </ExportSettingsProvider>
  );
}

function RenderContainer(props: {
  onExportReady: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const { onExportReady, style, children } = props;

  useEffect(() => {
    const handleRenderComplete = () => {
      setTimeout(() => {
        onExportReady();
      }, 250);
    };

    const animationFrameId = requestAnimationFrame(handleRenderComplete);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onExportReady]);

  return <div style={style}>{children}</div>;
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

interface InnerExportOptionsModalProps extends BaseExportProps {
  onCloseDialog: () => void;
}
interface PrintOptionsModalProps extends InnerExportOptionsModalProps {
  isOpen: boolean;
}

function PrintPageOptionsModal(props: PrintOptionsModalProps) {
  const { isOpen, ...otherProps } = props;

  if (!isOpen) return;

  return <InnerExportOptionsModal {...otherProps} />;
}

const labelStyle: LabelStyle = {
  label: {
    color: '#232323',
    width: '80px',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  container: { margin: '5px 0' },
};

interface ExportOptions {
  unit: Unit;
  width: number;
  height: number;
  dpi: number;
}

const INITIAL_VALUE: ExportOptions = {
  unit: 'px',
  width: 400,
  height: 400,
  dpi: 72,
};

function InnerExportOptionsModal(props: InnerExportOptionsModalProps) {
  const { onCloseDialog, onExportOptionsChange, defaultExportPageOptions } =
    props;
  const [isAspectRatioEnabled, enableAspectRatio] = useState(true);
  const defaultValues = { ...INITIAL_VALUE, ...defaultExportPageOptions };
  const { width, height, dpi } = defaultValues;
  const refSize = useRef({ width, height, dpi });

  function submitHandler(values) {
    onExportOptionsChange(values);
  }

  const { handleSubmit, control, watch, setValue } = useForm<ExportOptions>({
    defaultValues,
  });

  const {
    unit,
    width: currentWidth,
    height: currentHeight,
    dpi: currentDPI,
  } = watch();

  const previousUnit = useDeferredValue(unit);

  function transformSize(
    value: number,
    target: 'width' | 'height',
    source: 'width' | 'height',
  ) {
    if (isAspectRatioEnabled) {
      const { width, height } = refSize.current;
      const aspectRation = width / height;
      const newSize = value * aspectRation;
      refSize.current[target] = newSize;
      refSize.current[source] = value;
      setValue(target, newSize);
    } else {
      refSize.current[source] = value;
    }
    return value;
  }

  function transformResolution(value) {
    const { width, height, dpi } = refSize.current;
    if (unit === 'px') {
      setValue('width', round((convertToPixels(width, unit) * value) / dpi));
      setValue('height', round((convertToPixels(height, unit) * value) / dpi));
    }

    return value;
  }

  function handleUnitChange({ unit }) {
    const w = round(convert(currentWidth, previousUnit, unit, dpi));
    const h = round(convert(currentHeight, previousUnit, unit, dpi));
    setValue('width', w);
    setValue('height', h);
    refSize.current = { width: w, height: h, dpi };
  }
  return (
    <Dialog isOpen title="Export options" onClose={onCloseDialog}>
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <Label style={labelStyle} title="Description:">
          <Tag>
            {`${convertToPixels(currentWidth, unit, currentDPI)} px x ${convertToPixels(currentHeight, unit, currentDPI)} px @ ${currentDPI}DPI`}
          </Tag>
        </Label>
        <Label style={labelStyle} title="Size">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <NumberInput2Controller
              name="width"
              control={control}
              style={{ width: 100 }}
              rightElement={<Tag>{unit}</Tag>}
              controllerProps={{ rules: { required: true } }}
              transformValue={(value) =>
                transformSize(value, 'height', 'width')
              }
              debounceTime={250}
              placeholder="width"
            />
            <div style={{ padding: '0px 5px' }}>
              <Button
                icon="link"
                minimal
                active={isAspectRatioEnabled}
                onClick={() => {
                  enableAspectRatio((prevFlag) => !prevFlag);
                }}
              />
            </div>
            <NumberInput2Controller
              name="height"
              control={control}
              style={{ width: 100 }}
              rightElement={<Tag>{unit}</Tag>}
              controllerProps={{ rules: { required: true } }}
              transformValue={(value) =>
                transformSize(value, 'width', 'height')
              }
              debounceTime={250}
              placeholder="height"
            />
          </div>
        </Label>
        <Label style={labelStyle} title="Units">
          <Select2Controller
            control={control}
            name="unit"
            itemTextKey="name"
            itemValueKey="unit"
            items={units}
            onItemSelect={handleUnitChange}
          />
        </Label>
        <Label style={labelStyle} title="DPI">
          <NumberInput2Controller
            name="dpi"
            control={control}
            style={{ width: 100 }}
            controllerProps={{ rules: { required: true } }}
            transformValue={transformResolution}
            debounceTime={250}
            placeholder="DPI"
          />
        </Label>
      </DialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => {
            void handleSubmit(submitHandler)();
          }}
          doneLabel="Save"
          onCancel={() => onCloseDialog?.()}
        />
      </DialogFooter>
    </Dialog>
  );
}
