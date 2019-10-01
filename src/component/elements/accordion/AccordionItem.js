import React, { useState, useRef, useEffect } from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0px',
  },
  button: {
    // backgroundColor: '#eee',
    // color: '#444',
    cursor: 'pointer',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.2s ease-in',

    boxShadow: 'inset 0px 1px 0px 0px #ffffff',
    background: 'linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%)',
    filter:
      'progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff", endColorstr="#f6f6f6",GradientType=0)',
    backgroundColor: '#ffffff',
    color: '#666666',
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
    overflow: 'hidden',
    transitionProps: 'transition',
    transition: '0.2s ease',
  },
};

export const AccordionItem = ({
  title,
  children,
  height,
  index,
  isOpen,
  onOpen,
}) => {
  const [active, setActiveState] = useState(null);
  const [Height, setHeightState] = useState(0);

  const refContent = useRef();
  const refContainer = useRef();
  function toggleAccordion() {
    setActiveState(active == null ? { backgroundColor: '#ccc' } : null);
    if (active == null) {
      onOpen(index);
    }
  }

  useEffect(() => {
    const _height =
      height.expandableHeight === 0
        ? refContent.current.scrollHeight
        : height.expandableHeight;
    setHeightState(active == null ? 0 : _height);
  }, [height, active]);

  useEffect(() => {
    if (isOpen === false) {
      setActiveState(null);
    }
  }, [isOpen]);

  return (
    <div
      ref={refContainer}
      style={styles.container}
      className="custom-accordion"
    >
      <button type="button" style={styles.button} onClick={toggleAccordion}>
        <p style={styles.buttonTitle}>{title}</p>
      </button>
      <div
        ref={refContent}
        style={{
          ...styles.content,
          maxHeight: `${Height}px`,
          height: `${Height}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

AccordionItem.defaultProps = {
  onOpen: function() {
    return null;
  },
};

export default AccordionItem;
