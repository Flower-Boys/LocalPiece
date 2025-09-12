import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import Blog from "../pages/blogs/BlogPage";
import NotFound from "../pages/errors/NotFound";
import BlogWrite from "../pages/blogs/BlogWrite";

// const isAuthenticated = () => {
//   return !!localStorage.getItem("token");
// };

const router = createBrowserRouter([
  {
    path: "/",
    // element: isAuthenticated() ? <MainLayout /> : <Navigate to="/login" replace />,
    element: <MainLayout />, // 로그인 체크 임시 주석 → 항상 MainLayout
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/write", element: <BlogWrite /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
