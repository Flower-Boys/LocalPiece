import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectableCard, { CATEGORY_META } from "@/components/aiTravel/SelectableCard";
import type { CategoryKey } from "@/types/aiTravel";
import { Sparkles } from "lucide-react";

const CategorySelect: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CategoryKey[]>([]);

  const toggle = (k: CategoryKey) => {
    setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">어떤 분위기의 여행을 원하세요?</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">최소 1개 이상 선택해 주세요. (복수 선택 가능)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(CATEGORY_META) as CategoryKey[]).map((k) => (
          <SelectableCard key={k} k={k} selected={selected.includes(k)} onToggle={toggle} />
        ))}
      </div>

      <div className="sticky bottom-6 mt-8 flex items-center justify-end">
        <button
          disabled={selected.length === 0}
          onClick={() => navigate("/ai/travel/result", { state: { selected } })}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 font-semibold text-white shadow-sm ring-1 ring-black/5 transition enabled:hover:translate-y-[1px] enabled:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          <Sparkles className="h-5 w-5" /> {selected.length === 0 ? "선택 후 계속" : `${selected.length}개 선택 · 루트 생성`}
        </button>
      </div>
    </main>
  );
};

export default CategorySelect;
