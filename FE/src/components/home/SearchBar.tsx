import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="bg-white rounded-full shadow-lg max-w-4xl h-20 mx-auto flex items-center overflow-hidden px-4 border border-gray-300">
      {/* 위치 입력 */}
      <input type="text" placeholder="여행지 검색" className="flex-1 px-6 py-3 text-lg text-gray-900 focus:outline-none" />

      {/* 검색 버튼 */}
      <button className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center ml-2">
        <Search size={20} />
      </button>
    </div>
  );
};

export default SearchBar;
