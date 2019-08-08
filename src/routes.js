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
import CoupledDecoupled13C from './dashboard/views/CoupledDecoupled13C';
import Big13CCytisin from './dashboard/views/Big13CCytisin';
import CoffeView from './dashboard/views/CoffeView';

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
    path: '/Big13CCytisin',
    name: 'Big 13c',
    icon: 'design-2_ruler-pencil',
    component: Big13CCytisin,
    layout: '/admin',
  },
  {
    path: '/XTC814d',
    name: 'XTC',
    icon: 'design-2_ruler-pencil',
    component: XTC814d,
    layout: '/admin',
  },
  {
    path: '/CoffeView',
    name: 'Coffee',
    icon: 'design-2_ruler-pencil',
    component: CoffeView,
    layout: '/admin',
  },
  {
    path: '/CoupledDecoupled13C',
    name: '13C coupled / decoupled spectra',
    icon: 'design-2_ruler-pencil',
    component: CoupledDecoupled13C,
    layout: '/admin',
  },
];
export default dashRoutes;
