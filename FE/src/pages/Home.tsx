import { useEffect, useState } from "react";
import apiClient from "../api";
import { SigunguCode, TourItem } from "../types/tour";
import SearchBar from "../components/home/SearchBar";
import TourCard from "../components/tour/TourCard";
import Loader from "../common/Loader";

function Home() {
  // 관광정보 목록을 저장할 상태
  const [tourItems, setTourItems] = useState<TourItem[]>([]);
  // 시군구 코드 목록을 저장할 상태
  const [sigunguCodes, setSigunguCodes] = useState<SigunguCode[]>([]);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [sigunguResponse, tourResponse] = await Promise.all([apiClient.get<SigunguCode[]>("/tour/sigungu-codes"), apiClient.get<TourItem[]>("/tour/area-based")]);

        setSigunguCodes(sigunguResponse.data);
        setTourItems(tourResponse.data);

        console.log("시군구 코드 목록:", sigunguResponse.data);
        console.log("초기 관광 정보:", tourResponse.data);
      } catch (err) {
        console.error("API 호출 중 오류 발생:", err);
        setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTourData();
  }, []);

  if (error) return <div>오류: {error}</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Hero + 검색창 */}
      <section className="from-pink-500 to-red-500 text-white py-8 px-6 text-center">
        <SearchBar />
      </section>
      <div className="border-b border-gray-300"></div>

      {/* 카테고리 */}
      <section className="max-w-6xl mx-auto px-4 py-8 flex gap-4 overflow-x-auto">
        {["해변", "한옥", "캠핑", "도심", "펜션"].map((cat) => (
          <button key={cat} className="px-4 py-2 rounded-full border border-gray-300 bg-white hover:shadow whitespace-nowrap">
            {cat}
          </button>
        ))}
      </section>

      {/* 숙소 카드 그리드 */}

      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tourItems.map((item) => (
          <TourCard
            key={item.contentid}
            id={item.contentid}
            title={item.title}
            location={item.addr1}
            image={item.firstimage && item.firstimage.trim() !== "" ? item.firstimage : "https://placekitten.com/400/300"}
            mapx={item.mapx}
            mapy={item.mapy}
          />
        ))}

        {/* 로딩 오버레이 */}
        {isLoading && <Loader label="관광 데이터를 불러오는 중" />}
      </section>
    </div>
  );
}

export default Home;
