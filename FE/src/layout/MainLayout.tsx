import Navbar from "../components/share/Navbar";
import Footer from "../components/share/Footer";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 왼쪽 네비게이션 (데스크탑 전용) */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-gray-200 p-4 sticky top-0 h-screen">
        <Navbar />
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex justify-center">
        <div className={`w-full p-4 pb-20 md:pb-4 ${isHome ? "" : "max-w-2xl"}`}>
          <Outlet />
        </div>
      </main>

      {/* 모바일 전용 하단 네비 */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden border-t border-gray-200 bg-white">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
