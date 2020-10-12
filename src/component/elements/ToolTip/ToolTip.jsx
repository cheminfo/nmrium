import React, {
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
  memo,
  useEffect,
  Fragment,
} from 'react';
import { createPortal, unmountComponentAtNode } from 'react-dom';

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
    fontFamily: 'tahoma',
    textShadow: 'none',
  },
};

const ToolTip = memo(
  ({
    style,
    className,
    popupPlacement = 'right',
    children,
    title,
    offset = { x: 0, y: 0 },
  }) => {
    const root = useRef(null);
    const refChild = useRef();
    const refContent = useRef();
    const [placement, setPlacement] = useState({ x: 0, y: 0 });
    const [show, showToolTip] = useState(false);

    useEffect(() => {
      const element = document.getElementById('__react-tooltip__');

      if (element) {
        root.current = element;
      } else {
        root.current = document.createElement('div');
        root.current.id = '__react-tooltip__';
        document.body.appendChild(root.current);
      }

      return () => {
        if (root && root.current && element) {
          unmountComponentAtNode(element);
        }
      };
    }, []);

    useLayoutEffect(() => {
      const getPopupPlacement = () => {
        let x;
        let y;
        const childBounding = refChild.current.getBoundingClientRect();
        const contentBounding = refContent.current.getBoundingClientRect();
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
      <Fragment>
        <div
          style={{
            position: 'relative',
            height: '100%',
            display: 'block',
            ...style.mainContainer,
          }}
          ref={refChild}
          onMouseOver={mouseOverHandler}
          onMouseOut={mouseLeaveHandler}
        >
          {children}
        </div>
        {show &&
          createPortal(
            <div
              ref={refContent}
              style={{
                ...styles.popup,
                transform: `translate(${placement.x + offset.x}px,${
                  placement.y + offset.y
                }px)`,
                zIndex: 999999999,
                ...style.popup,
              }}
              className={className}
            >
              <span style={{ pointerEvents: 'none' }}>{title}</span>
            </div>,
            root.current,
          )}
      </Fragment>
    );
  },
);

ToolTip.defaultProps = {
  style: {
    popup: {},
    mainContainer: {},
  },
};

export default ToolTip;
