import Navbar from "../components/share/Navbar";
import Footer from "../components/share/Footer";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 메인 영역 (네브바 + 컨텐츠) */}
      <div className="flex flex-1">
        {/* 왼쪽 네비게이션 (데스크탑 전용) */}
        <aside className="hidden md:flex md:flex-col w-60 border-r border-gray-200 p-4 sticky top-0 h-screen">
          <Navbar />
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex justify-center">
          <div
            className={`w-full p-4 pb-20 md:pb-4 ${
              isHome || location.pathname.startsWith("/tour") || location.pathname.startsWith("/mypage") || location.pathname.startsWith("/blog") || location.pathname.startsWith("/ai/travel") // ✅ 블로그 페이지도 전체폭
                ? ""
                : "max-w-2xl"
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* ✅ Footer: 전체 하단에 네브바 포함 */}
      <footer className="border-t border-gray-200 bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
