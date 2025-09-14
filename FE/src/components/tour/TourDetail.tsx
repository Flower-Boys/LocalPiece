import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "../../components/home/SearchBar";

const TourDetail = () => {
  const { state } = useLocation() as {
    state: {
      id: string;
      title: string;
      location: string;
      image: string;
      mapx: string;
      mapy: string;
    };
  };

  if (!state) return <div>잘못된 접근입니다.</div>;

  const { title, location, image, mapx, mapy } = state;
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      // 이미 로드됨
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JAVASCRIPT_KEY&autoload=false`;
    script.async = true;

    script.onload = () => {
      console.log("✅ Kakao SDK 로드 완료");
      window.kakao.maps.load(() => {
        initMap();
      });
    };

    script.onerror = () => {
      console.error("❌ Kakao SDK 로드 실패");
    };

    document.head.appendChild(script);

    function initMap() {
      if (!mapRef.current) return;
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(Number(mapy), Number(mapx)),
        level: 3,
      });

      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(Number(mapy), Number(mapx)),
      });
    }
  }, [mapx, mapy]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <section className="from-pink-500 to-red-500 text-white py-8 px-6 text-center">
        <SearchBar />
      </section>
      <div className="border-b border-gray-300"></div>

      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={image || "https://placekitten.com/600/400"} alt={title} className="w-full h-80 object-cover rounded-lg mb-6" />

          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-gray-600 mb-4">{location}</p>
            <ul className="text-gray-700 space-y-2">
              <li>
                <strong>ID:</strong> {state.id}
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

        <div>
          <div ref={mapRef} className="w-full h-96 rounded-lg shadow" />
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
