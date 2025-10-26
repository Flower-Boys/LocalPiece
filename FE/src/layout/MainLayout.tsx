import Navbar from "../components/share/Navbar";
import Footer from "../components/share/Footer";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isTour = location.pathname.startsWith("/tour");
  const isMypage = location.pathname.startsWith("/mypage");
  const isAiTravel = location.pathname.startsWith("/ai/travel");
  const isBlog = location.pathname.startsWith("/blog"); // 목록 + 상세 전부 포함

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        {/* 왼쪽 네비게이션 */}
        <aside className="hidden md:flex md:flex-col w-60 border-r border-gray-200 p-4 sticky top-0 h-screen">
          <Navbar />
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex justify-center">
          <div
            className={`w-full p-4 pb-20 md:pb-4 ${
              isHome || isTour || isMypage || isAiTravel || isBlog
                ? "" // 전체폭
                : "max-w-2xl" // 나머지 기본
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="border-t border-gray-200 bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
