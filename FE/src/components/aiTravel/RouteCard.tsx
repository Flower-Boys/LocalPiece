import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPinned, Clock4, ChevronRight, Star } from "lucide-react";
import { RouteCardItem } from "@/types/aiTravel";
import Logo from "@/assets/Logo.png";

// ===== 새로 추가: 저장 코스 타입 =====
type SavedCourse = {
  courseId: number;
  tripTitle: string;
  themeTitle: string;
  createdAt: string; // ISO
};

// ===== 내려오는 state 타입 명확화 =====
type RouteCardState = {
  courseId?: number;
  course?: any;
};

const StatBadge = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-xs text-white backdrop-blur-sm dark:bg-white/90 dark:text-black">
    <Icon className="h-3.5 w-3.5" />
    {label}
  </span>
);

const LikeStar = ({ value }: { value: number }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < full ? "fill-yellow-400 text-yellow-400" : half && i === full ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
      ))}
      <span className="ml-1 text-xs text-gray-600 dark:text-gray-300">{value.toFixed(1)}</span>
    </div>
  );
};

const RouteCard = ({
  item,
  to, // 사용 여부만 체크 (truthy 면 링크 노출)
  state,
}: {
  item: RouteCardItem;
  to?: string;
  state?: RouteCardState;
}) => {
  // 안전 가드: state가 없을 수 있음
  const [courseId, setCourseId] = useState<number | null>(state?.courseId ?? null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 최신 저장 코스 하나 가져오기
  useEffect(() => {
    if (courseId != null) return; // 이미 있으면 조회 불필요
    let ignore = false;

    async function loadSavedCourse() {
      try {
        setLoading(true);
        setFetchError(null);

        // 공용 apiClient가 있다면 그걸 쓰세요. 여기선 fetch 예시.
        const res = await fetch("/saved-courses", { method: "GET" });
        if (!res.ok) throw new Error(`GET /saved-courses 실패: ${res.status}`);
        const data: SavedCourse[] = await res.json();

        if (!ignore) {
          if (Array.isArray(data) && data.length > 0) {
            // createdAt 최신순으로 정렬해서 가장 최근 courseId 채택
            const latest = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            setCourseId(latest.courseId);
          } else {
            setCourseId(null); // 비어있으면 null 유지
          }
        }
      } catch (e: any) {
        if (!ignore) setFetchError(e?.message ?? "저장 코스 조회 실패");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSavedCourse();
    return () => {
      ignore = true;
    };
  }, [courseId]);

  // 버튼 비활성화 조건
  const disabled = useMemo(() => loading || fetchError != null || courseId == null, [loading, fetchError, courseId]);
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-gray-200 
    bg-gradient-to-br from-white to-gray-50 
    shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      {/* 썸네일 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img src={item.cover || Logo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          <StatBadge icon={MapPinned} label={item.city} />
          <StatBadge icon={Clock4} label={`${item.days}일`} />
        </div>
      </div>

      {/* 내용 */}
      <div className="flex flex-col gap-3 p-5 bg-white rounded-b-2xl">
        {/* 제목 + 별점 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-bold text-gray-900">{item.title}</h3>
          {/* <LikeStar value={item.rating} /> */}
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span key={t} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              #{t}
            </span>
          ))}
        </div>

        {/* 경유지 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {item.stops.slice(0, 4).map((s, i) => (
            <span key={i} className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
              {s}
            </span>
          ))}
          {item.stops.length > 4 && <span className="text-xs text-gray-500">+{item.stops.length - 4}</span>}
        </div>

        {/* 하단 */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">{item.distanceKm && item.distanceKm > 0 ? `총 ${item.distanceKm}km · 대중교통/자차 가능` : "상세에서 이동거리/교통 확인"}</span>

          {/* 링크/버튼 */}
          {to ? (
            courseId != null ? (
              <Link
                to={`/ai/travel/detail/${courseId}`}
                state={{ courseId, course: state?.course }}
                className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-amber-300"
              >
                자세히 보기 <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                disabled
                title={loading ? "저장 코스 조회 중…" : fetchError ?? "저장이 완료되지 않아 상세 이동이 비활성화되었습니다."}
                className="inline-flex cursor-not-allowed items-center gap-1 rounded-full bg-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
              >
                {loading ? "불러오는 중…" : "저장 대기중…"}
              </button>
            )
          ) : (
            <button
              disabled={disabled}
              title={loading ? "저장 코스 조회 중…" : fetchError ?? "저장이 완료되지 않아 상세 이동이 비활성화되었습니다."}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ${
                disabled ? "cursor-not-allowed bg-gray-300 text-gray-700" : "bg-amber-400 text-gray-900 hover:bg-amber-300"
              }`}
              onClick={(e) => e.preventDefault()}
            >
              {loading ? "불러오는 중…" : "저장 대기중…"}
            </button>
          )}
        </div>

        {/* 에러 메시지(옵션) */}
        {/* {fetchError && <p className="mt-1 text-xs text-red-500">{fetchError}</p>} */}
      </div>
    </article>
  );
};

export default RouteCard;
