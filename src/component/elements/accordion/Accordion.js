import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';

const styles = {
  container: { height: '100%', width: '100%' },
};

const Accordion = ({ children, defaultOpenIndex = 0 }) => {
  const [height, setHeight] = useState({
    parentHeight: 0,
    expandableHeight: 0,
  });
  const [elements, setElements] = useState(
    Array(children.length)
      .fill(false)
      .map((e, i) => (i === defaultOpenIndex ? true : e)),
  );
  const refContainer = useRef();
  const refContent = useRef();

  const handleOpen = useCallback(
    (index) => {
      let el = [...elements];
      el = el.map((e, i) => (i === index ? true : false));
      setElements(el);
    },
    [elements],
  );

  const Children = React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      height: height,
      onOpen: handleOpen,
      index,
      isOpen: elements[index],
    });
  });

  useLayoutEffect(() => {
    const expandableHeight =
      refContainer.current.clientHeight - refContent.current.clientHeight;
    setHeight({
      parentHeight: refContainer.current.clientHeight,
      expandableHeight,
    });
  }, [children.length]);

  return (
    <div ref={refContainer} style={styles.container}>
      <div ref={refContent}>{Children}</div>
    </div>
  );
};

export default Accordion;
