import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import About from "../pages/About";

const router = createBrowserRouter([
  {
    path:'/',
    element: <MainLayout />,
    children: [
      {path:'', element: <Home />},
      {path:'', element: <About />},
    ]
  }
])

export default router