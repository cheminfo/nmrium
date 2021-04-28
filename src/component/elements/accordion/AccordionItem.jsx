import { useState, useRef, useEffect, useCallback } from 'react';

let timer = 0;
let delay = 200;
let prevent = false;

const styles = {
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

function AccordionItem({ title, children, index, isOpen, onOpen, style }) {
  const [active, setActiveState] = useState(null);

  const refContent = useRef();
  const refContainer = useRef();
  const toggleAccordion = useCallback(
    (e) => {
      timer = setTimeout(function () {
        if (!prevent) {
          onOpen(index, { source: triggerSource.click, shiftKey: e.shiftKey });
        }
        prevent = false;
      }, delay);
    },
    [index, onOpen],
  );

  const dbClickHandler = useCallback(
    (e) => {
      e.persist();
      clearTimeout(timer);
      prevent = true;
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

AccordionItem.defaultProps = {
  onOpen: function () {
    return null;
  },
};

export default AccordionItem;
