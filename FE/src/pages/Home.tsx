import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api";
import { fetchKeywordSearch } from "../api/tour";
import { TourItem, KeywordTourItem } from "../types/tour";
import SearchBar from "../components/home/SearchBar";
import TourCard from "../components/tour/TourCard";
import Loader from "../common/Loader";
import { CATEGORY_MAP } from "../constants/category";
import AuthButtons from "../components/share/auth/AuthButtons";

function Home() {
  const [tourItems, setTourItems] = useState<(TourItem | KeywordTourItem)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>("");

  const totalPages = 302; // 👉 추후 API totalCount 기반으로 교체 권장

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data: (TourItem | KeywordTourItem)[] = [];

        if (keyword && keyword.trim() !== "") {
          // ✅ keyword 기반 검색 API
          data = await fetchKeywordSearch({
            keyword,
            contentTypeId: selectedType,
            arrange: "C",
            pageNo: page,
            numOfRows: 12,
          });
        } else {
          // ✅ 기존 전체 조회 API
          const res = await apiClient.get<TourItem[]>("/tour/area-based", {
            params: {
              lDongListYn: "Y",
              pageNo: page,
              numOfRows: 12,
              arrange: "Q",
              contentTypeId: selectedType,
            },
          });
          data = res.data;
        }

        setTourItems(data);
        console.log(`페이지 ${page} 관광 정보:`, data);
      } catch (err) {
        console.error("API 호출 중 오류 발생:", err);
        setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    fetchTourData();
  }, [page, selectedType, keyword]);

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    let start = page - Math.floor(maxVisible / 2);
    let end = page + Math.floor(maxVisible / 2);

    if (start < 1) {
      end += 1 - start;
      start = 1;
    }
    if (end > totalPages) {
      start -= end - totalPages;
      end = totalPages;
    }
    if (start < 1) start = 1;

    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  if (error) return <div>오류: {error}</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {isLoading && <Loader label="관광 데이터를 불러오는 중" />}

      <section className="from-pink-500 to-red-500 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          {/* 왼쪽 여백 */}
          <div></div>

          {/* 검색창 (중앙 고정, 더 넓게) */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <SearchBar />
            </div>
          </div>

          {/* 버튼 (오른쪽 끝) */}
          <div className="flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </section>

      <div className="border-b border-gray-300"></div>

      {/* 카테고리 버튼 */}
      <section className="max-w-6xl mx-auto px-4 py-8 flex gap-4 overflow-x-auto">
        {CATEGORY_MAP.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedType(cat.id);
              setPage(1); // ✅ 카테고리 변경 시 첫 페이지로 초기화
            }}
            className={`px-4 py-2 rounded-full border ${selectedType === cat.id ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* 카드 그리드 */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tourItems.map((item) => (
          <TourCard
            key={item.contentid}
            id={item.contentid}
            title={item.title}
            location={item.addr1}
            type={item.contenttypeid}
            image={item.firstimage && item.firstimage.trim() !== "" ? item.firstimage : "https://placekitten.com/400/300"}
            mapx={item.mapx}
            mapy={item.mapy}
          />
        ))}
      </section>

      {/* 페이지네이션 ✅ 복원 */}
      {totalPages > 1 && (
        <div className="max-w-6xl mx-auto px-4 pb-10 flex items-center justify-center gap-2 flex-wrap">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300">
            {"<<"}
          </button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300">
            {"<"}
          </button>
          {pageNumbers.map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${page === p ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300">
            {">"}
          </button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300">
            {">>"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
