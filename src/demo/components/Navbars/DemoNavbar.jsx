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

import { Component, createRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
} from 'reactstrap';
import routes from 'routes.js';

class Header extends Component {
  state = {
    isOpen: false,
    dropdownOpen: false,
    color: 'transparent',
  };

  componentDidMount() {
    window.addEventListener('resize', this.updateColor.bind(this));
  }

  componentDidUpdate(e) {
    if (
      window.innerWidth < 993 &&
      e.history.location.pathname !== e.location.pathname &&
      document.documentElement.className.indexOf('nav-open') !== -1
    ) {
      document.documentElement.classList.toggle('nav-open');
      this.sidebarToggle.current.classList.toggle('toggled');
    }
  }

  sidebarToggle = createRef();
  toggle = () => {
    if (this.state.isOpen) {
      this.setState({
        color: 'transparent',
      });
    } else {
      this.setState({
        color: 'white',
      });
    }
    this.setState((state) => ({
      isOpen: !state.isOpen,
    }));
  };
  dropdownToggle = () => {
    this.setState((state) => ({
      dropdownOpen: !state.dropdownOpen,
    }));
  };
  getBrand = () => {
    let name;
    routes.map((route) => {
      if (route.collapse) {
        route.views.map(() => {
          if (route.path === this.props.location.pathname) {
            name = route.name;
          }
          return null;
        });
      } else {
        if (route.redirect) {
          if (route.path === this.props.location.pathname) {
            name = route.name;
          }
        } else {
          if (route.path === this.props.location.pathname) {
            name = route.name;
          }
        }
      }
      return null;
    });
    return name;
  };
  openSidebar = () => {
    document.documentElement.classList.toggle('nav-open');
    this.sidebarToggle.current.classList.toggle('toggled');
  };
  // function that adds color white/transparent to the navbar on resize (this is for the collapse)
  updateColor = () => {
    if (window.innerWidth < 993 && this.state.isOpen) {
      this.setState({
        color: 'white',
      });
    } else {
      this.setState({
        color: 'transparent',
      });
    }
  };

  render() {
    return (
      // add or remove classes depending if we are on full-screen-maps page or not
      <Navbar
        color={
          this.props.location.pathname.indexOf('full-screen-maps') !== -1
            ? 'white'
            : this.state.color
        }
        expand="lg"
        className={
          this.props.location.pathname.indexOf('full-screen-maps') !== -1
            ? 'navbar-absolute fixed-top'
            : `navbar-absolute fixed-top ${
                this.state.color === 'transparent' ? 'navbar-transparent ' : ''
              }`
        }
      >
        <Container fluid>
          <div className="navbar-wrapper">
            <div className="navbar-toggle">
              <button
                type="button"
                ref={this.sidebarToggle}
                className="navbar-toggler"
                onClick={() => this.openSidebar()}
              >
                <span className="navbar-toggler-bar bar1" />
                <span className="navbar-toggler-bar bar2" />
                <span className="navbar-toggler-bar bar3" />
              </button>
            </div>
            <NavbarBrand href="/">{this.getBrand()}</NavbarBrand>
          </div>
          <NavbarToggler onClick={this.toggle}>
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
          </NavbarToggler>
          <Collapse
            isOpen={this.state.isOpen}
            navbar
            className="justify-content-end"
          >
            <form>
              <InputGroup className="no-border">
                <Input placeholder="Search..." />
                <InputGroupAddon addonType="append">
                  <InputGroupText>
                    <i className="now-ui-icons ui-1_zoom-bold" />
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </form>
            <Nav navbar>
              <NavItem>
                <Link to="#pablo" className="nav-link">
                  <i className="now-ui-icons media-2_sound-wave" />
                  <p>
                    <span className="d-lg-none d-md-block">Stats</span>
                  </p>
                </Link>
              </NavItem>
              <Dropdown
                nav
                isOpen={this.state.dropdownOpen}
                toggle={(e) => this.dropdownToggle(e)}
              >
                <DropdownToggle caret nav>
                  <i className="now-ui-icons location_world" />
                  <p>
                    <span className="d-lg-none d-md-block">Some Actions</span>
                  </p>
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag="a">Action</DropdownItem>
                  <DropdownItem tag="a">Another Action</DropdownItem>
                  <DropdownItem tag="a">Something else here</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <NavItem>
                <Link to="#pablo" className="nav-link">
                  <i className="now-ui-icons users_single-02" />
                  <p>
                    <span className="d-lg-none d-md-block">Account</span>
                  </p>
                </Link>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default Header;
