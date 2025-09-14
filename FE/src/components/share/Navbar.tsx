import { NavLink } from "react-router-dom";
import { Home, Info, FileText, Sparkles } from "lucide-react";
import Logo from "../../assets/Logo.png";

const Navbar = () => {
  return (
    <nav className="flex flex-col gap-3 m-2">
      {/* 로고 버튼 */}
      <button onClick={() => window.location.replace("/")} className="flex gap-2 items-center">
        <span className="font-logo text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-bold">Local Piece</span>
        <img src={Logo} alt="Local Piece Logo" className="h-8 w-auto" />
      </button>

      {/* 메뉴 아이템 */}
      <div className="mt-5">
        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <Home size={20} />
          <span className="hidden md:inline">Home</span>
        </NavLink>
      </div>

      <div>
        <NavLink to="/about" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <Info size={20} />
          <span className="hidden md:inline">About</span>
        </NavLink>
      </div>

      <div>
        <NavLink to="/blog" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <FileText size={20} />
          <span className="hidden md:inline">Blog</span>
        </NavLink>
      </div>

      {/* ✅ AI 자동 여행지 추천 */}
      <div>
        <NavLink to="/ai/travel" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
          <Sparkles size={20} />
          <span className="hidden md:inline">AI 여행지 추천</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
