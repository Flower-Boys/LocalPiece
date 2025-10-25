// src/pages/aitravel/AiTravelDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AiTravelDetailPretty from "@/components/aiTravel/AiTravelDetailPretty";
import { getCourseDetail } from "@/api/cours";

// UI 컴포넌트가 기대하는 TripData 타입과 동일하게 맞춰주세요.
type RouteItem = {
  order: number;
  type: "spot" | "meal" | "accommodation";
  name: string;
  category: string;
  address: string;
  content_id: number;
  arrival_time: string;
  departure_time: string;
  duration_minutes: number;
  content_type_id?: number | null;
};
type DayPlan = { day: number; date: string; route: RouteItem[] };
export type TripData = {
  courseId: number;
  tripTitle: string;
  themeTitle: string;
  createdAt: string;
  days: DayPlan[];
};

// API 응답 → TripData로 변환(필요 시 필드명 스네이크→카멜 매핑)
const adapt = (raw: any): TripData => ({
  courseId: raw.courseId ?? raw.course_id ?? raw.id,
  tripTitle: raw.tripTitle ?? raw.trip_title,
  themeTitle: raw.themeTitle ?? raw.theme_title,
  createdAt: raw.createdAt ?? raw.created_at,
  days: raw.days,
});

const AiTravelDetailPage: React.FC = () => {
  const { state } = useLocation() as { state?: TripData };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  console.log("AiTravelDetailPage id:", id);

  const [data, setData] = useState<TripData | null>(state ?? null);
  console.log(data);
  const [loading, setLoading] = useState(!state);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // location.state로 데이터 왔으면 API 호출 안 함
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCourseDetail(id); // id: string OK
        console.log(res);
        const trip = adapt(res);
        if (!cancelled) setData(trip);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "코스 상세 조회에 실패했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, state]);

  if (loading) return <div className="p-4">로딩 중…</div>;
  if (error)
    return (
      <div className="p-4">
        <p className="text-red-600">{error}</p>
        <button className="mt-2 rounded border px-3 py-1 text-sm" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </div>
    );
  if (!data) return null;

  return <AiTravelDetailPretty data={data} />;
};

export default AiTravelDetailPage;
