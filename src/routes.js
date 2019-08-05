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
import Spectrum13C from "./dashboard/views/Spectrum13C";
import Spectrum1H from "./dashboard/views/Spectrum1H";

// import TableList from "./dashboard/views/TableList.jsx";
// import Maps from "./dashboard/views/Maps.jsx";
// import Upgrade from "./dashboard/views/Upgrade.jsx";
// import UserPage from "./dashboard/views/UserPage.jsx";

var dashRoutes = [

  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "design_image",
  //   component: Icons,
  //   layout: "/admin"
  // },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "location_map-big",
  //   component: Maps,
  //   layout: "/admin"
  // },
  // {
  //   path: "/notifications",
  //   name: "Notifications",
  //   icon: "ui-1_bell-53",
  //   component: Notifications,
  //   layout: "/admin"
  // },
  // {
  //   path: "/user-page",
  //   name: "User Profile",
  //   icon: "users_single-02",
  //   component: UserPage,
  //   layout: "/admin"
  // },
  // {
  //   path: "/extended-tables",
  //   name: "Table List",
  //   icon: "files_paper",
  //   component: TableList,
  //   layout: "/admin"
  // },
  {
    path: "/Spectrum1H",
    name: "1H Spectrum",
    icon: "design-2_ruler-pencil",
    component: Spectrum1H,
    layout: "/admin"
  },
  {
    path: "/Spectrum13C",
    name: "13C Spectrum",
    icon: "design-2_ruler-pencil",
    component: Spectrum13C,
    layout: "/admin"
  }

  // {
  //   pro: true,
  //   path: "/upgrade",
  //   name: "Upgrade to PRO",
  //   icon: "objects_spaceship",
  //   component: Upgrade,
  //   layout: "/admin"
  // }
];
export default dashRoutes;
