import { useState } from "react";
import { Search } from "lucide-react";
import RegionSelect from "./RegionSelect";
import ContentTypeSelect from "./ContentTypeSelect";


type Props = {
  onSearch: (params: { sigunguCode: string; contentTypeId: string }) => void;
};

const SearchBar = ({ onSearch }: Props) => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const handleSearch = () => {
    onSearch({
      sigunguCode: selectedRegion,
      contentTypeId: selectedType,
    });
  };

  return (
    <div className="bg-white rounded-full shadow-md max-w-4xl h-16 mx-auto flex items-center border border-gray-300">
      {/* 여행지 */}
      <div className="flex-1 px-6 py-2 cursor-pointer hover:bg-gray-100 rounded-full transition">
        <RegionSelect value={selectedRegion} onChange={setSelectedRegion} />
      </div>

      <div className="w-px h-8 bg-gray-300" />

      {/* 카테고리 */}
      <div className="flex-1 px-6 py-2 cursor-pointer hover:bg-gray-100 rounded-full transition">
        <ContentTypeSelect value={selectedType} onChange={setSelectedType} />
      </div>

      {/* 검색 버튼 */}
      <button
        onClick={handleSearch}
        className="bg-rose-500 hover:bg-rose-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-4"
      >
        <Search size={20} />
      </button>
    </div>
  );
};

export default SearchBar;
