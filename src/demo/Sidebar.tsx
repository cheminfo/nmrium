/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import Menu from 'rc-menu';
import { memo, useMemo } from 'react';
import { FaBars } from 'react-icons/fa';
import { createSearchParams, useNavigate } from 'react-router-dom';
import 'rc-menu/assets/index.css';

import { buildMenu, getKey } from './utility/menu';

const sidebarCss = css`
  background: #2ca8ff;
  position: fixed;
  top: 0;
  height: 100%;
  bottom: 0;
  left: 0;
  z-index: 19;
`;

const sidebarOpenCss = css`
  width: 260px;
`;

const sidebarClosedCss = css`
  width: 3%;
`;

const menuBtCss = css`
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
  overflow: hidden auto;
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
      className="demo-side-bar"
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
            // TODO: use non-deprecated API of rc-menu
            // @ts-expect-error This will be fixed by updating use of rc-menu
            // eslint-disable-next-line deprecation/deprecation
            const itemProps = e.item.props;
            navigate({
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
      </div>
    </div>
  );
}

export default memo(Sidebar);
