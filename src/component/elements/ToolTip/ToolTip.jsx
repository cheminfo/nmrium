import React, { useRef, useLayoutEffect, useCallback, useState } from 'react';

const styles = {
  popup: {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    backgroundColor: 'gray',
    padding: '3px',
    borderRadius: '2px',
    color: 'white',
    whiteSpace: 'nowrap',
    fontSize: '10px',
  },
};

const ToolTip = ({
  style,
  className,
  popupPlacement = 'right',
  children,
  title,
  offset = { x: 0, y: 0 },
}) => {
  const refChild = useRef();
  const refContent = useRef();
  const [placement, setPlacement] = useState({ x: 0, y: 0 });
  const [show, showToolTip] = useState(false);

  useLayoutEffect(() => {
    const getPopupPlacement = () => {
      let x;
      let y;
      const childBounding = refChild.current.getBoundingClientRect();
      const contentBounding = refContent.current.getBoundingClientRect();
      console.log(childBounding);
      console.log(contentBounding);
      switch (popupPlacement) {
        case 'left':
          x = -contentBounding.width;
          y =
            childBounding.height / 2 -
            ((childBounding.height / 2) * contentBounding.height) /
              childBounding.height;
          break;
        case 'right':
          x = childBounding.width;
          y =
            childBounding.height / 2 -
            ((childBounding.height / 2) * contentBounding.height) /
              childBounding.height;
          break;
        case 'top':
          x =
            childBounding.width / 2 -
            ((childBounding.width / 2) * contentBounding.width) /
              childBounding.width;
          y = -childBounding.height;
          break;
        case 'bottom':
          x =
            childBounding.width / 2 -
            ((childBounding.width / 2) * contentBounding.width) /
              childBounding.width;
          y = childBounding.height;
          break;
        default:
          x = 0;
          y = 0;
          break;
      }
      return { x: x + childBounding.x, y: y + childBounding.y };
    };
    if (show) {
      const pl = getPopupPlacement();
      setPlacement(pl);
    }
  }, [popupPlacement, show]);

  const mouseOverHandler = useCallback(() => {
    showToolTip(true);
  }, []);

  const mouseLeaveHandler = useCallback(() => {
    // const boundingRect = e.currentTarget.getBoundingClientRect();
    showToolTip(false);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={refChild}
        onMouseOver={mouseOverHandler}
        onMouseOut={mouseLeaveHandler}
      >
        {children}
      </div>
      <div
        ref={refContent}
        style={{
          ...styles.popup,
          transform: `translate(${placement.x}px,${placement.y}px)`,
          zIndex: 999999999,
          left: offset.x,
          top: offset.y,
          display: show ? 'block' : 'none',
          ...style,
        }}
        className={className}
      >
        <span style={{ pointerEvents: 'none' }}>{title}</span>
      </div>
    </div>
  );
};

export default ToolTip;
