// src/pages/aitravel/AiTravelDetailPretty.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock4, MapPin, Hotel, Utensils, Landmark, Share2, Bookmark, ChevronRight } from "lucide-react";
import clsx from "clsx";

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

type TripData = {
  courseId: number;
  tripTitle: string;
  themeTitle: string;
  createdAt: string;
  days: DayPlan[];
};

// 아이콘
const TypeIcon: Record<RouteItem["type"], React.ReactNode> = {
  spot: <Landmark className="h-4 w-4" />,
  meal: <Utensils className="h-4 w-4" />,
  accommodation: <Hotel className="h-4 w-4" />,
};

const minutesToLabel = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
};

const dayRangeLabel = (days: DayPlan[]) => {
  if (!days.length) return "";
  const start = days[0].date;
  const end = days[days.length - 1].date;
  return `${start} ~ ${end}`;
};

const AiTravelDetailPretty: React.FC<{ data?: TripData }> = ({ data }) => {
  const { state } = useLocation() as { state?: TripData };
  const trip = data ?? state;
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<number>(0);

  if (!trip) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-4 w-80 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActiveDay(idx);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 } // 중간쯤 들어오면 active로 인식
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const days: DayPlan[] = Array.isArray(trip.days) ? trip.days : [];
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totals = useMemo(() => {
    let stay = 0;
    for (const d of days) {
      const route = Array.isArray(d.route) ? d.route : [];
      for (const r of route) stay += r?.duration_minutes || 0;
    }
    return { totalStayMin: stay };
  }, [days]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("링크가 클립보드에 복사되었습니다.");
    } catch {
      // noop
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:py-8 bg-white">
      {/* 헤더 */}
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{trip.tripTitle}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-100 via-teal-50 to-emerald-50 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-sky-100">
              {trip.themeTitle}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock4 className="h-4 w-4 text-teal-600" />
              {dayRangeLabel(days)} · 총 체류 {minutesToLabel(totals.totalStayMin)}
            </span>
            <span className="text-xs text-slate-500">생성일 {trip.createdAt?.slice(0, 10)}</span>
          </div>
        </div>

        {/* 액션 */}
        <div className="mt-2 flex gap-2">
          <button onClick={() => navigate(-1)} className="rounded-xl bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 active:translate-y-[1px]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 active:translate-y-[1px]"
            onClick={() => copyToClipboard(window.location.href)}
          >
            <Share2 className="mr-1 inline h-4 w-4" />
            공유
          </button>
        </div>
      </header>
      {/* Day 탭 */}

      <nav className="sticky top-0 z-10 mt-5 -mx-4 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4">
          <ul className="flex gap-2 overflow-x-auto py-2">
            {days.map((d, i) => (
              <li key={d.day}>
                <button
                  className={clsx(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors",
                    i === activeDay ? "bg-teal-600 border-teal-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:bg-teal-50 hover:border-teal-200"
                  )}
                  onClick={() => {
                    setActiveDay(i);
                    sectionRefs.current[i]?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  Day {d.day} · {d.date}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 타임라인 */}
        <section className="space-y-10">
          {days.map((day, idx) => {
            const route = Array.isArray(day.route) ? day.route : [];
            return (
              <div key={day.day} ref={(el) => (sectionRefs.current[idx] = el)}>
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Day {day.day} · {day.date}
                </h2>

                <ol className="relative ml-4 border-l border-slate-200 pl-6">
                  {route.map((r, i) => (
                    <li key={r.order} className="group mb-6">
                      {/* 타임라인 점 */}
                      <span className="absolute -left-[9px] mt-2 h-4 w-4 rounded-full border-2 border-white bg-teal-600 ring-4 ring-teal-100" />

                      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div
                              className={clsx(
                                "grid h-9 w-9 place-items-center rounded-xl ring-1",
                                r.type === "meal"
                                  ? "bg-amber-50 text-amber-700 ring-amber-100"
                                  : r.type === "accommodation"
                                  ? "bg-indigo-50 text-indigo-700 ring-indigo-100"
                                  : "bg-sky-50 text-sky-700 ring-sky-100"
                              )}
                            >
                              {TypeIcon[r.type]}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-medium text-slate-900">{r.name}</h3>
                              <p className="truncate text-sm text-slate-500">
                                {r.category} · {r.address}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-sm font-medium text-slate-800">
                              {r.arrival_time} → {r.departure_time}
                            </div>
                            <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-200">
                              <Clock4 className="mr-1 h-3.5 w-3.5 text-teal-600" />
                              체류 {minutesToLabel(r.duration_minutes)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <a
                            href={`https://map.kakao.com/link/search/${encodeURIComponent(r.address || r.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <MapPin className="h-4 w-4 text-teal-600" />
                            지도
                          </a>
                          <Link
                            to={`/tour/${r.content_id}`}
                            state={{ fromAi: true, id: r.content_id, typeId: r.content_type_id }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            상세 보기 <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>

                      {i !== route.length - 1 && <div className="h-4" />}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </section>

        {/* 요약 패널 */}
        <aside className="sticky top-[72px] hidden self-start lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">여행 요약</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">기간</dt>
                <dd className="text-slate-800">{dayRangeLabel(days)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">총 체류</dt>
                <dd className="text-slate-800">{minutesToLabel(totals.totalStayMin)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">일정일수</dt>
                <dd className="text-slate-800">{days.length}일</dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-2">
              <button onClick={() => navigate("/mypage")} className="w-full rounded-xl bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 active:translate-y-[1px]">
                <Bookmark className="mr-1 inline h-4 w-4" />
                마이페이지에서 확인하기
              </button>
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="w-full rounded-xl border border-slate-200  px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 active:translate-y-[1px]"
              >
                <Share2 className="mr-1 inline h-4 w-4" />
                공유하기
              </button>
            </div>
          </div>
        </aside>
      </main>
      {/* 모바일 하단 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl gap-2">
          <button className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 active:translate-y-[1px]">공유</button>
          <button className="flex-1 rounded-xl bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 active:translate-y-[1px]">경로 저장</button>
        </div>
      </div>
    </div>
  );
};

export default AiTravelDetailPretty;
