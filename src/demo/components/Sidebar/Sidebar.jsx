/*!

=========================================================
* Now UI Dashboard React - v1.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/now-ui-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/now-ui-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// javascript plugin used to create scrollbars on windows
/* eslint-disable */
import Menu from 'rc-menu';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import 'rc-menu/assets/index.css';
import { FaBars } from 'react-icons/fa';

import logo from '../../assets/img/logo-white.svg';
import { buildMenu, getKey } from '../../utility/menu';
import { withRouter } from 'react-router-dom';

const Sidebar = memo((props) => {
  const sidebarRef = useRef();
  const [isMenuOpen, setMenuState] = useState(true);

  // verifies if routeName is the one active (in browser input)
  // const activeRoute = useCallback((routeName) => {
  //   return props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
  // });

  const menuHandler = useCallback((e) => {
    setMenuState((prestate) => {
      const isOpen = !prestate;
      sidebar.current.className = isOpen
        ? 'sidebar menu-open'
        : 'sidebar menu-close';
      return isOpen;
    });
  }, []);

  const routes = useMemo(() => {
    return buildMenu(props.routes, []);
  }, [props.routes]);

  return (
    <div
      ref={sidebarRef}
      data-color={props.backgroundColor}
      className="sidebar menu-open"
    >
      <button type="button" className="menu-bt" onClick={menuHandler}>
        <FaBars />
      </button>
      <div className="logo">
        <a className="simple-text logo-mini">
          <div className="logo-img">
            <img src={logo} alt="react-logo" />
          </div>
        </a>
        <a className="simple-text logo-normal">NMRium</a>
      </div>
      <div className="sidebar-wrapper" style={{ overflowX: 'hidden' }}>
        <Menu
          onClick={(e) => {
            props.history.push(
              `/SamplesDashboard/${Math.random()
                .toString(36)
                .replace('0.', '')}/${
                e.item.props.view + getKey(e.item.props.file)
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
});

export default withRouter(Sidebar);
