import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api";
import { fetchKeywordSearch, fetchAreaBasedTours } from "../api/tour";
import { TourItem, KeywordTourItem, AreaBasedTourItem } from "../types/tour";
import SearchBar from "../components/home/SearchBar";
import TourCard from "../components/tour/TourCard";
import Loader from "../common/Loader";
import { CATEGORY_MAP } from "../constants/category";
import AuthButtons from "../components/share/auth/AuthButtons";
import { useNavigate, useSearchParams } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ URL 쿼리스트링에서 검색 조건 읽기
  const sigunguCode = searchParams.get("sigunguCode") || undefined;
  const contentTypeId = searchParams.get("contentTypeId") || undefined;
  const keyword = searchParams.get("keyword") || "";
  const page = Number(searchParams.get("page")) || 1;

  // ✅ 데이터 상태
  const [tourItems, setTourItems] = useState<(TourItem | KeywordTourItem | AreaBasedTourItem)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = 302;

  // Home 컴포넌트 내부 상단 어딘가에
  const buildSearch = (patch: Record<string, string | undefined | null>) => {
    const next = new URLSearchParams(searchParams); // 현재 쿼리 유지
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    return next.toString();
  };

  // ✅ 검색 실행 → URL 업데이트
  const handleSearch = (params: { sigunguCode?: string; contentTypeId?: string; keyword?: string }) => {
    // 검색 시작 시 page=1로 리셋, 전달 안 된 값은 제거
    navigate({
      pathname: "/",
      search: buildSearch({
        sigunguCode: params.sigunguCode || undefined,
        contentTypeId: params.contentTypeId || undefined,
        keyword: params.keyword || undefined,
        arrange: "R",
        page: "1",
      }),
    });
  };

  // ✅ 데이터 로드 (쿼리스트링 기반)
  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data: (TourItem | KeywordTourItem | AreaBasedTourItem)[] = [];

        if (keyword.trim() !== "") {
          // 🔍 키워드 검색
          data = await fetchKeywordSearch({
            keyword,
            contentTypeId,
            arrange: "R",
            pageNo: page,
            numOfRows: 12,
          });
        } else if (sigunguCode || contentTypeId) {
          // 📍 지역 기반 검색
          data = await fetchAreaBasedTours({
            sigunguCode,
            contentTypeId,
            pageNo: page,
            numOfRows: 12,
            arrange: "R",
          });
        } else {
          // 🗂️ 기본 전체 조회
          const res = await apiClient.get<TourItem[]>("/tour/area-based", {
            params: {
              lDongListYn: "Y",
              pageNo: page,
              numOfRows: 12,
              arrange: "Q",
              contentTypeId,
            },
          });
          data = res.data;
        }

        setTourItems(data);
      } catch (err) {
        console.error("API 호출 오류:", err);
        setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    fetchTourData();
  }, [searchParams]); // 👈 URL이 바뀔 때마다 실행됨

  // ✅ 페이지네이션 계산
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

      {/* 검색창 + 로그인 버튼 */}
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

      <section className="max-w-6xl mx-auto px-4 py-8 flex gap-4 overflow-x-auto">
        {CATEGORY_MAP.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              // 빈 문자열이면 해당 파라미터 제거되도록 undefined/null 처리
              navigate({
                pathname: "/",
                search: buildSearch({
                  contentTypeId: cat.id || undefined,
                  page: "1",
                }),
              });
            }}
            className={`px-4 py-2 rounded-full border ${contentTypeId === cat.id || (!contentTypeId && cat.id === "") ? "bg-blue-500 text-white" : "bg-white"}`}
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
              location={item.addr1 ?? ""}
              type={String(item.contenttypeid)}
              image={image}
              mapx={item.mapx ?? ""}
              mapy={item.mapy ?? ""}
            />
          );
        })}
      </section>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="max-w-6xl mx-auto px-4 pb-10 flex items-center justify-center gap-2 flex-wrap">
          <button onClick={() => navigate({ pathname: "/", search: buildSearch({ page: "1" }) })} disabled={page === 1} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300">
            {"<<"}
          </button>

          <button
            onClick={() => navigate({ pathname: "/", search: buildSearch({ page: String(page - 1) }) })}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
          >
            {"<"}
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => navigate({ pathname: "/", search: buildSearch({ page: String(p) }) })}
              className={`px-3 py-1 rounded ${page === p ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => navigate({ pathname: "/", search: buildSearch({ page: String(page + 1) }) })}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
          >
            {">"}
          </button>

          <button
            onClick={() => navigate({ pathname: "/", search: buildSearch({ page: String(totalPages) }) })}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
          >
            {">>"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
