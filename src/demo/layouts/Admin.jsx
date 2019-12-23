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
import React from 'react';
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from 'perfect-scrollbar';
// reactstrap components
import { Route, Switch } from 'react-router-dom';

// core components
import Sidebar from '../components/Sidebar/Sidebar';
import routes from '../samples';
import View from '../views/View';
import { mapTreeToFlatArray, getKey } from '../utility/menu';

let ps;

class Dashboard extends React.Component {
  state = {
    backgroundColor: 'blue',
    routesList: [],
  };
  componentDidMount() {
    if (navigator.platform.indexOf('Win') > -1) {
      ps = new PerfectScrollbar(this.mainPanel.current);
      document.body.classList.toggle('perfect-scrollbar-on');
    }
    this.setState((prevState) => {
      return { ...prevState, routesList: mapTreeToFlatArray(routes) };
    });
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

  handleColorClick = (color) => {
    this.setState({ backgroundColor: color });
  };

  render() {
    return (
      <div className="wrapper">
        <Sidebar
          {...this.props}
          routes={routes}
          backgroundColor={this.state.backgroundColor}
        />
        <div className="main-panel" ref={this.mainPanel}>
          <Switch>
            {this.state.routesList.map((prop) => (
              <Route
                path={`/admin/${getKey(prop.file)}`}
                // component={prop.component}
                render={() => <View {...prop} />}
                key={getKey(prop.file)}
              />
            ))}

            {this.state.routesList.length > 0 && (
              <Route
                path="/"
                // component={prop.component}
                render={() => <View {...this.state.routesList[0]} />}
                key={getKey(this.state.routesList[0].file)}
              />
            )}
          </Switch>
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
