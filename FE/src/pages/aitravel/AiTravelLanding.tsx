import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon, Sparkles, Filter, Clock4, Mountain, Tent, UtensilsCrossed, Building2, Landmark, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

import TagChip from "@/components/aiTravel/TagChip";
import RouteCard from "@/components/aiTravel/RouteCard";
import RouteCardSkeleton from "@/components/aiTravel/RouteCardSkeleton";
import type { CategoryKey, SavedCourseSummary, RouteCardItem } from "@/types/aiTravel";
import { getPublicSavedCourses } from "@/api/cours";

// ✅ 이미지 임포트
import mountImg from "@/assets/mount.png";
import campingImg from "@/assets/camping.png";
import foodImg from "@/assets/food.png";
import cityImg from "@/assets/city.png";
import cultureImg from "@/assets/culture.png";

// ✅ "전체" + 3종 전용 필터만 노출
type CourseFilter = "전체" | "👍 인기만점! 베스트 코스" | "✨ 또 다른 매력! 추천 코스" | "🤫 나만 아는 숨은 명소 코스";

const COURSE_FILTERS: CourseFilter[] = ["전체", "👍 인기만점! 베스트 코스", "✨ 또 다른 매력! 추천 코스", "🤫 나만 아는 숨은 명소 코스"];

const AiTravelLanding: React.FC = () => {
  const navigate = useNavigate();

  // === 상태 ===
  const [activeFilter, setActiveFilter] = useState<CourseFilter>("전체");
  const [loading, setLoading] = useState(false);

  // ⚠️ UI 페이지(항상 18개 기준으로 보여주기)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(18);
  const [sort, setSort] = useState<string | string[]>("createdAt,desc");

  const [content, setContent] = useState<SavedCourseSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0); // 서버가 주는 totalPages (전체일 때만 사용)
  const [numberOfElements, setNumberOfElements] = useState(0); // 이번 서버 페이지 항목 수(전체일 때만 사용)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  // === API 호출 ===
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const requestPage = activeFilter === "전체" ? page : 0;
        const requestSize = activeFilter === "전체" ? size : 90;
        const data = await getPublicSavedCourses({ page: requestPage, size: requestSize, sort });

        if (!alive) return;

        setContent(data.content);
        setTotalPages(data.totalPages);
        setNumberOfElements(data.numberOfElements);

        // ✅ 썸네일 있는 항목 중 첫 번째를 대표로 설정
        const validThumbnail = data.content.find((item) => item.thumbnailUrl && item.thumbnailUrl.trim() !== "");
        setThumbnailUrl(validThumbnail?.thumbnailUrl ?? "");
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [page, size, sort, activeFilter]);

  // ✅ themeTitle과 정확히 일치하는지로만 필터
  const filtered = useMemo(() => {
    if (activeFilter === "전체") return content;
    return content.filter((c) => c.themeTitle === activeFilter);
  }, [content, activeFilter]);

  // ✅ 클라 페이지네이션(필터 ON일 때만 사용)
  const visible = useMemo(() => {
    if (activeFilter === "전체") return filtered; // 전체는 서버 페이지네이션 결과 그대로
    const start = page * size;
    const end = start + size;
    return filtered.slice(start, end);
  }, [filtered, activeFilter, page, size]);

  // ✅ 필터별 카운트 계산 (뱃지용)
  const filterCounts = useMemo(() => {
    const base = {
      전체: content.length,
      "👍 인기만점! 베스트 코스": 0,
      "✨ 또 다른 매력! 추천 코스": 0,
      "🤫 나만 아는 숨은 명소 코스": 0,
    } as Record<CourseFilter, number>;

    for (const item of content) {
      if (item.themeTitle in base) {
        base[item.themeTitle as Exclude<CourseFilter, "전체">] += 1;
      }
    }
    return base;
  }, [content]);

  // ✅ 페이지 수(표시용)
  const uiTotalPages = activeFilter === "전체" ? totalPages : Math.max(1, Math.ceil(filtered.length / size));

  // === 페이지네이션 핸들러 ===
  const canPrev = page > 0;
  const canNext = page + 1 < uiTotalPages;

  // ✅ 제목에서 'n박 m일', 'm일', 'n박' 등을 파싱해 day(일수) 추출
  const parseTripDays = (title: string): number => {
    if (!title) return 0;

    // 1) "7박 8일", "1박2일" 등 (공백/구두점 허용)
    const reNightsDays = /(\d+)\s*박[^\d]{0,3}(\d+)\s*일/;
    const nd = title.match(reNightsDays);
    if (nd) return Number(nd[2]);

    // 2) "m일 코스", "2일" 등
    const reDaysOnly = /(\d+)\s*일/;
    const d = title.match(reDaysOnly);
    if (d) return Number(d[1]);

    // 3) "n박"만 있는 경우 → 통상 n+1일로 간주
    const reNightsOnly = /(\d+)\s*박/;
    const n = title.match(reNightsOnly);
    if (n) return Number(n[1]) + 1;

    // 4) "당일치기/원데이" 처리
    if (/(당일|원데이)/.test(title)) return 1;

    return 0; // 못 찾으면 0
  };

  // === RouteCard에 맞게 최소 변환 (임시 매핑) ===

  const adaptToRouteCard = (x: SavedCourseSummary): RouteCardItem => {
    const cover = x.thumbnailUrl && x.thumbnailUrl.trim() !== "" ? x.thumbnailUrl : cityImg;
    const days = parseTripDays(x.tripTitle); // ⬅️ 여기!
    // console.log(days);
    return {
      id: String(x.courseId),
      title: x.tripTitle,
      city: x.authorNickname,
      days, // ⬅️ 파싱 결과 주입
      distanceKm: 0,
      tags: [],
      cover,
      stops: [x.themeTitle],
      rating: 0,
    };
  };

  // ✅ 이미지 매핑 (히어로)
  const categoryImages: { label: CategoryKey; icon: React.ElementType; desc: string; img: string; overlay: string }[] = [
    { label: "자연", icon: Mountain, desc: "등산/전망/계곡", img: mountImg, overlay: "from-emerald-600/70 to-teal-600/70" },
    { label: "휴식/힐링", icon: Tent, desc: "오토/글램핑/차박", img: campingImg, overlay: "from-orange-600/70 to-amber-600/70" },
    { label: "맛집", icon: UtensilsCrossed, desc: "시장/맛집/카페", img: foodImg, overlay: "from-yellow-600/70 to-amber-600/70" },
    { label: "액티비티/체험", icon: Building2, desc: "체험/전시/야경", img: cityImg, overlay: "from-indigo-600/70 to-purple-600/70" },
    { label: "역사/문화", icon: Landmark, desc: "역사/유적/전통", img: cultureImg, overlay: "from-red-600/70 to-orange-600/70" },
    { label: "쇼핑", icon: ShoppingBag, desc: "쇼핑/아울렛/거리", img: cityImg, overlay: "from-fuchsia-600/70 to-pink-600/70" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl border border-gray-100 
        bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 
        text-white shadow-lg dark:from-indigo-200 dark:via-purple-200 dark:to-pink-200 dark:text-gray-900"
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-10 md:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md">
              <Sparkles className="h-4 w-4" /> AI 자동 여행지 추천
            </span>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              몇 번의 선택만으로 <span className="underline decoration-amber-300 decoration-4 underline-offset-4">내 취향 루트</span> 완성
            </h1>
            <p className="text-base opacity-90 max-w-xl">자연·힐링·맛집·체험·문화·쇼핑… 원하는 테마를 선택하면 AI가 일정, 동선, 이동수단까지 고려한 맞춤 여행 루트를 제안해요.</p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/ai/travel/builder")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl 
                bg-amber-400 px-6 font-semibold text-gray-900 shadow-md 
                transition hover:bg-amber-300 hover:shadow-lg"
              >
                <Sparkles className="h-5 w-5" /> AI로 내 루트 만들기
              </button>
              <a
                href="#popular"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl 
                border border-white/40 px-6 font-medium text-white 
                backdrop-blur-sm transition hover:bg-white/20"
              >
                <Filter className="h-5 w-5" /> 인기 추천 보기
              </a>
            </div>
          </div>

          {/* ✅ 이미지 그리드 */}
          <div className="relative isolate">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-lg">
              <div className="grid grid-cols-3 gap-3">
                {categoryImages.map((c) => (
                  <div
                    key={c.label}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm ring-1 ring-white/20 transition
                    hover:shadow-md hover:ring-white/30"
                  >
                    <img src={c.img} alt={c.label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${c.overlay} opacity-60 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-70`} />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <c.icon className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                      <span className="rounded-md bg-black/45 px-2 py-0.5 text-xs font-medium text-white/95 backdrop-blur-sm">{c.label}</span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-white/85">
                <span className="inline-flex items-center gap-1">
                  <MapIcon className="h-4 w-4" /> 동선 최적화
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock4 className="h-4 w-4" /> 이동시간 고려
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 리스트 */}
      <section id="popular" className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">전체 여행 루트</h2>

          {/* 정렬/페이지 옵션 */}
          <div className="flex items-center gap-2 text-sm">
            <label className="hidden md:block text-gray-600">정렬</label>
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={Array.isArray(sort) ? sort[0] : sort}
              onChange={(e) => {
                setPage(0);
                setSort(e.target.value);
              }}
            >
              <option value="createdAt,desc">최신 저장순</option>
              <option value="createdAt,asc">오래된 저장순</option>
              <option value="tripTitle,asc">여행 제목 오름차순</option>
              <option value="tripTitle,desc">여행 제목 내림차순</option>
            </select>

            <label className="hidden md:block text-gray-600 ml-2">페이지당</label>
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={size}
              onChange={(e) => {
                setPage(0);
                setSize(Number(e.target.value));
              }}
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={18}>18</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>

        {/* 필터 바 */}
        <div className="-mx-1 mb-6 flex items-center gap-2 overflow-x-auto px-1 py-1">
          {COURSE_FILTERS.map((f) => (
            <TagChip
              key={f}
              label={`${f} `}
              active={activeFilter === f}
              onClick={() => {
                setActiveFilter(f);
                setPage(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>

        {/* 카드 그리드 */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: size }).map((_, i) => (
              <RouteCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(activeFilter === "전체" ? filtered : visible).map((item) => (
              <RouteCard key={item.courseId} item={adaptToRouteCard(item)} />
            ))}
          </div>
        )}

        {/* 페이지네이션 (표시/이동은 uiTotalPages 기준) */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> 이전
          </button>
          <span className="text-sm text-gray-600">
            {uiTotalPages === 0 ? 0 : page + 1} / {uiTotalPages}
          </span>
          <button disabled={!canNext} onClick={() => setPage((p) => p + 1)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">
            다음 <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 소계: 전체는 서버 값, 필터 ON은 클라 visible 길이 */}
        <p className="mt-2 text-center text-xs text-gray-500">이번 페이지 항목: {activeFilter === "전체" ? numberOfElements : visible.length}개</p>
      </section>
    </main>
  );
};

export default AiTravelLanding;
