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
import React from 'react';
import 'rc-menu/assets/index.css';
import { FaBars } from 'react-icons/fa';

import logo from '../../assets/img/logo-white.svg';
import { buildMenu, getKey } from '../../utility/menu';

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.sidebar = React.createRef();
    this.activeRoute.bind(this);
    this.menuHandler = this.menuHandler.bind(this);
    this.isMenuOpen = true;
  }

  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
  }

  menuHandler(e) {
    this.isMenuOpen = !this.isMenuOpen;
    this.sidebar.current.className = this.isMenuOpen
      ? 'sidebar menu-open'
      : 'sidebar menu-close';

    this.props.onMenuClose(!this.isMenuOpen);
  }

  render() {
    const routes = buildMenu(this.props.routes, []);
    return (
      <div
        ref={this.sidebar}
        data-color={this.props.backgroundColor}
        className="sidebar menu-open"
      >
        <button type="button" className="menu-bt" onClick={this.menuHandler}>
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
              this.props.history.push(
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
  }
}

export default Sidebar;
