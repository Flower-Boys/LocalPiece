// src/components/layout/Navbar.tsx
import { NavLink, useLocation, Link } from "react-router-dom";
import { Home, Info, FileText, Sparkles } from "lucide-react";
import Logo from "../../assets/Logo.png";
// 필요없다면 아래 두 줄은 제거해도 됨
// import { useAuthStore } from "../../store/authStore";
// import { useModalStore } from "../../store/modalStore";

// ✅ 추가: AuthButtons
// import AuthButtons from "@/components/share/auth/AuthButtons";

const Navbar = () => {
  const location = useLocation();
  // const isAiTravelOrMypage = location.pathname.startsWith("/ai/travel") || location.pathname.startsWith("/mypage");

  return (
    <nav className="flex h-full flex-col gap-3 m-2">
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-2">
        <span className="font-logo text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-bold">Local Piece</span>
        <img src={Logo} alt="Local Piece Logo" className="h-8 w-auto" />
      </Link>

      {/* 메뉴 */}
      <div className="mt-5">
        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <Home size={20} />
          <span className="hidden md:inline">Home</span>
        </NavLink>
      </div>

      <div>
        <NavLink to="/blog" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <FileText size={20} />
          <span className="hidden md:inline">Blog</span>
        </NavLink>
      </div>

      <div>
        <NavLink to="/ai/travel" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <Sparkles size={20} />
          <span className="hidden md:inline">AI 여행지 추천</span>
        </NavLink>
      </div>

      <div>
        <NavLink to="/about" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <Info size={20} />
          <span className="hidden md:inline">About</span>
        </NavLink>
      </div>

      {/* ✅ 하단 고정 영역: /ai/travel 에서만 표시 */}
      {/* {isAiTravelOrMypage && (
        <div className="mt-auto pt-4 border-t border-gray-200">
          <AuthButtons />
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
