import { useLocation } from "react-router-dom";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";
import SearchBar from "../../components/home/SearchBar";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const TourDetail = () => {
  const { state } = useLocation() as {
    state: {
      id: string;
      title: string;
      location: string;
      image: string;
      mapx: string; // 경도
      mapy: string; // 위도
    };
  };

  if (!state) return <div>잘못된 접근입니다.</div>;

  const { id, title, location, image, mapx, mapy } = state;
  const center = { lat: Number(mapy), lng: Number(mapx) };

  const [selected, setSelected] = useState(false);

  // ✅ title + location 기반 구글 지도 검색 URL
  const googleDetailUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${location}`)}`;

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
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
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
        <div>
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
              <Marker position={center} title={title} onClick={() => setSelected(true)} />
              {selected && (
                <InfoWindow position={center} onCloseClick={() => setSelected(false)}>
                  <div className="text-sm">
                    <h2 className="font-bold">{title}</h2>
                    <p>{location}</p>
                    <a href={googleDetailUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      구글 지도에서 검색 →
                    </a>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
