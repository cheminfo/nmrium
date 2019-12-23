import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
};

const Accordion = ({ children, defaultOpenIndex = 0 }) => {
  const selectedElement = useCallback(() => {
    return Array(children.length)
      .fill(false)
      .map((e, i) => (i === defaultOpenIndex ? true : e));
  }, [children.length, defaultOpenIndex]);

  const [elements, setElements] = useState(selectedElement);
  const refContainer = useRef();

  const handleOpen = useCallback(
    (index) => {
      let el = elements.slice();
      el = el.map((e, i) => (i === index ? true : false));
      setElements(el);
    },
    [elements],
  );

  const Children = useMemo(() => {
    return React.Children.map(children, (child, index) => {
      return React.cloneElement(child, {
        onOpen: handleOpen,
        index,
        isOpen: elements[index],
      });
    });
  }, [children, elements, handleOpen]);

  useEffect(() => {
    setElements(selectedElement);
  }, [selectedElement]);

  return (
    <div ref={refContainer} style={styles.container}>
      {Children}
    </div>
  );
};

export default Accordion;
