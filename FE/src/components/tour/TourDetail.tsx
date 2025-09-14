import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// 컴포넌트 분리
import SearchBar from "../../components/home/SearchBar"; // ✅ 검색 바
import TourMap from "../../components/tour/TourMap"; // ✅ 구글 지도
import { getTourCommon, getTourIntro, getTourInfo, getTourImages } from "../../api/tour"; // ✅ API 함수들

// 타입 정의
import { TourCommonResponse, TourIntroResponse, TourInfoResponse, TourImageResponse } from "../../types/tour";

const TourDetail = () => {
  const { state } = useLocation() as {
    state: {
      id: string;
      title: string;
      location: string;
      type: string | number;
      image: string;
      mapx: string;
      mapy: string;
    };
  };

  const navigate = useNavigate();
  const [common, setCommon] = useState<TourCommonResponse | null>(null);
  const [intro, setIntro] = useState<TourIntroResponse | null>(null);
  const [info, setInfo] = useState<TourInfoResponse[]>([]);
  const [images, setImages] = useState<TourImageResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state) return;

    const fetchData = async () => {
      try {
        const [commonRes, introRes, infoRes, imageRes] = await Promise.all([
          getTourCommon(state.id),
          getTourIntro(state.id, String(state.type)),
          getTourInfo(state.id, String(state.type)),
          getTourImages(state.id),
        ]);

        setCommon(commonRes[0] || null);
        setIntro(introRes[0] || null);
        setInfo(infoRes || []);
        setImages(imageRes || []);
      } catch (err) {
        console.error("관광지 상세조회 에러:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state]);

  if (!state) return <div>잘못된 접근입니다.</div>;
  if (loading) return <div className="p-10 text-center">⏳ 불러오는 중...</div>;

  if (!state) return <div>잘못된 접근입니다.</div>;

  const { id, title, location, image, mapx, mapy } = state;
  console.log("TourDetail state:", state);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <section className="from-pink-500 to-red-500 text-white py-8 px-6 text-center">
        <SearchBar />
      </section>
      <div className="border-b border-gray-300"></div>

      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 왼쪽: 이미지 + 정보 */}
        <div>
          <img src={image || "https://placekitten.com/600/400"} alt={title} className="w-full h-80 object-cover rounded-lg mb-6" />

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <p className="text-gray-600 mb-4">{location}</p>
            <ul className="text-gray-700 space-y-2">
              <li>
                <strong>ID:</strong> {id}
              </li>
              <li>
                <strong>경도:</strong> {mapx}
              </li>
              <li>
                <strong>위도:</strong> {mapy}
              </li>
            </ul>
          </div>
        </div>

        {/* 오른쪽: 구글 지도 */}
        <TourMap
          lat={parseFloat(mapy)} // ✅ 위도 숫자 변환
          lng={parseFloat(mapx)} // ✅ 경도 숫자 변환
          title={title}
          location={location}
        />
      </div>

      {/* ✅ 뒤로가기 버튼 */}
      <button onClick={() => navigate(-1)} className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300">
        ← 뒤로가기
      </button>
    </div>
  );
};

export default TourDetail;
