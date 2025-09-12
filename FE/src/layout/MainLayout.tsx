import Footer from "../components/share/Footer";
import Navbar from "../components/share/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 왼쪽 네브바 (데스크탑 전용) */}
      <aside className="hidden md:block w-60 border-r border-gray-200 p-4">
        <Navbar />
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl p-4">
          <Outlet />
        </div>
      </main>

      {/* 푸터 (모바일에서만 고정) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden border-t border-gray-200 bg-white">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
