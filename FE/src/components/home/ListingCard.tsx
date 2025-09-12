interface ListingCardProps {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
}

const ListingCard = ({ title, location, price, image }: ListingCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{location}</p>
        <p className="mt-2 font-bold">{price}</p>
      </div>
    </div>
  );
};

export default ListingCard;
