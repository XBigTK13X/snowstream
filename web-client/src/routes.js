import AdminPage from "./page/admin";
import HomePage from "./page/home";

var routes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
];

export default routes;
