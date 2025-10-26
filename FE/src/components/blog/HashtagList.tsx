import { useMemo, useState } from "react";

export default function HashtagList({
  tags,
  initialCount = 6,
  className = "",
}: {
  tags: string[] | undefined | null;
  initialCount?: number; // 기본 노출 개수
  className?: string;    // 바깥 컨테이너에 추가 클래스
}) {
  // 태그 정제: null/undefined 제거, 공백 제거, 중복 제거, 앞의 # 제거
  const clean = useMemo(() => {
    const base = (tags ?? [])
      .map((t) => (t ?? "").trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t.slice(1) : t));
    return Array.from(new Set(base));
  }, [tags]);

  const [expanded, setExpanded] = useState(false);

  if (!clean.length) return null;

  const visible = expanded ? clean : clean.slice(0, initialCount);
  const hiddenCount = Math.max(0, clean.length - visible.length);

  return (
    <div className={`flex flex-wrap gap-2 mb-6 ${className}`}>
      {visible.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
        >
          #{tag}
        </span>
      ))}

      {/* 더보기 / 접기 버튼 */}
      {hiddenCount > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="px-3 py-1 text-sm rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800"
          aria-label={`${hiddenCount}개의 해시태그 더보기`}
        >
          +{hiddenCount} 더보기
        </button>
      )}

      {expanded && clean.length > initialCount && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="px-3 py-1 text-sm rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800"
          aria-label="해시태그 접기"
        >
          접기
        </button>
      )}
    </div>
  );
}
