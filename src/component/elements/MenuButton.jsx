/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useCallback } from 'react';

import { useGlobal } from '../context/GlobalContext';

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
  const { rootRef } = useGlobal();

  const closeMenuButton = useCallback(() => {
    setTimeout(() => {
      showMenu(false);
    }, 100);
  }, []);

  const handleClick = useCallback(() => {
    if (rootRef) {
      showMenu(true);
      rootRef.addEventListener('mousedown', closeMenuButton, { once: true });
    }
  }, [closeMenuButton, rootRef]);

  return (
    <div style={{ height: 'auto' }}>
      <button
        type="button"
        css={style}
        onClick={handleClick}
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
