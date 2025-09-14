import { useNavigate } from "react-router-dom";

interface TourCardProps {
  id: string;
  title: string;
  location: string;
  type: string | number;
  image: string;
  mapx: string;
  mapy: string;
}

const TourCard = ({ id, title, location, type, image, mapx, mapy }: TourCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/tour/${id}`, {
          state: { id, title, location, image, mapx, mapy, type },
        })
      }
      className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://placekitten.com/400/300";
        }}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{location}</p>
      </div>
    </div>
  );
};

export default TourCard;
