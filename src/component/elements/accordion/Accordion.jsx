import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  Children,
  cloneElement,
} from 'react';

import { triggerSource } from './AccordionItem';

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
};
function Accordion({ children, defaultOpenIndex = 0 }) {
  const [elements, setElements] = useState([]);
  const refContainer = useRef();
  const forcedOpenedElementsRef = useRef([]);
  const alwaysOpenIndexRef = useRef();

  const handleOpen = useCallback(
    (index, trigger) => {
      let el = elements.slice();
      if (trigger.source === triggerSource.click) {
        el = el.map((e, i) =>
          i === index && alwaysOpenIndexRef.current !== index ? !e : e,
        );
      } else {
        el = el.map((e, i) => (i === index ? true : false));
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
    return Children.map(children, (child, index) => {
      return (
        child &&
        cloneElement(child, {
          onOpen: handleOpen,
          index,
          isOpen: elements && elements[index],
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
                ? true
                : false
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
