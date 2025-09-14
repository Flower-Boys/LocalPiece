import React from "react";

type Props = { label: string; active?: boolean; onClick?: () => void };

const TagChip: React.FC<Props> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        active
          ? "border-transparent bg-black text-white dark:bg-white dark:text-black focus:ring-black"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:dark:bg-gray-700"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
};

export default TagChip;
