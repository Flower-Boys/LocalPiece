import { NavLink } from "react-router-dom";
import { Home, Info } from "lucide-react";

const Footer = () => {
  return (
    <footer className="flex justify-around items-center h-14 bg-white">
      {/* <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-2 ${isActive ? "text-blue-500" : "text-gray-500"}`}>
        <Home size={22} />
        <span className="text-xs">Home</span>
      </NavLink>

      <NavLink to="/about" className={({ isActive }) => `flex flex-col items-center justify-center flex-1 py-2 ${isActive ? "text-blue-500" : "text-gray-500"}`}>
        <Info size={22} />
        <span className="text-xs">About</span>
      </NavLink> */}
    </footer>
  );
};

export default Footer;
