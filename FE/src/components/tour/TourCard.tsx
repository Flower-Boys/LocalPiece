import { useNavigate } from "react-router-dom";

interface TourCardProps {
  id: string;
  title: string;
  location: string;
  type: string | number;
  image?: string | null;
  mapx: string;
  mapy: string;
}

const TourCard = ({ id, title, location, type, image, mapx, mapy }: TourCardProps) => {
  const navigate = useNavigate();

  const isEmptyImage = !image || image.trim() === "" || image === "https://placekitten.com/400/300";

  return (
    <div
      onClick={() =>
        navigate(`/tour/${id}`, {
          state: { id, title, location, image, mapx, mapy, type },
        })
      }
      className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white"
    >
      {/* ✅ 이미지 또는 대체 영역 */}
      {isEmptyImage ? (
        <div className="w-full h-48 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex flex-col items-center justify-center text-gray-700">
          <span className="text-xl font-semibold mb-1">🗺️ 이미지가 없습니다</span>
          {/* <span className="text-sm opacity-70">이 장소의 조각을 채워보세요 🧩</span> */}
        </div>
      ) : (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placekitten.com/400/300";
          }}
        />
      )}

      <div className="p-4">
        <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
      </div>
    </div>
  );
};

export default TourCard;
