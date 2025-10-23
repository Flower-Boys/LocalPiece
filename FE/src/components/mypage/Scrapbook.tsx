import { useMemo, useState } from "react";
import { TravelPieceSummary } from "@/types/pieces";
import defaultThumbnail from "@/assets/default-thumbnail.png";
import { sigunguCodeLabel } from "@/components/home/constants";
import { useNavigate } from "react-router-dom";
import JigsawPiece from "./JigsawPiece";

type Props = {
  pieces: TravelPieceSummary[];
};

const canonical = (name: string) => name.replace(/(시|군|구)$/, "");

export default function Scrapbook({ pieces }: Props) {
  const navigate = useNavigate();

  // 필터/정렬 상태
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "city" | "title">("recent");
  const [q, setQ] = useState("");

  // 도시 목록 (수집된 도시만)
  const collectedCities = useMemo(() => {
    const set = new Set(pieces.map((p) => canonical(p.city)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [pieces]);

  // 필터 + 검색 + 정렬 적용
  const filtered = useMemo(() => {
    let list = pieces.slice();

    if (cityFilter !== "ALL") {
      list = list.filter((p) => canonical(p.city) === cityFilter);
    }

    if (q.trim()) {
      const key = q.trim().toLowerCase();
      list = list.filter((p) => (p.title ?? "").toLowerCase().includes(key) || canonical(p.city).toLowerCase().includes(key));
    }

    switch (sortBy) {
      case "recent":
        list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
        break;
      case "city":
        list.sort((a, b) => canonical(a.city).localeCompare(canonical(b.city), "ko"));
        break;
      case "title":
        list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "ko"));
        break;
    }
    return list;
  }, [pieces, cityFilter, q, sortBy]);

  // 도시별 그룹 (미니 앨범 헤더용)
  const grouped = useMemo(() => {
    const map = new Map<string, TravelPieceSummary[]>();
    filtered.forEach((p) => {
      const k = canonical(p.city);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "ko"));
  }, [filtered]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-bold">조각 북</h2>
        <div className="flex flex-wrap gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목/도시 검색" className="px-3 py-2 rounded-lg border w-48" />
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="px-3 py-2 rounded-lg border">
            <option value="ALL">전체 도시</option>
            {collectedCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded-lg border">
            <option value="recent">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="city">도시명순</option>
            <option value="title">제목순</option>
          </select>
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="text-gray-500">아직 저장된 조각이 없어요.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([city, items]) => (
            <div key={city}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">
                  {city} <span className="text-gray-400 text-sm">({items.length}개)</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {items.map((p) => (
                    <JigsawPiece
                      key={p.pieceId}
                      imageUrl={p.thumbnail && p.thumbnail.trim() !== "" ? p.thumbnail : defaultThumbnail}
                      label={p.title ?? "(제목 없음)"}
                      subtitle={`${city} · ${new Date(p.createdAt ?? Date.now()).toLocaleDateString("ko-KR")}`}
                      size={160} // 140~180 사이 추천
                      onClick={() => navigate(`/blog/${p.blogId}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
