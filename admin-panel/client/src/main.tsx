import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import VoterList from "./pages/VoterList.tsx";
import CandidateList from "./pages/CandidateList.tsx";
import ElectionList from "./pages/ElectionList.tsx";
import NotFound from "./pages/NotFound.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import ConstituencyList from "./pages/ConstituencyList.tsx";
import EditConstituency from "./pages/EditConstituency.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "voter-records",
        Component: VoterList,
      },
      {
        path: "constituency-records",
        Component: ConstituencyList,
      },
      {
        path: "constituency-records/:constituencyNumber",
        Component: EditConstituency,
      },
      {
        path: "candidate-records",
        Component: CandidateList,
      },
      {
        path: "election-records",
        Component: ElectionList,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
