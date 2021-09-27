/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Toolbar } from 'analysis-ui-components';
import {
  ReactNode,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react';

const menuStyles = css`
  .menu {
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    padding: 0px;
    margin: 0px;
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
  }

  .menu-cover {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .menu-item {
    background-color: transparent;
    border: none;
    border-bottom: 0.55px solid whitesmoke;
    height: 35px;
    outline: outline;
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
      padding: 0px 10px;
    }
  }
`;

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button type="button" className="menu-item" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface MenuListProps {
  items: Array<MenuItemProps & { id: string }>;
  onClick: (element: MenuItemProps & { id: string }) => void;
  boxBounding: any;
}

function MenuList({ items, boxBounding, onClick }: MenuListProps) {
  const listRef = useRef<any>();
  const [translate, setTranslate] = useState({
    x: boxBounding.width,
    y: boxBounding.height,
  });

  useLayoutEffect(() => {
    const boxSize = listRef.current.getBoundingClientRect();
    setTranslate((oldTransform) => {
      let y = boxBounding.height;
      if (boxSize.bottom > window.innerHeight) {
        y = boxBounding.height * 2 + (boxSize.bottom - window.innerHeight);
      }
      return {
        ...oldTransform,
        y,
      };
    });
  }, [boxBounding.height]);

  return (
    <div
      ref={listRef}
      className="menu"
      style={{
        transform: `translate(${translate.x}px, -${translate.y}px) `,
      }}
    >
      {items?.map((item) => {
        return (
          <MenuItem key={item.id} {...item} onClick={() => onClick(item)} />
        );
      })}
    </div>
  );
}

interface MenuButtonProps {
  component: any;
  toolTip: string;
  items: Array<any>;
  onClick: (element: any) => void;
}

export default function ToolbarMenu({
  component,
  toolTip = '',
  items = [],
  onClick = () => null,
}: MenuButtonProps) {
  const menuButtonRef = useRef<HTMLDivElement>(null);
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

  const boxBounding = useCallback(() => {
    return menuButtonRef.current?.getBoundingClientRect();
  }, []);

  return (
    <div style={{ height: 'auto' }} css={menuStyles}>
      <div ref={menuButtonRef}>
        <Toolbar.Item
          id={`menu-${toolTip}`}
          title={toolTip}
          active={isShown}
          onClick={handleClick}
        >
          {component}
        </Toolbar.Item>
      </div>
      {isShown && (
        <MenuList
          items={items}
          boxBounding={boxBounding()}
          onClick={clickHandler}
        />
      )}

      {isShown && <div className="menu-cover" onClick={closeMenuButton} />}
    </div>
  );
}
