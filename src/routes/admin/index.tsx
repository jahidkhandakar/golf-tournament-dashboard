import { Navigate } from "react-router-dom";
import DashboardLayout from "../../layout/dashboard/index.jsx";
import Dashboard from "../../view/admin/dashboard/index.js";
import Users from "../../view/admin/users/index.js";
import Coaches from "../../view/admin/coaches/index.js";
import SwingCategories from "../../view/admin/swing-categories/index.js";
import Analytics from "../../view/admin/analytics/index.js";
import Notifications from "../../view/admin/notifications/index.js";
import Subscriptions from "../../view/admin/subscriptions/index.js";
import Settings from "../../view/admin/settings/index.js";
import PrivateRoute from "../private/index.js";

const adminRoutes = [
  {
    path: "/admin/",
    element: (
      // <PrivateRoute allowedRoles={["admin"]}>
        <DashboardLayout />
      // </PrivateRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate replace to="dashboard" />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "coaches",
        element: <Coaches />,
      },
      {
        path: "swing-categories",
        element: <SwingCategories />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "subscriptions",
        element: <Subscriptions />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
];

export default adminRoutes;
