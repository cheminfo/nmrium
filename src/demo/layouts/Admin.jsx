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
// reactstrap components
import { Route, Switch, MemoryRouter } from 'react-router-dom';

// core components
import Sidebar from '../components/Sidebar/Sidebar';
import { mapTreeToFlatArray, getKey } from '../utility/menu';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.menuCloseHandler = this.menuCloseHandler.bind(this);
    this.mainPanel = React.createRef();
  }

  state = {
    backgroundColor: 'blue',
    routesList: [],
    routes: [],
  };

  componentDidMount() {
    this.setState((prevState) => {
      return {
        ...prevState,
        routesList: mapTreeToFlatArray(this.props.routes),
        routes: this.props.routes,
      };
    });
  }

  componentDidUpdate(e) {
    if (e.history.action === 'PUSH') {
      this.mainPanel.current.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
    }
  }

  menuCloseHandler = (flag) => {
    setTimeout(() => {
      this.mainPanel.current.className = flag
        ? 'main-panel main-panel-when-menu-closed'
        : 'main-panel';
    }, 200);
  };

  render() {
    return (
      <div className="wrapper">
        <MemoryRouter>
          <Sidebar
            {...this.props}
            routes={this.state.routes}
            backgroundColor={this.state.backgroundColor}
            onMenuClose={this.menuCloseHandler}
          />
          <div className="main-panel" ref={this.mainPanel}>
            <React.StrictMode>
              <Suspense fallback={<div>Loading...</div>}>
                <Switch>
                  {this.state.routesList.map((prop) => (
                    <Route
                      path={`/SamplesDashboard/:id/${
                        prop.view + getKey(prop.file)
                      }`}
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
                      render={() => {
                        const routeProp = this.state.routesList[0];
                        const viewName = routeProp.view
                          ? routeProp.view
                          : 'View';
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
            </React.StrictMode>
          </div>
        </MemoryRouter>
      </div>
    );
  }
}

export default Dashboard;
