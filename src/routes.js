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
import Spectrum13C from './dashboard/views/Fid13C';
import Spectrum1H from './dashboard/views/Spectrum1H';
import XTC814d from './dashboard/views/XTC814d';

var dashRoutes = [
  {
    path: '/Spectrum1H',
    name: '1H Spectrum',
    icon: 'design-2_ruler-pencil',
    component: Spectrum1H,
    layout: '/admin',
  },
  {
    path: '/Fid13C',
    name: '13C FID',
    icon: 'design-2_ruler-pencil',
    component: Spectrum13C,
    layout: '/admin',
  },
  {
    path: '/XTC814d',
    name: 'XTC 814d',
    icon: 'design-2_ruler-pencil',
    component: XTC814d,
    layout: '/admin',
  },
];
export default dashRoutes;
