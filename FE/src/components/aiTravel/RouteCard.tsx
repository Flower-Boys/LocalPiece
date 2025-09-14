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
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < full ? "fill-yellow-400 text-yellow-400" : half && i === full ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600 dark:text-gray-300">{value.toFixed(1)}</span>
    </div>
  );
};

const RouteCard = ({ item }: { item: RouteCardItem }) => {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img src={item.cover} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          <StatBadge icon={MapPinned} label={`${item.city}`} />
          <StatBadge icon={Clock4} label={`${item.days}일`} />
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-gray-50">{item.title}</h3>
          <LikeStar value={item.rating} />
        </div>

        <div className="-ml-1 flex flex-wrap items-center gap-1.5">
          {item.tags.map((t) => (
            <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {item.stops.slice(0, 4).map((s, i) => (
            <span key={i} className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-200">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">총 {item.distanceKm}km · 대중교통/자차 가능</span>
          <Link to={`/travel/route/${item.id}`} className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-sm text-white transition hover:bg-black dark:bg-white dark:text-black">
            자세히 보기 <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RouteCard;
