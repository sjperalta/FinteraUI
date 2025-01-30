import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./component/protectedRoute";
import Home from "./pages/home";
import Transaction from "./pages/Transaction";
import Projects from "./pages/projects";
import Users from "./pages/users";
import History from "./pages/history";
import Settings from "./pages/settings";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import ComingSoon from "./pages/commingSoon";
import Error from "./pages/error";
import Layout from "./component/layout";
import PersonalInfo from "./pages/settings/personal-info";
import Security from "./pages/settings/security";
import TermsAndCondition from "./pages/settings/Terms&condition";
import CreateProject from "./src/pages/projects/create";
import LotsList from "./src/pages/projects/lots";
import Reserve from "./src/pages/projects/reserve";
import Balance from "./pages/balance";
import Upload from "./src/pages/balance/upload";
import Summary from "./src/pages/balance/summary";
import Audits from "./pages/audits";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
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
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
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
        path: "/projects/:id/lots/:lot_id/contracts/create",
        element: (
          <ProtectedRoute>
            <Reserve />
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
        path: "/balance/user/:userId",
        Component: Balance,
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
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
