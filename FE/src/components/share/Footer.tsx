// src/components/share/Footer.tsx
import { NavLink } from "react-router-dom";
import { Home, Info } from "lucide-react";

// ✅ 로고 import
import koreanTourImg from "../../assets/koreanTourImg.svg";
import tourAPIImg from "../../assets/tourAPIImg.png";

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center border-t bg-gray-50">
      {/* 파트너/정보 링크 */}
      <div className="flex justify-center gap-8 py-4 bg-gray-100 w-full">
        <a href="https://kto.visitkorea.or.kr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={koreanTourImg} alt="한국관광공사" className="h-7" />
          {/* <span className="text-sm text-gray-700">한국관광공사</span> */}
        </a>
        <a href="https://api.visitkorea.or.kr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={tourAPIImg} alt="TourAPI" className="h-7" />
          {/* <span className="text-sm text-gray-700">TourAPI</span> */}
        </a>
      </div>

      {/* 저작권 표시 */}
      <div className="text-xs text-gray-500 py-2">© 2025 LocalPiece. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
