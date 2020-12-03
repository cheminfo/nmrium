/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState, useCallback, useEffect } from 'react';

import ToolTip from './ToolTip/ToolTip';

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

  button:hover {
    background-color: #fafafa;
  }
`;

const MenuButton = ({
  style,
  component,
  toolTip = '',
  children,
  className,
}) => {
  const [isShown, showMenu] = useState(false);

  const closeMenu = useCallback(() => {
    showMenu(false);
  }, []);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      showMenu(true);
      document.addEventListener('click', closeMenu);
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
    <div style={{ height: 'auto' }}>
      <button
        type="button"
        css={style}
        onClick={handleClick}
        onContextMenu={handleConetxt}
        className={className}
      >
        <ToolTip title={toolTip} popupPlacement="right">
          {component}
        </ToolTip>
      </button>

      {isShown ? (
        <div className="menu" css={menuStyles}>
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default MenuButton;
