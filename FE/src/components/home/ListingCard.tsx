import { useNavigate } from "react-router-dom";

interface ListingCardProps {
  id: string; // 🔹 contentid가 문자열이므로 string으로 변경
  title: string;
  location: string;
  image: string;
  price?: string; // 🔹 API에는 없으므로 선택적
}

const ListingCard = ({ id, title, location, price, image }: ListingCardProps) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/blog/${id}`)} className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://placekitten.com/400/300"; // 🔹 이미지 없을 때 대체
        }}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{location}</p>
        {/* price가 있으면 표시, 없으면 '정보 없음' */}
        <p className="text-sm text-gray-400">{price ?? "정보 없음"}</p>
      </div>
    </div>
  );
};

export default ListingCard;
