import React from "react";

const RouteCardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div className="aspect-[16/10] w-full bg-gray-200/70 dark:bg-gray-700" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 rounded bg-gray-200/70 dark:bg-gray-700" />
      <div className="h-3 w-1/2 rounded bg-gray-200/70 dark:bg-gray-700" />
      <div className="h-3 w-full rounded bg-gray-200/70 dark:bg-gray-700" />
    </div>
  </div>
);

export default RouteCardSkeleton;
