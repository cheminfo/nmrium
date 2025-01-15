/** @jsxImportSource @emotion/react */
import type { SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useState, useCallback, useRef } from 'react';

import ToolTip from './ToolTip/ToolTip.js';

const MenuCover = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
`;
const Menu = styled.div`
  box-shadow: 0 0 10px rgb(0 0 0 / 50%);
  margin: 0;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 99999;
  padding: 2px;
  background-color: white;

  button:hover {
    background-color: #fafafa;
  }
`;

const MenuItemButton = styled.button`
  background-color: transparent;
  border: none;
  border-bottom: 0.55px solid whitesmoke;
  height: 35px;
  display: table-cell;
  vertical-align: middle;
  text-align: left;
  padding: 0 10px;

  svg {
    display: inline-block;
  }

  :focus {
    outline: none !important;
  }

  span {
    font-size: 10px;
    padding: 0 10px;
  }
`;

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <MenuItemButton type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </MenuItemButton>
  );
}
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MenuListProps {
  items: Array<MenuItemProps & { id: string }>;
  onClick: (element: MenuItemProps & { id: string }) => void;
  boxBounding?: BoundingBox;
}

function MenuList({
  items,
  boxBounding = { x: 0, y: 0, width: 0, height: 0 },
  onClick,
}: MenuListProps) {
  return (
    <Menu
      style={{
        transform: `translate(${boxBounding.width}px, -${boxBounding.height}px) `,
      }}
    >
      {items?.map((item) => {
        return (
          <MenuItem key={item.id} {...item} onClick={() => onClick(item)} />
        );
      })}
    </Menu>
  );
}

interface MenuButtonProps extends Pick<MenuListProps, 'items' | 'onClick'> {
  style?: SerializedStyles;
  component: ReactNode;
  toolTip: string;
  className?: string;
}

export default function MenuButton({
  style,
  component,
  toolTip = '',
  className,
  items = [],
  onClick = () => null,
}: MenuButtonProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isShown, showMenu] = useState(false);

  const closeMenuButton = useCallback(() => {
    showMenu(false);
  }, []);

  const handleClick = useCallback(() => {
    showMenu((flag) => !flag);
  }, []);
  const clickHandler = useCallback(
    (e) => {
      showMenu(false);
      onClick(e);
    },
    [onClick],
  );

  return (
    <div>
      <button
        ref={menuButtonRef}
        type="button"
        css={style}
        onClick={handleClick}
        className={className}
        style={{ boxSizing: 'border-box' }}
      >
        <ToolTip title={toolTip} popupPlacement="right">
          {component}
        </ToolTip>
      </button>
      {isShown && (
        <MenuList
          items={items}
          boxBounding={menuButtonRef.current?.getBoundingClientRect()}
          onClick={clickHandler}
        />
      )}

      {isShown && <MenuCover onClick={closeMenuButton} />}
    </div>
  );
}
