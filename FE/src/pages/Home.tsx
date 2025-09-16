import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api";
import { fetchKeywordSearch, fetchAreaBasedTours } from "../api/tour";
import { TourItem, KeywordTourItem, AreaBasedTourItem } from "../types/tour";
import SearchBar from "../components/home/SearchBar";
import TourCard from "../components/tour/TourCard";
import Loader from "../common/Loader";
import { CATEGORY_MAP } from "../constants/category";
import AuthButtons from "../components/share/auth/AuthButtons";
import { useLocation, useNavigate, Location } from "react-router-dom";

type AreaSearch = { sigunguCode?: string; contentTypeId?: string } | null;

function Home() {
  const navigate = useNavigate();
  const location = useLocation() as Location & {
    state?: { sigunguCode?: string; contentTypeId?: string };
  };

  const [tourItems, setTourItems] = useState<(TourItem | KeywordTourItem | AreaBasedTourItem)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // 🔑 검색/필터 상태
  const [selectedType, setSelectedType] = useState<string | undefined>(location.state?.contentTypeId);
  const [keyword, setKeyword] = useState<string>("");
  const [areaSearch, setAreaSearch] = useState<AreaSearch>(location.state?.sigunguCode || location.state?.contentTypeId ? location.state! : null);

  const totalPages = 302;

  // ✅ SearchBar에서 받는 콜백: 여기서는 상태만 변경, 실제 fetch는 useEffect에서
  const handleSearch = (params: { sigunguCode: string; contentTypeId: string }) => {
    const next: AreaSearch = params.sigunguCode || params.contentTypeId ? { sigunguCode: params.sigunguCode || undefined, contentTypeId: params.contentTypeId || undefined } : null;

    setAreaSearch(next);
    // 키워드 검색과 구분 (검색창은 지역+카테고리만 담당)
    setKeyword("");
    setPage(1);
  };

  // ✅ TourDetail → Home 네비게이션으로 넘어온 state는 1회만 소비하고 즉시 정리
  useEffect(() => {
    if (location.state) {
      // 위에서 areaSearch 초기화 시 이미 반영됨. 이제 state 제거
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  // ✅ 데이터 로드: keyword > areaSearch > 기본조회
  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data: (TourItem | KeywordTourItem | AreaBasedTourItem)[] = [];

        if (keyword && keyword.trim() !== "") {
          // 🔍 키워드 검색
          data = await fetchKeywordSearch({
            keyword,
            contentTypeId: selectedType,
            arrange: "C",
            pageNo: page,
            numOfRows: 12,
          });
        } else if (areaSearch) {
          // 📍 지역 기반 검색 (검색창에서 들어온 조건)
          data = await fetchAreaBasedTours({
            sigunguCode: areaSearch.sigunguCode,
            contentTypeId: areaSearch.contentTypeId ?? selectedType, // 선택형 병행 가능
            pageNo: page,
            numOfRows: 12,
            arrange: "C",
          });
        } else {
          // 🗂️ 기본 전체 조회 (기존 로직 유지)
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
      } catch (err) {
        console.error("API 호출 중 오류 발생:", err);
        setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    fetchTourData();
  }, [page, selectedType, keyword, areaSearch]);

  // ✅ 페이지네이션 계산 (원본 유지)
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
          <div></div>
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
          <div className="flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </section>

      <div className="border-b border-gray-300"></div>

      {/* 카테고리 버튼 (누르면 지역검색 모드 해제) */}
      <section className="max-w-6xl mx-auto px-4 py-8 flex gap-4 overflow-x-auto">
        {CATEGORY_MAP.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedType(cat.id);
              setAreaSearch(null); // ✅ 지역검색 모드 해제 → 기본 조회로 전환
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full border ${selectedType === cat.id ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* 카드 그리드 */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tourItems.map((item) => {
          const image = (item.firstimage ?? "").trim() !== "" ? (item.firstimage as string) : "https://placekitten.com/400/300";
          return (
            <TourCard
              key={item.contentid}
              id={item.contentid}
              title={item.title}
              location={item.addr1 ?? ""} // 🔒 안전하게 기본값
              type={String(item.contenttypeid)}
              image={image}
              mapx={item.mapx ?? ""}
              mapy={item.mapy ?? ""}
            />
          );
        })}
      </section>

      {/* 페이지네이션 (원본 유지) */}
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
