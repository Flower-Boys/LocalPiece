// src/components/share/Footer.tsx
import localPieceLogo from "../../assets/Logo.png"; // ✅ 퍼즐 모양 로고 준비하기

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center border-t bg-gray-50">
      {/* 로고 + 서비스명 */}
      <div className="flex items-center gap-2 py-4">
        <img src={localPieceLogo} alt="LocalPiece" className="h-7" />
        <span className="text-sm font-semibold text-gray-700">LocalPiece</span>
      </div>

      {/* 경북 데이터 출처 표시 */}
      <div className="text-xs text-gray-500">Powered by 경상북도 관광 데이터</div>

      {/* 저작권 표시 */}
      <div className="text-xs text-gray-400 py-2">© 2025 LocalPiece. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
