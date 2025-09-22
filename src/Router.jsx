import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./component/protectedRoute";
import Home from "./pages/home";
import Contracts from "./pages/contract";
import Transaction from "./pages/transaction";
import Projects from "./pages/projects";
import Users from "./pages/users";
import History from "./pages/audits";
import Settings from "./pages/settings";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import ComingSoon from "./pages/commingSoon";
import Error from "./pages/error";
import Layout from "./component/layout";
import RouteErrorElement from "./component/error/RouteErrorElement";
import PersonalInfo from "./pages/settings/personal-info";
import Security from "./pages/settings/security";
import TermsAndCondition from "./pages/settings/terms&condition";
import CreateProject from "./pages/projects/create";
import EditProject from "./pages/projects/edit";
import AdminRoute from "./component/protectedRoute/AdminRoute";
import LotsList from "./pages/projects/lots";
import CreateLot from "./pages/projects/lots/create";
import EditLot from "./pages/projects/lots/edit";
import Reserve from "./pages/projects/reserve";
import CreateUser from "./pages/users/create";
import Balance from "./pages/balance";
import Upload from "./pages/balance/upload";
import Summary from "./pages/balance/summary";
import AdminOrOwnerRoute from "./component/protectedRoute/AdminOrOwnerRoute";
import Audits from "./pages/audits";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <RouteErrorElement />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/contracts",
        element: (
          <ProtectedRoute>
            <Contracts />
          </ProtectedRoute>
        ),
      },
      {
        path: "/transaction",
        element: (
          <ProtectedRoute>
            <Transaction />
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects",
        element: (
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects/create",
        element: (
          <AdminRoute>
            <CreateProject />
          </AdminRoute>
        ),
      },
      {
        path: "/projects/:id/edit",
        element: (
          <AdminRoute>
            <EditProject />
          </AdminRoute>
        ),
      },
      {
        path: "/projects/:id/lots",
        element: (
          <ProtectedRoute>
            <LotsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects/:id/lots/create",
        element: (
          <AdminRoute>
            <CreateLot />
          </AdminRoute>
        ),
      },
      {
        path: "/projects/:project_id/lots/:lot_id/edit",
        element: (
          <ProtectedRoute>
            <EditLot />
          </ProtectedRoute>
        ),
      },
      {
        path: "/audits",
        element: (
          <ProtectedRoute>
            <Audits />
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects/:id/lots/:lot_id/contracts/create",
        element: (
          <ProtectedRoute>
            <Reserve />
          </ProtectedRoute>
        ),
      },
      {
        path: "/balance/user/:userId",
        element: (
          <AdminOrOwnerRoute>
            <Balance />
          </AdminOrOwnerRoute>
        ),
        children: [
          {
            index: true,
            element: <Summary />,
          },
          {
            path: "payment/:paymentId/upload",
            element: <Upload />,
          },
        ]
      },
      {
        path: "/settings/user/:userId",
        Component: Settings,
        children: [
          {
            index: true,
            element: <PersonalInfo />,
          },
          {
            path: "security",
            element: <Security />,
          },
          {
            path: "terms&conditions",
            element: <TermsAndCondition />,
          },
        ],
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/create",
        element: (
          <ProtectedRoute>
            <CreateUser />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/coming-soon",
    element: <ComingSoon />,
  },
  {
    path: "/404",
    element: <Error />,
  },
], {
  future: {
    v7_startTransition: true,
  },
});

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
