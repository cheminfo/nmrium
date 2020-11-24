import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';

import Main from './demo/layouts/Main';
import * as serviceWorker from './demo/serviceWorker';
import TestRoutes from './demo/test/TestRoutes.jsx';

import 'cheminfo-font/dist/style.css';
import 'react-animated-slider-2/build/horizontal.css';
import 'bootstrap/dist/css/bootstrap.css';
import './demo/index.css';
import './demo/assets/css/now-ui-dashboard.min.css';
import './demo/assets/css/demo.css';

const nmrDisplayerRootNode = document.getElementById('root');
document.nmrDisplayerRootNode = nmrDisplayerRootNode;

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path="/" render={(props) => <Main {...props} />} />
      <Route path="/test" component={TestRoutes} />
    </Switch>
  </HashRouter>,
  nmrDisplayerRootNode,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
