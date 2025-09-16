// ContentTypeSelect.tsx
import { useState } from "react";
import { Compass } from "lucide-react";
import { contentTypeLabel } from "./constants";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

const ContentTypeSelect = ({ value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* 라벨 + 값 */}
      <div onClick={() => setIsOpen(!isOpen)}>
        <p className="text-xs text-gray-500">카테고리</p>
        <p className="text-sm text-gray-800 flex items-center">
          <Compass size={16} className="text-gray-500 mr-2" />
          {value ? contentTypeLabel[value] : "카테고리 선택"}
        </p>
      </div>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute mt-2 w-56 bg-white shadow-lg rounded-xl border text-gray-700 border-gray-200 max-h-64 overflow-y-auto z-10">
          {/* ✅ 선택안함 옵션 */}
          <div
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm"
          >
            <Compass size={14} className="text-gray-400" />
            선택안함
          </div>

          {Object.entries(contentTypeLabel).map(([key, label]) => (
            <div
              key={key}
              onClick={() => {
                onChange(key);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm"
            >
              <Compass size={14} className="text-rose-400" />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentTypeSelect;
