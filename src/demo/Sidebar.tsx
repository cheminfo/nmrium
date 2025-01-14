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
  background: #2ca8ff;
  position: fixed;
  top: 0;
  height: 100%;
  bottom: 0;
  left: 0;
  z-index: 19;
  width: ${({ isMenuClosed }) => (isMenuClosed ? '3%' : '260px')};
`;

const MenuButton = styled.button`
  margin: 2px 4px;
  z-index: 7;
  font-size: 18px;
  background-color: transparent;
  border: none !important;
  height: 30px;
  width: 30px;
  padding: 1px 6px;

  & svg {
    fill: white;
  }

  &:focus {
    outline: none;
  }

  &:active {
    background-color: rgb(0 0 0 / 50%);
    border-radius: 50%;
  }

  &:hover {
    background-color: rgb(0 0 0 / 20%);
    border-radius: 50%;
  }
`;

const SideBarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 4;
  border-bottom: 1px solid #eee;
`;

const TitleContainer = styled.div<MenuStatus>`
  display: ${({ isMenuClosed }) => (isMenuClosed ? 'none' : 'block')};
  padding: 0.5rem 0.7rem;
`;

const Title = styled.a`
  text-transform: uppercase;
  padding: 0.5rem 0;
  display: block;
  white-space: nowrap;
  font-size: 1em;
  color: #fff;
  text-decoration: none;
  font-weight: 400;
  line-height: 30px;
  overflow: hidden;
  opacity: 1;
  transform: translateZ(0);
`;

const SideBarWrapper = styled.div<MenuStatus>`
  position: relative;
  height: calc(100vh - 75px);
  overflow: hidden auto;
  width: 260px;
  z-index: 4;
  padding-bottom: 100px;
  display: ${({ isMenuClosed }) => (isMenuClosed ? 'none' : 'block')};
`;

function Sidebar(props) {
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
          onClick={(e) => {
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
