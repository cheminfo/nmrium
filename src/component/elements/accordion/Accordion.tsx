import {
  ReactNode,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  Children,
  cloneElement,
  CSSProperties,
} from 'react';

import { triggerSource } from './AccordionItem';

const styles: Record<'container', CSSProperties> = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
};

interface AccordionProps {
  children: Array<ReactNode>;
  defaultOpenIndex: number | null;
}

function Accordion({ children, defaultOpenIndex = 0 }: AccordionProps) {
  const [elements, setElements] = useState<Array<any>>([]);

  const refContainer = useRef<HTMLDivElement>(null);
  const forcedOpenedElementsRef = useRef<Array<any>>([]);
  const alwaysOpenIndexRef = useRef<any>();

  const handleOpen = useCallback(
    (index, trigger) => {
      let el: boolean[] = elements.slice();
      if (trigger.source === triggerSource.click) {
        el = el.map((e, i) =>
          i === index && alwaysOpenIndexRef.current !== index ? !e : e,
        );
      } else {
        el = el.map((e, i) => (i === index));
        if (trigger.shiftKey) {
          if (alwaysOpenIndexRef.current === index) {
            alwaysOpenIndexRef.current = null;
          } else {
            alwaysOpenIndexRef.current = index;
          }
        } else {
          alwaysOpenIndexRef.current = null;
        }
      }

      forcedOpenedElementsRef.current = el;
      setElements(el);
    },
    [elements],
  );

  const mappedChildren = useMemo(() => {
    return Children.map(children, (child: any, index) => {
      return (
        child &&
        cloneElement(child, {
          onOpen: handleOpen,
          index,
          isOpen: elements?.[index],
        })
      );
    });
  }, [children, elements, handleOpen]);

  useEffect(() => {
    if (defaultOpenIndex != null) {
      setElements((prevState) => {
        if (prevState.length > 0) {
          return prevState.map((e, i) =>
            !forcedOpenedElementsRef.current[i]
              ? i === defaultOpenIndex
              : e,
          );
        }
        forcedOpenedElementsRef.current = Array(children.length)
          .fill(false)
          .map((e) => e);

        return Array(children.length)
          .fill(false)
          .map((e, i) => (i === defaultOpenIndex ? true : e));
      });
    }
  }, [children.length, defaultOpenIndex]);

  return (
    <div ref={refContainer} style={styles.container}>
      {mappedChildren}
    </div>
  );
}

export default Accordion;
