import {
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
  memo,
  Fragment,
  CSSProperties,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { useGlobal } from '../../context/GlobalContext';

const styles: Record<'popup', CSSProperties> = {
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

interface ToolTipProps {
  style?: any;
  className?: string;
  popupPlacement: string;
  children: ReactNode;
  title: string;
  offset?: { x: number; y: number };
}

function ToolTip({
  style = { popup: {}, mainContainer: {} },
  className = '',
  popupPlacement = 'right',
  children,
  title,
  offset = { x: 0, y: 0 },
}: ToolTipProps) {
  const refChild = useRef<HTMLDivElement>(null);
  const refContent = useRef<HTMLDivElement>(null);

  const [placement, setPlacement] = useState({ x: 0, y: 0 });
  const [show, showToolTip] = useState(false);
  const { elementsWrapperRef } = useGlobal();

  useLayoutEffect(() => {
    const getPopupPlacement = () => {
      let x: number;
      let y: number;

      if (refChild.current === null || refContent.current === null) {
        return null;
      }

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

      if (pl) {
        setPlacement(pl);
      }
    }
  }, [popupPlacement, show]);

  const mouseOverHandler = useCallback(() => {
    showToolTip(true);
  }, []);

  const mouseLeaveHandler = useCallback(() => {
    showToolTip(false);
  }, []);

  return (
    <Fragment>
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...style.mainContainer,
        }}
        ref={refChild}
        onMouseOver={mouseOverHandler}
        onMouseOut={mouseLeaveHandler}
      >
        {children}
      </div>
      {show &&
        elementsWrapperRef &&
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
          elementsWrapperRef,
        )}
    </Fragment>
  );
}

export default memo(ToolTip);
