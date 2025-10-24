import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import Blog from "../pages/blogs/BlogPage";
import NotFound from "../pages/errors/NotFound";
import BlogWrite from "../pages/blogs/BlogWrite";
import BlogDetail from "@/pages/blogs/BlogDetail";
import BlogEditPage from "@/pages/blogs/BlogEditPage";
import TourDetail from "@/components/tour/TourDetail";
import { AiTravelDetail, AiTravelLanding, CategorySelect, AiResultPreview } from "@/pages/aitravel";
import MyPage from "@/pages/mypage/MyPage";

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
      { path: "/blog/:id", element: <BlogDetail /> },
      { path: "/tour/:id", element: <TourDetail /> },
      { path: "/ai/travel", element: <AiTravelLanding /> },
      { path: "/ai/travel/builder", element: <CategorySelect /> },
      { path: "/ai/travel/result", element: <AiResultPreview /> },
      { path: "/mypage", element: <MyPage /> },
      { path: "/blog/:id/edit", element: <BlogEditPage /> },
      { path: "/ai/travel/route-detail", element: <AiTravelDetail /> },
    ],
  },
  // { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
