import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/main/index.js";
import Index from "../view/error-page/index.js";
import authRoutes from "./auth/index.js";
import adminRoutes from './admin/index.jsx';
import HomePage from "../view/home/index.js";
import PrivateRoute from "./private/index.js";
import NotFound from "../view/not-found/index.js";

const routes = [
    // common home page route 
    {
        path: "/",
        element: <PrivateRoute allowedRoles={['admin']}>
            <MainLayout />
        </PrivateRoute>,
        errorElement: <Index />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
        ]
    },
    {
        path: "*",
        element: <NotFound />
    },
    ...authRoutes,
    ...adminRoutes,
]

const router = createBrowserRouter(
    routes
);

export default router;
