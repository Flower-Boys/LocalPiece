import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RouteCard from "@/components/aiTravel/RouteCard";
import RouteCardSkeleton from "@/components/aiTravel/RouteCardSkeleton";
import type { CategoryKey, TripResponse, Course, SaveResult } from "@/types/aiTravel";
import { Map as MapIcon } from "lucide-react";
import { getTourCommon } from "@/api/tour";
import Logo from "@/assets/Logo.png";

const AiResultPreview: React.FC = () => {
  const nav = useNavigate();
  const { state } = useLocation() as {
    state?: { selected?: CategoryKey[]; data?: TripResponse; saveResults?: SaveResult[] };
  };
  const saveResults = state?.saveResults ?? [];
  const sel = state?.selected ?? [];
  const trip = state?.data;

  // index -> courseId 매핑 (저장 성공한 것만)
  const savedIdMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of saveResults) {
      if (r.ok && r.data?.courseId != null) m.set(r.index, r.data.courseId);
    }
    return m;
  }, [saveResults]);

  const courseToItem = (course: Course, idx: number) => {
    const day0 = course.days?.[0];
    const stops = (day0?.route ?? []).map((r) => r.name);
    const categories = Array.from(new Set((day0?.route ?? []).map((r) => r.category)));

    // 주소에서 시/군/구 대충 뽑기 (없으면 '경상북도')
    const addr = day0?.route?.[0]?.address ?? "";
    const cityMatch = addr.match(/(경주시|포항시|안동시|구미시|김천시|영주시|영천시|상주시|문경시|경산시|의성군|청송군|영양군|영덕군|청도군|고령군|성주군|칠곡군|예천군|봉화군|울진군|울릉군)/);

    const trip = state?.data;

    return {
      id: `course_${idx}`,
      title: course.theme_title,
      city: cityMatch?.[1] ?? "경상북도",
      days: course.days?.length ?? 1,
      distanceKm: 0, // 아직 서버에서 안 주니 0으로 두고 카드에서 문구 처리
      tags: categories.slice(0, 3) as any, // UI 태그는 카테고리 상위 3개로
      cover: "/fallback-cover.jpg", // 기본 썸네일(원하면 프로젝트 에셋으로 교체)
      stops,
      rating: 4.7, // 임시 평점(필요 없으면 RouteCard에서 숨겨도 됨)
    } as const;
  };

  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  // 코스에서 첫 장소의 content_id 추출
  const firstContentIdOf = (course: Course): string | undefined => {
    const first = course?.days?.[0]?.route?.[0];
    if (!first?.content_id) return;
    return String(first.content_id);
  };
  const picks = useMemo(() => {
    if (!trip?.courses?.length) return [];
    return trip.courses.slice(0, 3).map(courseToItem);
  }, [trip]);
  useEffect(() => {
    if (!trip?.courses?.length) return;
    const courses = trip.courses.slice(0, 3);

    (async () => {
      const tasks = courses.map(async (course, idx) => {
        const id = `course_${idx}`;
        if (thumbs[id]) return; // 이미 있음
        const contentId = firstContentIdOf(course);
        if (!contentId) return;
        try {
          const res = await getTourCommon(contentId); // TourCommonResponse[]
          const url = res?.[0]?.firstimage || res?.[0]?.firstimage2 || "";
          if (url) {
            setThumbs((prev) => (prev[id] ? prev : { ...prev, [id]: url }));
          }
        } catch (e) {
          // 실패해도 무시(폴백 썸네일 사용)
          console.warn("thumbnail fetch failed:", contentId, e);
        }
      });
      await Promise.allSettled(tasks);
    })();
  }, [trip, picks.length]); // picks가 바뀌면 재시도

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
          {picks.map((item, idx) => {
            const withCover = { ...item, cover: thumbs[item.id] ?? Logo };
            const courseId = savedIdMap.get(idx); // 저장된 코스의 PK
            const to = courseId ? `/travel/route/${courseId}` : undefined;
            console.log(picks);
            return (
              <RouteCard
                key={item.id}
                item={withCover}
                to={to}
                state={{ course: trip!.courses[idx], courseId }} // 상세에서 필요하면 사용
              />
            );
          })}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">맘에 드는 루트를 선택하면 상세(지도 + 타임라인 + 교통수단)로 이동합니다.</p>
        {/* <button
          onClick={() => alert("TODO: 상세 생성 페이지로 이동(지도/타임라인)")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:translate-y-[1px] hover:shadow-md dark:bg-white dark:text-black"
        >
          <MapIcon className="h-5 w-5" /> 임시 · 상세 보기 예시
        </button> */}
      </div>
    </main>
  );
};

export default AiResultPreview;
