import { useNavigate } from "react-router-dom";

interface ListingCardProps {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
}

const ListingCard = ({ id, title, location, price, image }: ListingCardProps) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/blog/${id}`)} className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{location}</p>
        <p className="text-sm text-gray-400">{price}</p>
      </div>
    </div>
  );
};

export default ListingCard;
