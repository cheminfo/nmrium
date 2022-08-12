import {
  useState,
  useRef,
  useEffect,
  useCallback,
  CSSProperties,
  ReactNode,
} from 'react';

const styles: Record<
  'container' | 'button' | 'buttonTitle' | 'content',
  CSSProperties
> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0px',
    userSelect: 'none',
  },
  button: {
    cursor: 'pointer',
    padding: '5px 12px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.2s ease-in',

    boxShadow: 'inset 0px 1px 0px 0px #ffffff',
    background: 'linear-gradient(to bottom, #f0f0f0 5%, #e1e1e1 100%)',
    filter:
      'progid:DXImageTransform.Microsoft.gradient(startColorstr="#f0f0f0", endColorstr="#e1e1e1",GradientType=0)',
    backgroundColor: '#ffffff',
    color: '#2d2d2d',
    fontFamily: 'Arial',
    fontWeight: 'bold',
    textDecoration: 'none',
    textShadow: '0px 1px 0px #ffffff',
    borderTop: '0.55px  solid #d5d5d5',
  },
  buttonTitle: {
    padding: 0,
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    maxHeight: '0',
    overflow: 'hidden',
    flex: '1 1 1px',
  },
};

export const triggerSource = {
  click: 1,
  dbClick: 2,
};

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  index?: number;
  isOpen?: boolean;
  onOpen?: (a: any, b: any) => void;
  style?: any;
}

function AccordionItem({
  title,
  children,
  index,
  isOpen,
  onOpen = () => null,
  style,
}: AccordionItemProps) {
  const [active, setActiveState] = useState<CSSProperties | null>(null);
  const timeoutRef = useRef<any>();
  const preventEventRef = useRef(false);
  const delay = useRef(200).current;

  const refContent = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);

  const toggleAccordion = useCallback(
    (e) => {
      timeoutRef.current = setTimeout(() => {
        if (!preventEventRef.current) {
          onOpen(index, { source: triggerSource.click, shiftKey: e.shiftKey });
        }
        preventEventRef.current = false;
      }, delay);
    },
    [delay, index, onOpen],
  );

  const dbClickHandler = useCallback(
    (e) => {
      e.persist();
      clearTimeout(timeoutRef.current);
      preventEventRef.current = true;
      onOpen(index, { source: triggerSource.dbClick, shiftKey: e.shiftKey });
    },
    [index, onOpen],
  );

  useEffect(() => {
    setActiveState(isOpen ? { backgroundColor: '#ccc' } : null);
  }, [isOpen]);

  return (
    <div
      ref={refContainer}
      style={{
        ...styles.container,
        flex: active == null ? 0 : '1 1 1px',
        transition: isOpen ? 'flex 0.2s ease' : '',
      }}
      className="custom-accordion"
    >
      <button
        type="button"
        style={styles.button}
        onClick={toggleAccordion}
        onDoubleClick={dbClickHandler}
      >
        <p style={styles.buttonTitle}>{title}</p>
      </button>
      <div
        ref={refContent}
        style={{
          ...styles.content,
          maxHeight: active == null ? 0 : '100%',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default AccordionItem;
