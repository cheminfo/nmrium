import { jsx, css } from '@emotion/core';
import {
  forwardRef,
  useState,
  useImperativeHandle,
  useCallback,
  useRef,
  useEffect,
} from 'react';
/** @jsx jsx */
import { createPortal } from 'react-dom';

const styles = css`
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
  padding: 0px;
  margin: 0px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 99999;
  padding: 2px;
  background-color: white;
  width: 150px;
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
const ContextMenu = forwardRef(({ context }, ref) => {
  const [position, setPosition] = useState({ lef: 0, top: 0 });
  const [data, setData] = useState();
  const [isVisible, show] = useState();
  const [sourceElement, setSourceElement] = useState(null);
  const root = useRef();

  useEffect(() => {
    root.current = document.createElement('div');
    document.body.appendChild(root.current);

    return () => {
      if (root.current) document.body.removeChild(root.current);
    };
  }, []);

  const contextMenuHandler = (event) => {
    event.preventDefault();
    setSourceElement(event.target.parentElement);
    show(true);
    const clickX = event.clientX;
    const clickY = event.clientY;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    // const rootW = ref.current.offsetWidth;
    // const rootH = ref.current.offsetHeight;
    const rootW = 150;
    const rootH = 0;

    const right = screenW - clickX > rootW;
    let left = !right;
    let top = screenH - clickY > rootH;
    const bottom = !top;
    if (right) {
      left = `${clickX + 5}px`;
    }

    if (left) {
      left = `${clickX - rootW - 5}px`;
    }

    if (top) {
      top = `${clickY + 5}px`;
    }

    if (bottom) {
      top = `${clickY - rootH - 5}px`;
    }

    setPosition({ left, top });
  };

  useImperativeHandle(ref, () => ({
    handleContextMenu: (e, _data) => {
      setData(_data);
      contextMenuHandler(e);
    },
  }));

  const clickHandler = useCallback(
    (event, click) => {
      event.preventDefault();
      click(data);
      show(false);
    },
    [data],
  );

  useEffect(() => {
    // console.log(ref.current);
    const _handleGlobalClick = (event) => {
      const wasOutside = !event.target.parentElement.isSameNode(sourceElement);
      if (wasOutside && isVisible) show(false);
    };

    document.addEventListener('click', _handleGlobalClick);
    return () => {
      document.removeEventListener('click', _handleGlobalClick);
    };
  }, [isVisible, ref, sourceElement]);

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
});

export default ContextMenu;
