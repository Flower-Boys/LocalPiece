import React from "react";

type Props = { label: string; active?: boolean; onClick?: () => void };

const TagChip: React.FC<Props> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${active ? "border-transparent bg-red-400 text-white shadow-sm hover:bg-red-500 focus:ring-red-300" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-300"}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
};

export default TagChip;
