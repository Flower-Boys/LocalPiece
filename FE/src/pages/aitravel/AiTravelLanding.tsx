import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon, Sparkles, Filter, Clock4 } from "lucide-react";
import TagChip from "@/components/aiTravel/TagChip";
import RouteCard from "@/components/aiTravel/RouteCard";
import RouteCardSkeleton from "@/components/aiTravel/RouteCardSkeleton";
import { ALL_TAGS, MOCK_ROUTES } from "@/data/mockRoutes";
import type { AllTag } from "@/types/aiTravel";

const AiTravelLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState<AllTag>("전체");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (activeTag === "전체") return MOCK_ROUTES;
    return MOCK_ROUTES.filter((r) => r.tags.includes(activeTag as any));
  }, [activeTag]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTag]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white shadow-lg dark:border-gray-800 dark:from-gray-100 dark:via-white dark:to-gray-200 dark:text-gray-900">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl dark:bg-black/10" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl dark:bg-black/10" />

        <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-8 md:grid-cols-2 md:p-12">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur-md dark:bg-black/10">
              <Sparkles className="h-4 w-4" /> AI 자동 여행지 추천
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              몇 번의 선택만으로 <span className="underline decoration-amber-400 decoration-4 underline-offset-4">내 취향 루트</span> 완성
            </h1>
            <p className="text-base opacity-90">산·바다·캠핑·힐링·먹거리… 원하는 분위기를 고르면 AI가 일정, 동선, 이동수단까지 고려한 루트를 제안해요.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/ai/travel/builder")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 transition hover:translate-y-[1px] hover:shadow-md dark:bg-gray-900 dark:text-white dark:ring-white/10"
              >
                <Sparkles className="h-5 w-5" /> AI로 내 루트 만들기
              </button>
              <a
                href="#popular"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                <Filter className="h-5 w-5" /> 인기 추천 먼저 보기
              </a>
            </div>
          </div>

          <div className="relative isolate">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md dark:border-black/10 dark:bg-black/5">
              <div className="grid grid-cols-3 gap-2">
                {["산", "바다", "캠핑", "힐링", "먹거리", "도심"].map((k) => (
                  <div key={k} className="aspect-[4/3] rounded-xl bg-white/20 text-center text-sm font-medium leading-[3.8rem] text-white dark:bg-black/10 dark:text-gray-800">
                    {k}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/80 dark:text-gray-700">
                <span className="inline-flex items-center gap-1">
                  <MapIcon className="h-3.5 w-3.5" /> 동선 최적화
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock4 className="h-3.5 w-3.5" /> 이동시간 고려
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 리스트 */}
      <section id="popular" className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">AI가 미리 만든 인기 추천 루트</h2>
          <div className="hidden items-center gap-2 text-sm text-gray-500 md:flex">
            <MapIcon className="h-4 w-4" /> 추천은 사용자 선호, 이동 편의, 소요시간 가중치로 산정
          </div>
        </div>

        <div className="-mx-1 mb-6 flex items-center gap-2 overflow-x-auto px-1 py-1">
          {ALL_TAGS.map((t) => (
            <TagChip key={t} label={t} active={activeTag === t} onClick={() => setActiveTag(t)} />
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RouteCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <RouteCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default AiTravelLanding;
