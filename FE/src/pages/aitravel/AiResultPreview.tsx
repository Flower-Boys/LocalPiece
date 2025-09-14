import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RouteCard from "@/components/aiTravel/RouteCard";
import RouteCardSkeleton from "@/components/aiTravel/RouteCardSkeleton";
import { MOCK_ROUTES } from "@/data/mockRoutes";
import type { CategoryKey } from "@/types/aiTravel";
import { Map as MapIcon } from "lucide-react";

const AiResultPreview: React.FC = () => {
  const nav = useNavigate();
  const { state } = useLocation() as { state?: { selected?: CategoryKey[] } };
  const sel = state?.selected ?? [];

  const picks = useMemo(() => {
    if (!sel.length) return MOCK_ROUTES.slice(0, 3);
    const hit = MOCK_ROUTES.filter((r) => sel.some((k) => r.tags.includes(k)));
    return (hit.length ? hit : MOCK_ROUTES).slice(0, 3);
  }, [sel]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">AI 추천 루트 미리보기</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">선택: {sel.length ? sel.join(", ") : "(기본)"}</p>
        </div>
        <button
          onClick={() => nav("/ai/travel/builder")}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
        >
          다시 선택
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((item) => (
            <RouteCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">맘에 드는 루트를 선택하면 상세(지도 + 타임라인 + 교통수단)로 이동합니다.</p>
        <button
          onClick={() => alert("TODO: 상세 생성 페이지로 이동(지도/타임라인)")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:translate-y-[1px] hover:shadow-md dark:bg-white dark:text-black"
        >
          <MapIcon className="h-5 w-5" /> 임시 · 상세 보기 예시
        </button>
      </div>
    </main>
  );
};

export default AiResultPreview;
