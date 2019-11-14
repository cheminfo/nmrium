import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';

import * as serviceWorker from './serviceWorker';
import AdminLayout from './demo/layouts/Admin.jsx';

import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './demo/assets/css/now-ui-dashboard.min.css';
import './demo/assets/css/demo.css';

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path="/admin" render={(props) => <AdminLayout {...props} />} />
      <Redirect to="/admin/dashboard" />
    </Switch>
  </HashRouter>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
