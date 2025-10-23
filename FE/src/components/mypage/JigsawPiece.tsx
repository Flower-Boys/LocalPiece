import { JigsawPieceProps } from "@/types/pieces";

export default function JigsawPiece({ imageUrl, label, subtitle, size = 160, onClick }: JigsawPieceProps) {
  // 하나의 재사용 가능한 퍼즐 경로(조각): 1x1 viewBox 기준
  // - 좌/우는 둥근 탭, 상/하는 홈/탭 비율 섞음
  // - 원하는 모양으로 바꾸고 싶으면 d만 교체하면 됨
  const PATH_D =
    "M0.15,0.35 C0.15,0.22 0.22,0.15 0.35,0.15 L0.42,0.15 C0.46,0.08 0.54,0.04 0.62,0.04 C0.70,0.04 0.78,0.08 0.82,0.15 L0.85,0.15 C0.98,0.15 1.05,0.22 1.05,0.35 L1.05,0.42 C0.98,0.46 0.94,0.54 0.94,0.62 C0.94,0.70 0.98,0.78 1.05,0.82 L1.05,0.85 C1.05,0.98 0.98,1.05 0.85,1.05 L0.78,1.05 C0.74,1.12 0.66,1.16 0.58,1.16 C0.50,1.16 0.42,1.12 0.38,1.05 L0.35,1.05 C0.22,1.05 0.15,0.98 0.15,0.85 L0.15,0.78 C0.08,0.74 0.04,0.66 0.04,0.58 C0.04,0.50 0.08,0.42 0.15,0.38 L0.15,0.35 Z";

  const px = size;

  return (
    <button type="button" onClick={onClick} className="group relative inline-flex select-none" style={{ width: px, height: px }} aria-label={label ?? "조각"}>
      <svg viewBox="0 0 1 1" width={px} height={px} className="drop-shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
        {/* 그림자용 아래층 */}
        <defs>
          <clipPath id="jigsawMask" clipPathUnits="objectBoundingBox">
            <path d={PATH_D} />
          </clipPath>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 배경(이미지) */}
        <image href={imageUrl} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" clipPath="url(#jigsawMask)" filter="url(#softShadow)" />

        {/* 테두리 */}
        <path d={PATH_D} fill="none" stroke="#334155" strokeWidth="0.01" />
      </svg>

      {/* 라벨/메타 (하단 오버레이) */}
      {(label || subtitle) && (
        <div className="pointer-events-none absolute bottom-1 left-1 right-1 rounded-md bg-black/50 px-2 py-1 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          {label && <div className="truncate text-xs font-medium text-white">{label}</div>}
          {subtitle && <div className="truncate text-[10px] text-white/80">{subtitle}</div>}
        </div>
      )}
    </button>
  );
}
