// src/pages/aitravel/MyAiTravelRoutes.tsx
import { useEffect, useMemo, useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Route as RouteIcon, ChevronRight, User2, Clock4 } from "lucide-react";
import { MyTripSummary } from "@/types/aiTravel";
import { getMyCourses } from "@/api/cours";

// 날짜 포맷
const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Seoul",
      })
    : null;

// 테마 칩 — 과하지 않은 중립 스타일
const Chip = ({ text }: { text?: string }) =>
  text ? (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/70 dark:bg-slate-800/50 px-2.5 py-1 text-[12px] text-slate-700 dark:text-slate-200">{text}</span>
  ) : null;

// 접근성: 키보드로 행 열기
const onRowKey = (e: KeyboardEvent<HTMLDivElement>, go: () => void) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    go();
  }
};

export default function MyAiTravelRoutes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<MyTripSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getMyCourses();
      setCourses(list ?? []);
    } catch (e) {
      console.error(e);
      setError("여행 루트를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 최신순
  const sorted = useMemo(() => {
    return [...courses].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [courses]);

  // --- (상단 import 그대로 유지)

  const getCourseBadge = (themeTitle: string) => {
    if (themeTitle.includes("베스트")) {
      return {
        icon: "👍",
        color: "bg-pink-500/80 ring-pink-500/15",
        label: "베스트 코스",
      };
    } else if (themeTitle.includes("추천")) {
      return {
        icon: "✨",
        color: "bg-amber-500/80 ring-amber-500/15",
        label: "추천 코스",
      };
    } else if (themeTitle.includes("숨은") || themeTitle.includes("나만")) {
      return {
        icon: "🤫",
        color: "bg-emerald-500/80 ring-emerald-500/15",
        label: "숨은 명소 코스",
      };
    } else {
      return {
        icon: "🗺️",
        color: "bg-indigo-500/80 ring-indigo-500/15",
        label: "일반 코스",
      };
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <RouteIcon className="text-indigo-600 dark:text-indigo-500" />
          내가 만든 여행 루트
        </h2>
        {!loading && !error && courses.length > 0 && (
          <span className="text-sm text-slate-500 ">
            총 <b className="text-slate-900">{courses.length}</b>개
          </span>
        )}
      </header>

      {/* 에러 */}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50  px-5 py-4 text-red-700 ">{error}</div>}

      {/* 로딩 스켈레톤 — 넉넉한 여백 */}
      {loading && !error && (
        <div className="rounded-2xl border border-slate-200/80  bg-white/90 ">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-5 first:rounded-t-2xl last:rounded-b-2xl border-b last:border-b-0 border-slate-100 ">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-9 w-24 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 비어있음 */}
      {!loading && !error && courses.length === 0 && (
        <div className="rounded-2xl border border-slate-200  bg-white  px-8 py-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 ">
            <RouteIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">아직 생성한 코스가 없어요</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">AI 여행 추천에서 첫 코스를 만들면 이곳에 차곡차곡 모아둘게요.</p>
          <a
            href="/ai/travel"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm"
          >
            코스 만들기
          </a>
        </div>
      )}

      {/* 리스트 */}
      {!loading && !error && courses.length > 0 && (
        <div className="rounded-2xl border border-slate-200  bg-white/90  shadow-sm">
          {sorted.map((c, idx) => {
            const created = fmtDate(c.createdAt);
            const themeTitle = c.themeTitle;
            const go = () =>
              navigate(`/ai/travel/detail/${c.courseId}`, {
                state: { id: String(c.courseId) },
              });

            const badge = getCourseBadge(c.themeTitle);

            return (
              <div
                key={c.courseId ?? idx}
                role="button"
                tabIndex={0}
                onClick={go}
                onKeyDown={(e) => onRowKey(e, go)}
                className="
                  px-6 py-5
                  rounded-t-2xl rounded-b-2xl
                  border-b border-slate-100
                  hover:bg-blue-100
                  focus:bg-slate-50/90 
                  outline-none transition-colors
                "
              >
                <div className="flex items-start gap-5">
                  {/* 좌측 포인트 배지 (심플 도트) */}
                  <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${badge.color} ring-2`} title={badge.label} />

                  {/* 본문 */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-[16px] leading-[1.35] font-semibold text-slate-900 ">{c.tripTitle}</h3>
                      <Chip text={c.themeTitle} />
                    </div>

                    <div className="text-[13px] leading-6 text-slate-600 flex flex-wrap items-center gap-x-5 gap-y-1">
                      <span className="inline-flex items-center gap-1.5">
                        <User2 className="w-4 h-4 text-slate-400" />
                        {c.authorNickname}
                      </span>
                      {created && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock4 className="w-4 h-4 text-slate-400" />
                          생성일 {created}
                        </span>
                      )}
                      {/* <span className="text-slate-400 ">・</span> */}
                      {/* <span className="text-slate-500 ">코스 ID {c.courseId}</span> */}
                    </div>
                  </div>

                  {/* 액션 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      go();
                    }}
                    className="
                      ml-auto inline-flex items-center gap-1.5
                      rounded-lg border border-slate-200 
                      bg-white/80 
                      px-3.5 py-2 text-sm 
                      hover:bg-blue-200
                      active:bg-slate-200/60 
                      transition shadow-xs
                      focus:outline-none focus:ring-2 focus:ring-indigo-400/30
                    "
                    aria-label="상세 보기"
                    title="상세 보기"
                  >
                    상세보기
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
