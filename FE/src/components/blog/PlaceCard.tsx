// components/blog/PlaceCard.tsx
interface Place {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
}

const PlaceCard = ({ place }: { place: Place }) => (
  <div className="flex gap-3 border rounded-lg p-3 shadow-sm">
    <img src={place.image} alt={place.name} className="w-24 h-24 object-cover rounded-md" />
    <div className="flex-1">
      <h3 className="font-semibold">{place.name}</h3>
      <p className="text-sm text-gray-600">{place.description}</p>
      <p className="text-yellow-500 text-sm">⭐ {place.rating}</p>
    </div>
  </div>
);

export default PlaceCard;
