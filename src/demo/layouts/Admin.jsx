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
import React, { Suspense } from 'react';
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from 'perfect-scrollbar';
// reactstrap components
import { Route, Switch } from 'react-router-dom';

// core components
import Sidebar from '../components/Sidebar/Sidebar';
// import View from '../views/View';
import { mapTreeToFlatArray, getKey } from '../utility/menu';

let ps;
let localRoutes;
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.menuCloseHandler = this.menuCloseHandler.bind(this);
  }

  state = {
    backgroundColor: 'blue',
    routesList: [],
    routes: [],
    isMenuClosed: false,
  };

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    localRoutes = this.props.routes ? this.props.routes : localRoutes;
    this.setState((prevState) => {
      return {
        ...prevState,
        routesList: mapTreeToFlatArray(localRoutes),
        routes: localRoutes,
      };
    });
  }

  componentDidMount() {
    if (navigator.platform.indexOf('Win') > -1) {
      ps = new PerfectScrollbar(this.mainPanel.current);
      document.body.classList.toggle('perfect-scrollbar-on');
    }
  }

  componentDidUpdate(e) {
    if (e.history.action === 'PUSH') {
      this.mainPanel.current.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
    }
  }

  componentWillUnmount() {
    if (navigator.platform.indexOf('Win') > -1) {
      ps.destroy();
      document.body.classList.toggle('perfect-scrollbar-on');
    }
  }
  mainPanel = React.createRef();

  // handleColorClick = (color) => {
  //   this.setState({ backgroundColor: color });
  // };

  menuCloseHandler = (flag) => {
    this.setState((prev) => {
      return { ...prev, isMenuClosed: flag };
    });
  };

  render() {
    return (
      <div className="wrapper">
        <Sidebar
          {...this.props}
          routes={this.state.routes}
          backgroundColor={this.state.backgroundColor}
          onMenuClose={this.menuCloseHandler}
        />
        <div
          className={
            this.state.isMenuClosed
              ? 'main-panel main-panel-when-menu-closed'
              : 'main-panel'
          }
          ref={this.mainPanel}
        >
          {/* <Router {...this.props}> */}
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              {this.state.routesList.map((prop) => (
                <Route
                  path={`/SamplesDashboard/:id/${getKey(prop.file)}`}
                  // component={prop.component}
                  render={(props) => {
                    const {
                      match: {
                        params: { id },
                      },
                    } = props;
                    const viewName = prop.view ? prop.view : 'View';
                    const RenderedView = React.lazy(() =>
                      import(`../views/${viewName}`),
                    );

                    return (
                      <RenderedView
                        key={id}
                        {...prop}
                        id={getKey(prop.file)}
                        baseURL={this.props.baseURL}
                      />
                    );
                  }}
                  key={getKey(prop.file)}
                />
              ))}

              {this.state.routesList.length > 0 && (
                <Route
                  path="/"
                  // component={prop.component}

                  render={() => {
                    const routeProp = this.state.routesList[0];
                    const viewName = routeProp.view ? routeProp.view : 'View';
                    const RenderedView = React.lazy(() =>
                      import(`../views/${viewName}`),
                    );

                    return <RenderedView {...routeProp[0]} />;
                  }}
                  key={getKey(this.state.routesList[0].file)}
                />
              )}
            </Switch>
          </Suspense>
          {/* </Router> */}
          {/* <DemoNavbar {...this.props} /> */}
          {/* <Switch>
            {routes.map((prop, key) => {
              return (
                <Route
                  path={prop.layout + prop.path}
                  // component={prop.component}
                  render={(props) =>
                    React.cloneElement(prop.component, { ...props, ...prop })
                  }
                  key={key}
                />
              );
            })}
            <Redirect from="/admin" to={`/admin${routes[0].path}`} />
          </Switch> */}

          {/* <Footer fluid /> */}
        </div>
        {/* <FixedPlugin
          bgColor={this.state.backgroundColor}
          handleColorClick={this.handleColorClick}
        /> */}
      </div>
    );
  }
}

export default Dashboard;
