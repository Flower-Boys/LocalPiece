import { useEffect, useRef, useState } from "react";
import GyeongbukMap from "@/assets/gyeongbuk-map.svg";
import { sigunguCodeLabel } from "../home/constants";

type MapPuzzleProps = {
  visits?: Record<string, number>;
};

// ✅ 이름 → 코드 역매핑
const nameToCode: Record<string, string> = Object.entries(sigunguCodeLabel).reduce((acc, [code, name]) => {
  acc[name] = code;
  return acc;
}, {} as Record<string, string>);

// ✅ 더미 방문 데이터 (코드 기준)
const dummyVisitData: Record<string, number> = {
  "190": 3, // 구미시
  "170": 1, // 안동시
  "110": 5, // 포항시
  "290": 2, // 경산시
};

// ✅ 방문 횟수에 따른 색상
function getColorByCount(count: number): string {
  if (count === 0) return "#e5e7eb"; // gray-200
  if (count < 3) return "#bfdbfe"; // blue-200
  if (count < 5) return "#60a5fa"; // blue-400
  return "#2563eb"; // blue-600
}

export default function MapPuzzle({ visits }: MapPuzzleProps) {
  const visitData = visits ?? dummyVisitData;

  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const [hoverCount, setHoverCount] = useState<number>(0);

  const objectRef = useRef<HTMLObjectElement>(null);
  const cleanupFnsRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    const objectEl = objectRef.current;
    if (!objectEl) return;

    const handleLoad = () => {
      const svgDoc = objectEl.contentDocument;
      if (!svgDoc) return;

      // ✅ 울릉군 먼저 이동 & 크기 조정
      const ullung = svgDoc.querySelector<SVGPathElement>("#울릉군");
      if (ullung) {
        ullung.setAttribute("transform", "translate(-200, 150) scale(1.2)");
      }

      // ✅ 이후 전체 지역 처리
      const regions = Array.from(svgDoc.querySelectorAll<SVGPathElement>("path[id]"));

      regions.forEach((el) => {
        const regionName = el.getAttribute("id") || "";
        const code = nameToCode[regionName];
        const count = code ? visitData[code] ?? 0 : 0;

        // ✅ 기본 스타일
        el.style.fill = getColorByCount(count);
        el.style.stroke = "#4b5563";
        el.style.strokeWidth = "0.5";
        el.style.cursor = "pointer";
        el.style.transition = "all .25s ease";

        const baseTransform = el.getAttribute("transform") || "";

        const onEnter = () => {
          setHoverRegion(regionName);
          setHoverCount(count);

          el.setAttribute("transform", `${baseTransform} scale(1.01)`); // 기존 위치 + 확대
          el.style.filter = "drop-shadow(0 0 8px rgba(37,99,235,0.5)) brightness(1.2)";
          el.style.strokeWidth = "2";
          el.parentNode?.appendChild(el); // hover 시 위로 올리기
        };

        const onLeave = () => {
          setHoverRegion(null);
          el.setAttribute("transform", baseTransform); // 원래 위치로 복원
          el.style.filter = "";
          el.style.strokeWidth = "0.5";
        };

        el.addEventListener("mouseenter", onEnter as EventListener);
        el.addEventListener("mouseleave", onLeave as EventListener);

        cleanupFnsRef.current.push(() => {
          el.removeEventListener("mouseenter", onEnter as EventListener);
          el.removeEventListener("mouseleave", onLeave as EventListener);
        });
      });
    };

    objectEl.addEventListener("load", handleLoad);

    return () => {
      objectEl.removeEventListener("load", handleLoad);
      cleanupFnsRef.current.forEach((fn) => fn());
      cleanupFnsRef.current = [];
    };
  }, [visitData]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 지도 */}
      <object ref={objectRef} id="gyeongbukSvg" type="image/svg+xml" data={GyeongbukMap} className="w-full h-auto border rounded-lg shadow" aria-label="경상북도 시군구 지도" />

      {/* 지도 위 라벨 */}
      {hoverRegion && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 
                   bg-white/80 px-2 py-1 rounded-md text-xs 
                   font-medium text-gray-700 shadow transition-opacity"
        >
          {hoverRegion} · {hoverCount}회 방문
        </div>
      )}

      {/* 선택된 지역 박스 */}
      <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow p-4 text-center">
        {hoverRegion ? (
          <>
            <p className="text-lg font-bold text-blue-600">{hoverRegion}</p>
            <p className="text-sm text-gray-600">방문 {hoverCount}회</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">지역에 마우스를 올려보세요</p>
        )}
      </div>

      {/* 색상 범례 */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#e5e7eb" }} />
          0회
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#bfdbfe" }} />
          1–2회
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#60a5fa" }} />
          3–4회
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#2563eb" }} />
          5회+
        </span>
      </div>
    </div>
  );
}
