import { useEffect, useState } from "react";
import apiClient from "../api"; // 우리가 만든 API 클라이언트 import
import { SigunguCode, TourItem } from "../types/tour"; // 방금 만든 타입 import
import SearchBar from "../components/home/SearchBar";
import ListingCard from "../components/home/ListingCard";

function Home() {
  const listings = [
    {
      id: 1,
      title: "서울 강남 아파트",
      location: "강남구, 서울",
      price: "₩120,000 / 박",
      image: "https://placekitten.com/400/300",
    },
    {
      id: 2,
      title: "부산 해운대 오션뷰",
      location: "해운대구, 부산",
      price: "₩200,000 / 박",
      image: "https://placekitten.com/401/300",
    },
    {
      id: 3,
      title: "제주도 돌담집",
      location: "제주시, 제주",
      price: "₩150,000 / 박",
      image: "https://placekitten.com/402/300",
    },
  ];
  // 관광정보 목록을 저장할 상태
  const [tourItems, setTourItems] = useState<TourItem[]>([]);
  // 시군구 코드 목록을 저장할 상태
  const [sigunguCodes, setSigunguCodes] = useState<SigunguCode[]>([]);
  // 로딩 상태를 관리할 상태
  // const [isLoading, setIsLoading] = useState(true);
  // 에러 상태를 관리할 상태
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 처음 렌더링될 때 API를 호출합니다.
  // useEffect(() => {
  //   // 비동기 데이터를 가져오는 함수
  //   const fetchTourData = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);

  //       // 두 개의 API를 동시에 호출하여 효율성을 높입니다.
  //       const [sigunguResponse, tourResponse] = await Promise.all([apiClient.get<SigunguCode[]>("/tour/sigungu-codes"), apiClient.get<TourItem[]>("/tour/area-based")]);

  //       // 받아온 데이터를 상태에 저장합니다.
  //       setSigunguCodes(sigunguResponse.data);
  //       setTourItems(tourResponse.data);
  //       console.log("sigunguResponse.data:", sigunguResponse.data);
  //       console.log("tourResponse.data:", tourResponse.data);

  //       // 콘솔에 데이터가 잘 들어왔는지 확인합니다.
  //       console.log("시군구 코드 목록:", sigunguResponse.data);
  //       console.log("초기 관광 정보:", tourResponse.data);
  //     } catch (err) {
  //       console.error("API 호출 중 오류 발생:", err);
  //       setError("데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchTourData();
  // }, []); // []를 넣어 이 효과가 최초 1번만 실행되도록 합니다.

  // 로딩 중일 때 보여줄 화면
  // if (isLoading) {
  //   return <div>데이터를 불러오는 중입니다...</div>;
  // }

  // 에러가 발생했을 때 보여줄 화면
  if (error) {
    return <div>오류: {error}</div>;
  }

  // 데이터 로딩이 완료되었을 때 보여줄 화면
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
        {listings.map((item) => (
          <ListingCard key={item.id} {...item} />
        ))}
      </section>
    </div>
  );
}

export default Home;
