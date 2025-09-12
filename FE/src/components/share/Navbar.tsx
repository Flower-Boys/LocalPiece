import { NavLink } from "react-router-dom";
import { Home, Info } from "lucide-react"; // 아이콘 예시 (lucide-react 라이브러리 사용)

const Navbar = () => {
  return (
    <header className="h-full">
      <nav className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {/* 홈 */}
          <li>
            <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
              <Home size={20} />
              <span className="hidden md:inline">Home</span>
            </NavLink>
          </li>

          {/* 어바웃 */}
          <li>
            <NavLink to="/about" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
              <Info size={20} />
              <span className="hidden md:inline">About</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
