// components/tour/TourMap.tsx
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";
import { useMemo, useState } from "react";

interface TourMapProps {
  lat: number; // 위도 (mapy)
  lng: number; // 경도 (mapx)
  title: string;
  location: string;
}

const containerStyle = { width: "100%", height: "400px" };

const TourMap = ({ lat, lng, title, location }: TourMapProps) => {
  // 1) SDK 로드 확실히 보장
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });

  // 2) 좌표/center 메모이제이션
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  // 3) 간단한 가드 (숫자 아닐 때)
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return <div className="text-red-500">잘못된 좌표입니다.</div>;
  }

  const [open, setOpen] = useState(false);
  const googleDetailUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${location}`)}`;

  if (!isLoaded) return <div>지도 불러오는 중...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14} clickableIcons={false} options={{ streetViewControl: false, mapTypeControl: false }}>
      {/* 4) MarkerF 사용 */}
      <MarkerF position={center} onClick={() => setOpen(true)} />
      {open && (
        <InfoWindowF position={center} onCloseClick={() => setOpen(false)}>
          <div className="text-sm">
            <h2 className="font-bold">{title}</h2>
            <p>{location}</p>
            <a href={googleDetailUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              구글 지도에서 검색 →
            </a>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default TourMap;
