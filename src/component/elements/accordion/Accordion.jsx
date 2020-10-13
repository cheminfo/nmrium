import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
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
const Accordion = ({ children, defaultOpenIndex = 0 }) => {
  const [elements, setElements] = useState([]);
  const refContainer = useRef();

  const handleOpen = useCallback(
    (index, trigger) => {
      let el = elements.slice();
      if (trigger === triggerSource.click) {
        el = el.map((e, i) => (i === index ? !e : e));
      } else {
        el = el.map((e, i) => (i === index ? true : false));
      }
      forcedOpenedElements = el;
      setElements(el);
    },
    [elements],
  );

  const Children = useMemo(() => {
    return React.Children.map(children, (child, index) => {
      return (
        child &&
        React.cloneElement(child, {
          onOpen: handleOpen,
          index,
          isOpen: elements && elements[index],
        })
      );
    });
  }, [children, elements, handleOpen]);

  useEffect(() => {
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
  }, [children.length, defaultOpenIndex]);

  return (
    <div ref={refContainer} style={styles.container}>
      {Children}
    </div>
  );
};

export default Accordion;
