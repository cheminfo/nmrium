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
// import Notifications from "./dashboard/views/Notifications.jsx";
// import Icons from "./dashboard/views/Icons.jsx";
import React from 'react';

import samples from './samples.json';
import View from './views/View';

let dashRoutes = samples.map((sample) => {
  return {
    path: `/${sample.title.replace(' ', '-')}`,
    name: sample.title,
    icon: 'design-2_ruler-pencil',
    component: <View file={sample.file} title={sample.title} />,
    layout: '/admin',
  };
});

export default dashRoutes;
