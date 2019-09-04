import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import * as serviceWorker from './serviceWorker';

// import {MolfileDemo} from './test'

import { createBrowserHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./dashboard/assets/scss/now-ui-dashboard.scss?v1.2.0";
import "./dashboard/assets/css/demo.css";

import AdminLayout from "./dashboard/layouts/Admin.jsx";

const hist = createBrowserHistory();

ReactDOM.render(
//   <MolfileDemo
//   svgMenu={true}
//   fragment={false}
// />,
  <Router history={hist}>
    <Switch>
      <Route path="/admin" render={props => <AdminLayout {...props} />} />
      <Redirect to="/admin/dashboard" />
    </Switch>
  </Router>,
  document.getElementById("root")
);




// ReactDOM.render(<App />, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
