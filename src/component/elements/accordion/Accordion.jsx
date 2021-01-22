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
let forcedOpenedElements = [];
let alwaysOpen = null;
function Accordion({ children, defaultOpenIndex = 0 }) {
  const [elements, setElements] = useState([]);
  const refContainer = useRef();

  const handleOpen = useCallback(
    (index, trigger) => {
      let el = elements.slice();
      if (trigger.source === triggerSource.click) {
        el = el.map((e, i) => (i === index && alwaysOpen !== index ? !e : e));
      } else {
        el = el.map((e, i) => (i === index ? true : false));
        if (trigger.shiftKey) {
          if (alwaysOpen === index) {
            alwaysOpen = null;
          } else {
            alwaysOpen = index;
          }
        } else {
          alwaysOpen = null;
        }
      }

      forcedOpenedElements = el;
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
            !forcedOpenedElements[i]
              ? i === defaultOpenIndex
                ? true
                : false
              : e,
          );
        }
        forcedOpenedElements = Array(children.length)
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
