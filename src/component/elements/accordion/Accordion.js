import React, { useState, useRef, useCallback, useMemo } from 'react';

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
};

const Accordion = ({ children, defaultOpenIndex = 0 }) => {
  const [elements, setElements] = useState(
    Array(children.length)
      .fill(false)
      .map((e, i) => (i === defaultOpenIndex ? true : e)),
  );
  const refContainer = useRef();

  const handleOpen = useCallback(
    (index) => {
      let el = [...elements];
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

  return (
    <div ref={refContainer} style={styles.container}>
      {Children}
    </div>
  );
};

export default Accordion;
