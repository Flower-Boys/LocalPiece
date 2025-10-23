import { ProgressGaugeProps } from "@/types/pieces";
export default function ProgressGauge({ collectedCities, totalCities }: ProgressGaugeProps) {
  const pct = totalCities > 0 ? Math.min(100, Math.round((collectedCities / totalCities) * 100)) : 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">진척도</p>
        <p className="text-xs text-gray-500">
          {collectedCities} / {totalCities} 도시
        </p>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #60a5fa, #2563eb)" }}
          aria-label={`진척도 ${pct}%`}
        />
      </div>

      <p className="mt-2 text-xs text-gray-600">{pct}% 완료</p>
    </div>
  );
}
