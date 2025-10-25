import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon, Sparkles, Filter, Clock4, Mountain, Tent, UtensilsCrossed, Building2, Landmark, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

import TagChip from "@/components/aiTravel/TagChip";
import RouteCard from "@/components/aiTravel/RouteCard";
import RouteCardSkeleton from "@/components/aiTravel/RouteCardSkeleton";
import type { AllTag, CategoryKey, SavedCourseSummary, RouteCardItem } from "@/types/aiTravel";
import { getPublicSavedCourses } from "@/api/cours";

// ✅ 이미지 임포트
import mountImg from "@/assets/mount.png";
import campingImg from "@/assets/camping.png";
import foodImg from "@/assets/food.png";
import cityImg from "@/assets/city.png";
import cultureImg from "@/assets/culture.png";

// 필요 시: 태그 리스트 (기존 ALL_TAGS 대체/병행)
const ALL_TAGS: AllTag[] = ["전체", "자연", "휴식/힐링", "맛집", "액티비티/체험", "역사/문화", "쇼핑"];

const AiTravelLanding: React.FC = () => {
  const navigate = useNavigate();

  // === 상태 ===
  const [activeTag, setActiveTag] = useState<AllTag>("전체"); // 서버 필터는 아직 없음(클라 표기용)
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(9);
  const [sort, setSort] = useState<string | string[]>("createdAt,desc");

  const [content, setContent] = useState<SavedCourseSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);

  // === API 호출 ===
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getPublicSavedCourses({ page, size, sort });
        if (!alive) return;
        setContent(data.content);
        setTotalPages(data.totalPages);
        setNumberOfElements(data.numberOfElements);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, size, sort]);

  // === 서버가 아직 태그 필터를 받지 않으므로, 표시만 유지 ===
  const filtered = useMemo(() => {
    // activeTag === "전체" 외에는 현재 서버 필터 없음 → 그대로 노출
    return content;
  }, [content, activeTag]);

  // === RouteCard에 맞게 최소 변환 (임시 매핑) ===
  const adaptToRouteCard = (x: SavedCourseSummary): RouteCardItem => ({
    id: String(x.courseId),
    title: x.tripTitle,
    city: x.authorNickname, // 작성자명 위치에 우선 매핑
    days: 0, // 서버 필드 없음 → 0
    distanceKm: 0, // 서버 필드 없음 → 0
    tags: [], // 서버 필드 없음 → 빈 배열
    cover: cityImg, // 임시 썸네일 (원하면 서버 확장 시 교체)
    stops: [x.themeTitle], // 테마를 간단 표시
    rating: 0, // 서버 필드 없음 → 0
  });

  // ✅ 이미지 매핑 (히어로)
  const categoryImages: { label: CategoryKey; icon: React.ElementType; desc: string; img: string; overlay: string }[] = [
    { label: "자연", icon: Mountain, desc: "등산/전망/계곡", img: mountImg, overlay: "from-emerald-600/70 to-teal-600/70" },
    { label: "휴식/힐링", icon: Tent, desc: "오토/글램핑/차박", img: campingImg, overlay: "from-orange-600/70 to-amber-600/70" },
    { label: "맛집", icon: UtensilsCrossed, desc: "시장/맛집/카페", img: foodImg, overlay: "from-yellow-600/70 to-amber-600/70" },
    { label: "액티비티/체험", icon: Building2, desc: "체험/전시/야경", img: cityImg, overlay: "from-indigo-600/70 to-purple-600/70" },
    { label: "역사/문화", icon: Landmark, desc: "역사/유적/전통", img: cultureImg, overlay: "from-red-600/70 to-orange-600/70" },
    { label: "쇼핑", icon: ShoppingBag, desc: "쇼핑/아울렛/거리", img: cityImg, overlay: "from-fuchsia-600/70 to-pink-600/70" },
  ];

  // === 페이지네이션 핸들러 ===
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

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

        {/* 태그 바(표시용) */}
        <div className="-mx-1 mb-6 flex items-center gap-2 overflow-x-auto px-1 py-1">
          {ALL_TAGS.map((t) => (
            <TagChip key={t} label={t} active={activeTag === t} onClick={() => setActiveTag(t)} />
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
            {filtered.map((item) => (
              <RouteCard key={item.courseId} item={adaptToRouteCard(item)} />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> 이전
          </button>
          <span className="text-sm text-gray-600">
            {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </span>
          <button disabled={!canNext} onClick={() => setPage((p) => p + 1)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">
            다음 <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 소계 */}
        <p className="mt-2 text-center text-xs text-gray-500">이번 페이지 항목: {numberOfElements}개</p>
      </section>
    </main>
  );
};

export default AiTravelLanding;
