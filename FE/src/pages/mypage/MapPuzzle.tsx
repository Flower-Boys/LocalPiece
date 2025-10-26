import { useEffect, useMemo, useRef, useState } from "react";
import GyeongbukMap from "@/assets/gyeongbuk-map.svg";
import { sigunguCodeLabel } from "../../components/home/constants";

type MapPuzzleProps = {
  /** 코드("190") -> 방문횟수 매핑 (필수) */
  visits: Record<string, number>;
  /** 지역 클릭 시 호출. 매개변수 예: "경주시", "포항시" */
  onSelectCity?: (regionName: string) => void;
};

// 이름 → 코드 역매핑
const nameToCode: Record<string, string> = Object.entries(sigunguCodeLabel).reduce((acc, [code, name]) => {
  acc[name] = code;
  return acc;
}, {} as Record<string, string>);

// 방문 횟수 → 색상
function getColorByCount(count: number): string {
  if (!count || count === 0) return "#e5e7eb"; // gray-200
  if (count < 3) return "#bfdbfe"; // blue-200
  if (count < 5) return "#60a5fa"; // blue-400
  return "#2563eb"; // blue-600
}

/**
 * NOTE
 * - <object> 대신 fetch로 SVG 텍스트를 가져와 인라인 주입합니다.
 * - 이렇게 하면 React Strict Mode에서도 이벤트가 끊기지 않고,
 *   부모 콜백 변경에도 영향을 덜 받아 클릭/호버가 안정적입니다.
 */
export default function MapPuzzle({ visits, onSelectCity }: MapPuzzleProps) {
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const [hoverCount, setHoverCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cleanupFnsRef = useRef<Array<() => void>>([]);

  // 최신 onSelectCity를 참조하도록 ref에 보관
  const onSelectRef = useRef<typeof onSelectCity>();
  useEffect(() => {
    onSelectRef.current = onSelectCity;
  }, [onSelectCity]);

  // SVG 주입 + 최초 이벤트 부착
  useEffect(() => {
    let aborted = false;

    async function loadSvg() {
      try {
        if (!containerRef.current) return;

        // 1) 기존 내용/리스너 정리
        cleanupFnsRef.current.forEach((fn) => fn());
        cleanupFnsRef.current = [];
        containerRef.current.innerHTML = "";
        svgRef.current = null;

        // 2) SVG 텍스트 로드 후 인라인 주입
        const res = await fetch(GyeongbukMap);
        const text = await res.text();
        if (aborted) return;

        containerRef.current.innerHTML = text;
        const svg = containerRef.current.querySelector("svg") as SVGSVGElement | null;
        if (!svg) return;
        svgRef.current = svg;

        // 3) 울릉군 위치 보정
        const ullung = svg.querySelector<SVGElement>("#울릉군");
        if (ullung) {
          const base = ullung.getAttribute("transform") || "";
          ullung.setAttribute("transform", `${base} translate(-200, 150) scale(1.2)`.trim());
        }

        // 4) 지역 path/group 요소 선택 (id가 있는 모든 그래픽 요소 대상)
        //    path 뿐 아니라 polygon, g 등에 id가 있을 수 있으므로 [id] 전체를 잡되,
        //    클릭 대상은 실제 형상이 있는 요소들만 필터링
        const candidates = Array.from(svg.querySelectorAll<SVGElement>("[id]")).filter((el) => {
          const tag = el.tagName.toLowerCase();
          // path/polygon/rect/circle/ellipse/polyline 기본 우선
          return ["path", "polygon", "rect", "circle", "ellipse", "polyline"].includes(tag);
        });

        candidates.forEach((el) => {
          const regionName = el.getAttribute("id") || "";
          const code = nameToCode[regionName];
          const count = code ? visits[code] ?? 0 : 0;

          // 스타일
          (el as SVGElement).style.fill = getColorByCount(count);
          (el as SVGElement).style.stroke = "#4b5563";
          (el as SVGElement).style.strokeWidth = "0.5";
          (el as SVGElement).style.cursor = "pointer";
          (el as SVGElement).style.transition = "all .25s ease";

          const baseTransform = el.getAttribute("transform") || "";

          const onEnter = () => {
            const codeNow = nameToCode[regionName];
            const countNow = codeNow ? visits[codeNow] ?? 0 : 0;

            setHoverRegion(regionName);
            setHoverCount(countNow);

            el.setAttribute("transform", `${baseTransform} scale(1.01)`.trim());
            (el as SVGElement).style.filter = "drop-shadow(0 0 8px rgba(37,99,235,0.5)) brightness(1.2)";
            (el as SVGElement).style.strokeWidth = "2";

            // z-order 올리기: 같은 부모 내에서 맨 뒤로 이동
            el.parentNode?.appendChild(el);
          };

          const onLeave = () => {
            setHoverRegion(null);
            el.setAttribute("transform", baseTransform);
            (el as SVGElement).style.filter = "";
            (el as SVGElement).style.strokeWidth = "0.5";
          };

          const onClick = () => {
            onSelectRef.current?.(regionName);
          };

          el.addEventListener("mouseenter", onEnter as EventListener);
          el.addEventListener("mouseleave", onLeave as EventListener);
          el.addEventListener("click", onClick as EventListener);

          cleanupFnsRef.current.push(() => {
            el.removeEventListener("mouseenter", onEnter as EventListener);
            el.removeEventListener("mouseleave", onLeave as EventListener);
            el.removeEventListener("click", onClick as EventListener);
          });
        });
      } catch (e) {
      }
    }

    loadSvg();
    return () => {
      aborted = true;
      cleanupFnsRef.current.forEach((fn) => fn());
      cleanupFnsRef.current = [];
    };
  }, []); // 최초 1회 주입

  // visits 변경 시 색상만 업데이트 (리스너 재부착 없음)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const elements = Array.from(svg.querySelectorAll<SVGElement>("[id]")).filter((el) => {
      const tag = el.tagName.toLowerCase();
      return ["path", "polygon", "rect", "circle", "ellipse", "polyline"].includes(tag);
    });
    elements.forEach((el) => {
      const regionName = el.getAttribute("id") || "";
      const code = nameToCode[regionName];
      const count = code ? visits[code] ?? 0 : 0;
      (el as SVGElement).style.fill = getColorByCount(count);
    });
  }, [visits]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 지도 (인라인 주입 컨테이너) */}
      <div ref={containerRef} className="w-full h-auto border rounded-lg shadow overflow-hidden" aria-label="경상북도 시군구 지도" />

      {/* 지도 위 라벨 */}
      {hoverRegion && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 px-2 py-1 rounded-md text-xs font-medium text-gray-700 shadow transition-opacity">
          {hoverRegion} · {hoverCount}회 방문
        </div>
      )}

      {/* 선택 안내/상태 박스 */}
      <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow p-4 text-center">
        {hoverRegion ? (
          <>
            <p className="text-lg font-bold text-blue-600">{hoverRegion}</p>
            <p className="text-sm text-gray-600">방문 {hoverCount}회</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">지역을 클릭하면 관련 블로그가 아래에 표시됩니다</p>
        )}
      </div>

      {/* 색상 범례 */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#e5e7eb" }} /> 0회
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#bfdbfe" }} /> 1–2회
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#60a5fa" }} /> 3–4회
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: "#2563eb" }} /> 5회+
        </span>
      </div>
    </div>
  );
}
