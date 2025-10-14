import styled from '@emotion/styled';
import Menu from 'rc-menu';
import { memo, useMemo } from 'react';
import { FaBars } from 'react-icons/fa';
import { createSearchParams, useNavigate } from 'react-router-dom';

import 'rc-menu/assets/index.css';

import { buildMenu, getKey } from './utility/menu.js';

interface MenuStatus {
  isMenuClosed: boolean;
}

const SideBarContainer = styled.div<MenuStatus>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  background: #2ca8ff;
  height: 100%;
  width: ${({ isMenuClosed }) => (isMenuClosed ? '3%' : '260px')};
  z-index: 19;
`;

const MenuButton = styled.button`
  background-color: transparent;
  border: none !important;
  font-size: 18px;
  height: 30px;
  margin: 2px 4px;
  padding: 1px 6px;
  width: 30px;
  z-index: 7;

  svg {
    fill: white;
  }

  :focus {
    outline: none;
  }

  :active {
    background-color: rgb(0 0 0 / 50%);
    border-radius: 50%;
  }

  :hover {
    background-color: rgb(0 0 0 / 20%);
    border-radius: 50%;
  }
`;

const SideBarHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  z-index: 4;
`;

const TitleContainer = styled.div<MenuStatus>`
  display: ${({ isMenuClosed }) => (isMenuClosed ? 'none' : 'block')};
  padding: 0.5rem 0.7rem;
`;

const Title = styled.a`
  color: #fff;
  display: block;
  font-size: 1em;
  font-weight: 400;
  line-height: 30px;
  opacity: 1;
  overflow: hidden;
  padding: 0.5rem 0;
  text-decoration: none;
  text-transform: uppercase;
  transform: translateZ(0);
  white-space: nowrap;
`;

const SideBarWrapper = styled.div<MenuStatus>`
  position: relative;
  display: ${({ isMenuClosed }) => (isMenuClosed ? 'none' : 'block')};
  height: calc(100vh - 75px);
  overflow: hidden auto;
  padding-bottom: 100px;
  width: 260px;
  z-index: 4;
`;

function Sidebar(props: any) {
  const navigate = useNavigate();
  const routes = useMemo(() => {
    return buildMenu(props.routes);
  }, [props.routes]);

  const { menuIsClosed } = props;

  return (
    <SideBarContainer isMenuClosed={menuIsClosed} className="demo-side-bar">
      <SideBarHeader>
        <TitleContainer isMenuClosed={menuIsClosed}>
          <Title>NMRium</Title>
        </TitleContainer>
        <MenuButton type="button" onClick={props.onMenuToggle}>
          <FaBars />
        </MenuButton>
      </SideBarHeader>
      <SideBarWrapper isMenuClosed={menuIsClosed}>
        {/* @ts-expect-error menu typings are wrong */}
        <Menu
          onClick={(e: any) => {
            // TODO: use non-deprecated API of rc-menu
            const itemProps = e.item.props;
            void navigate({
              pathname: `/SamplesDashboard/${Math.random()
                .toString(36)
                .replace('0.', '')}/${
                (itemProps.view || 'View') + getKey(itemProps.file)
              }`,
              search: createSearchParams(itemProps?.query || {}).toString(),
            });
          }}
          mode="inline"
        >
          {routes}
        </Menu>
      </SideBarWrapper>
    </SideBarContainer>
  );
}

export default memo(Sidebar);
