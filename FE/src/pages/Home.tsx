import { useEffect, useState } from "react";
import apiClient from "../api"; // 우리가 만든 API 클라이언트 import
import { SigunguCode, TourItem } from "../types/tour"; // 방금 만든 타입 import

function Home() {
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
    <div className="w-full min-h-screen bg-gray-100">
      <div className="max-w-2xl py-8 px-4">
        {/* 시군구 선택 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">경상북도 시/군/구 목록</h2>
          <select className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-400">
            <option value="">전체</option>
            {sigunguCodes.map((sigungu) => (
              <option key={sigungu.code} value={sigungu.code}>
                {sigungu.name}
              </option>
            ))}
          </select>
        </div>

        {/* 관광 정보 목록 */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">관광 정보 목록 (경상북도 전체)</h2>
          <ul className="space-y-6">
            {tourItems.map((item) => (
              <li key={item.id} className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 mb-3">{item.address}</p>
                {item.firstimage && (
                  <img
                    src={item.firstimage}
                    alt={item.title}
                    className="w-full rounded-md"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
