/** @jsxImportSource @emotion/react */

import { useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import Menu from 'rc-menu';
import { memo, useMemo } from 'react';
import 'rc-menu/assets/index.css';
import { FaBars } from 'react-icons/fa';

import { buildMenu, getKey } from './utility/menu';

const sidebarCss = css`
  background: #2ca8ff;
  position: fixed;
  top: 0;
  height: 100%;
  bottom: 0;
  left: 0;
  z-index: 1031;
`;

const sidebarOpenCss = css`
  width: 260px;
`;

const sidebarClosedCss = css`
  width: 3%;
`;

const menuBtCss = css`
  margin-left: 4px;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-right: 4px;
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
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
  }
`;

const logoCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 4;
  border-bottom: 1px solid #eee;
`;

const simpleTextCss = css`
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
`;

const logoNormalCss = css`
  display: block;
  opacity: 1;
  transform: translateZ(0);
`;

const sidebarWrapperCss = css`
  position: relative;
  height: calc(100vh - 75px);
  overflow-y: auto;
  overflow-x: hidden;
  width: 260px;
  z-index: 4;
  padding-bottom: 100px;
`;

function Sidebar(props) {
  const navigate = useNavigate();
  const routes = useMemo(() => {
    return buildMenu(props.routes);
  }, [props.routes]);

  const subDisplay = props.menuIsClosed ? 'none' : 'block';

  return (
    <div
      css={css(
        sidebarCss,
        props.menuIsClosed ? sidebarClosedCss : sidebarOpenCss,
      )}
    >
      <div css={logoCss}>
        <div style={{ display: subDisplay, padding: '0.5rem 0.7rem' }}>
          <a css={css(simpleTextCss, logoNormalCss)}>NMRium</a>
        </div>
        <button type="button" css={menuBtCss} onClick={props.onMenuToggle}>
          <FaBars />
        </button>
      </div>
      <div css={sidebarWrapperCss} style={{ display: subDisplay }}>
        <Menu
          onClick={(e) => {
            navigate(
              `/SamplesDashboard/${Math.random()
                .toString(36)
                .replace('0.', '')}/${
                // @ts-expect-error This will be fixed by updating use of rc-menu
                (e.item.props.view || 'View') + getKey(e.item.props.file)
              }`,
            );
          }}
          mode="inline"
        >
          {routes}
        </Menu>
      </div>
    </div>
  );
}

export default memo(Sidebar);
