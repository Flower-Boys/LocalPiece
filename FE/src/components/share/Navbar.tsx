import { NavLink } from "react-router-dom";
import { Home, Info } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="flex flex-col gap-3">
      <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
        <Home size={20} />
        <span className="hidden md:inline">Home</span>
      </NavLink>

      <NavLink to="/about" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}>
        <Info size={20} />
        <span className="hidden md:inline">About</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;
