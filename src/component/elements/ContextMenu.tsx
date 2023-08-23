/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  useState,
  useImperativeHandle,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { useGlobal } from '../context/GlobalContext';

const styles = css`
  box-shadow: 0 0 10px rgb(0 0 0 / 25%);
  margin: 0;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 99999;
  padding: 2px;
  background-color: white;
  width: 150px;
  pointer-events: all;

  button {
    background-color: transparent;
    border: none;
    border-bottom: 0.55px solid #f0f0f0;
    font-size: 11px;
    padding: 5px;
    text-align: left;
    outline: none;
  }

  button:hover {
    background-color: #fafafa;
    outline: none;
  }

  button:active {
    background-color: #eaeaea;
    outline: none;
  }

  button:last-of-type {
    border: none;
  }
`;
interface ContextMenuItem<T> {
  onClick: (data?: T) => void;
  label: string;
}

export interface ContextMenuProps<T = unknown> {
  context: Array<ContextMenuItem<T>>;
}
// TODO: remove this hacky ref usage.
function ContextMenu<T = unknown>({ context }: ContextMenuProps<T>, ref: any) {
  const [position, setPosition] = useState<{
    left: string | number;
    top: string | number;
  }>({
    left: 0,
    top: 0,
  });
  const { rootRef, elementsWrapperRef } = useGlobal();
  const [data, setData] = useState<T>();
  const [isVisible, show] = useState<boolean>();
  const [sourceElement, setSourceElement] = useState(null);
  const root = useRef<HTMLDivElement>();

  useEffect(() => {
    root.current = document.createElement('div');
    if (elementsWrapperRef) {
      elementsWrapperRef.append(root.current);
    }
    return () => {
      if (root.current && elementsWrapperRef) {
        root.current.remove();
      }
    };
  }, [elementsWrapperRef]);

  const contextMenuHandler = (event) => {
    event.preventDefault();
    setSourceElement(event.target.parentElement);
    show(true);
    const clickX = event.clientX;
    const clickY = event.clientY;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = 150;
    const rootH = 0;

    const right = screenW - clickX > rootW;
    const bottom = screenH - clickY <= rootH;

    const left = right ? `${clickX + 5}px` : `${clickX - rootW - 5}px`;
    const top = bottom ? `${clickY - rootH - 5}px` : `${clickY + 5}px`;

    setPosition({ left, top });
  };

  useImperativeHandle(ref, () => ({
    handleContextMenu: (e, _data: T) => {
      setData(_data);
      contextMenuHandler(e);
    },
  }));

  const clickHandler = useCallback(
    (event: MouseEvent, click: (data?: T) => void) => {
      event.preventDefault();
      click(data);
      show(false);
    },
    [data],
  );

  useEffect(() => {
    const _handleGlobalClick = (event) => {
      const wasOutside =
        sourceElement &&
        event.target.parentElement &&
        !event.target.parentElement.isSameNode(sourceElement);
      if (wasOutside && isVisible) show(false);
    };
    if (rootRef) {
      rootRef.addEventListener('click', _handleGlobalClick);
    }
    return () => {
      if (rootRef) {
        rootRef.removeEventListener('click', _handleGlobalClick);
      }
    };
  }, [isVisible, ref, rootRef, sourceElement]);

  if (!isVisible) {
    return null;
  }

  return (
    root.current &&
    createPortal(
      context && (
        <div ref={ref} css={[styles, position]}>
          {context.map((c, index) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              type="button"
              onClick={(e) => clickHandler(e, c.onClick)}
            >
              {c.label}
            </button>
          ))}
        </div>
      ),
      root.current,
    )
  );
}

export default forwardRef(ContextMenu);
