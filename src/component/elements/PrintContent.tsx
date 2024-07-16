import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PrintFrameProps extends Pick<CSSProperties, 'padding'> {
  children: ReactNode;
  size: PageSizeName;
  layout?: 'portrait' | 'landscape';
}

const pageSizeNames = [
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
] as const;

type PageSizeName = (typeof pageSizeNames)[number];

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

export function PrintContent(props: PrintFrameProps) {
  const [print, togglePrint] = useState(false);

  useEffect(() => {
    function handleKeyDow(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        togglePrint(true);
      }
    }

    window.addEventListener('keydown', handleKeyDow);

    return () => {
      window.removeEventListener('keydown', handleKeyDow);
    };
  }, []);

  if (!print) return;

  return (
    <InnerPrintFrame
      {...props}
      onAfterPrint={() => {
        togglePrint(false);
      }}
    />
  );
}

interface InnerPrintFrameProps extends PrintFrameProps {
  onAfterPrint: () => void;
}

export function InnerPrintFrame(props: InnerPrintFrameProps) {
  const {
    children,
    onAfterPrint,
    size = 'A4',
    padding = 0,
    layout = 'portrait',
  } = props;

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [content, setContent] = useState<HTMLElement>();
  const { width, height } =
    pageSizes.find((pageItem) => pageItem.name === size)?.[layout] || {};

  useEffect(() => {
    const contentWindow = frameRef.current?.contentWindow;
    if (!contentWindow) return;
    const document = contentWindow.document;

    setContent(document.body);

    transferStyles(document);
    appendPrintPageStyle(document, { size, layout, padding });

    function handleAfterPrint() {
      onAfterPrint();
    }

    contentWindow.addEventListener('afterprint', handleAfterPrint);

    return () => {
      contentWindow.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [layout, onAfterPrint, padding, size]);

  return (
    <iframe ref={frameRef} style={{ width: 0, height: 0, border: 'none' }}>
      {content &&
        createPortal(
          <RenderContainer
            onRenderComplete={() => frameRef.current?.contentWindow?.print()}
            style={{ width: `${width}cm`, height: `${height}cm`, padding }}
          >
            {children}
          </RenderContainer>,
          content,
        )}
    </iframe>
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
  const { layout = 'landscape', size = 'A4', margin = 0, padding = 0 } = style;
  const styleElement = document.createElement('style');

  styleElement.textContent = `
    @page {
      size: ${size} ${layout};
      padding: ${typeof padding === 'string' ? padding : `${padding}cm`};
      margin: ${typeof margin === 'string' ? margin : `${margin}cm`};
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
