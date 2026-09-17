import type { ReactNode } from 'react';
import {
  Children,
  createContext,
  isValidElement,
  use,
  useEffect,
  useRef,
} from 'react';

const ScrollContext = createContext<string>('');

function useScrollKey() {
  const context = use(ScrollContext);

  if (!context) {
    throw new Error('Scroller context was not found');
  }

  return context;
}

interface ScrollerProps {
  scrollTo: string;
  children: ReactNode;
}

export function Scroller(props: ScrollerProps) {
  const { scrollTo, children } = props;
  const isAllScrollItem = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === ScrollerElement,
  );

  if (!isAllScrollItem && Children.count(children) > 0) {
    throw new Error(
      "one of the children should be of type <Scroller.Item elementKey='...' > children </Scroller.Item>",
    );
  }

  return <ScrollContext value={scrollTo}> {children} </ScrollContext>;
}

interface ScrollerElementProps {
  elementKey: string;
  children: ReactNode;
}

function ScrollerElement(props: ScrollerElementProps) {
  const { children, elementKey } = props;
  const scrollToKey = useScrollKey();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && elementKey === scrollToKey) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [elementKey, scrollToKey]);

  return <div ref={ref}>{children}</div>;
}

Scroller.Item = ScrollerElement;
