import React from "react";
import { Link } from "react-router-dom";
import { MapPinned, Clock4, ChevronRight, Star } from "lucide-react";
import { RouteCardItem } from "@/types/aiTravel";

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

const RouteCard = ({ item }: { item: RouteCardItem }) => {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-gray-200 
  bg-gradient-to-br from-white to-gray-50 
  shadow-sm transition hover:-translate-y-1 hover:shadow-lg
  dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900"
    >
      {/* 썸네일 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img src={item.cover} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          <StatBadge icon={MapPinned} label={item.city} />
          <StatBadge icon={Clock4} label={`${item.days}일`} />
        </div>
      </div>

      {/* 내용 */}
      <div className="flex flex-col gap-3 p-5">
        {/* 제목 + 별점 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-gray-50">{item.title}</h3>
          <LikeStar value={item.rating} />
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span key={t} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-800/30 dark:text-amber-300">
              #{t}
            </span>
          ))}
        </div>

        {/* 경유지 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {item.stops.slice(0, 4).map((s, i) => (
            <span
              key={i}
              className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 
          dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              {s}
            </span>
          ))}
          {item.stops.length > 4 && <span className="text-xs text-gray-500">+{item.stops.length - 4}</span>}
        </div>

        {/* 하단 */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">총 {item.distanceKm}km · 대중교통/자차 가능</span>
          <Link
            to={`/travel/route/${item.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-medium text-gray-900 
        shadow-sm transition hover:bg-amber-300"
          >
            자세히 보기 <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RouteCard;
