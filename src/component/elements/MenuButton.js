import {
  useState,
  useCallback,
  useEffect,
  cloneElement,
  Children,
} from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const menuStyles = css`
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  padding: 0px;
  margin: 0px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 99999;
  padding: 2px;
  transform: translate(40px, -26px);
  background-color: white;
`;

// eslint-disable-next-line no-unused-vars
const MenuButton = ({ style, className, children, defaultButtonIndex = 0 }) => {
  const [isShown, showMenu] = useState(false);

  const closeMenu = useCallback(() => {
    showMenu(false);
  }, []);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent.which === 3) {
        showMenu(true);
        document.addEventListener('click', closeMenu);
      }
    },
    [closeMenu],
  );

  const handleConetxt = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
    //   e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isShown) {
      document.removeEventListener('click', closeMenu);
    }
  }, [closeMenu, isShown]);

  return (
    <div>
      {cloneElement(Children.toArray(children)[defaultButtonIndex], {
        onMouseDown: handleClick,
        onContextMenu: handleConetxt,
      })}

      {isShown ? (
        <div className="menu" css={menuStyles}>
          {Children.map(children, (child, index) => {
            return index !== defaultButtonIndex ? child : null;
          })}
        </div>
      ) : null}
    </div>
  );
};

export default MenuButton;
