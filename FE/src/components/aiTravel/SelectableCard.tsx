import React from "react";
import { Mountain, Waves, Tent, Heart, UtensilsCrossed, Building2, Landmark } from "lucide-react";
import type { CategoryKey } from "@/types/aiTravel";

export const CATEGORY_META: Record<CategoryKey, { icon: React.ElementType; desc: string; grad: string }> = {
  산: { icon: Mountain, desc: "등산/전망/계곡", grad: "from-emerald-500 to-teal-500" },
  바다: { icon: Waves, desc: "해변/드라이브/일몰", grad: "from-sky-500 to-blue-600" },
  캠핑: { icon: Tent, desc: "오토/글램핑/차박", grad: "from-orange-500 to-amber-600" },
  힐링: { icon: Heart, desc: "온천/스파/산책", grad: "from-pink-500 to-rose-500" },
  먹거리: { icon: UtensilsCrossed, desc: "시장/맛집/카페", grad: "from-yellow-500 to-amber-500" },
  도심: { icon: Building2, desc: "전시/쇼핑/야경", grad: "from-indigo-500 to-purple-600" },
  문화: { icon: Landmark, desc: "역사/유적/전통", grad: "from-red-500 to-orange-600" },
};

type Props = {
  k: CategoryKey;
  selected: boolean;
  onToggle: (k: CategoryKey) => void;
};

const SelectableCard: React.FC<Props> = ({ k, selected, onToggle }) => {
  const Meta = CATEGORY_META[k];
  const Icon = Meta.icon;

  return (
    <button
      onClick={() => onToggle(k)}
      className={`group relative flex h-36 w-full items-center justify-between overflow-hidden rounded-2xl border p-5 text-left transition ${
        selected ? "border-transparent bg-gradient-to-br text-white shadow-md " + Meta.grad : "border-gray-200 bg-white hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
      }`}
      aria-pressed={selected}
    >
      <div>
        <div className="mb-1 inline-flex items-center gap-2 text-base font-semibold">
          <Icon className={`h-5 w-5 ${selected ? "text-white" : "text-gray-700 dark:text-gray-200"}`} />
          {k}
        </div>
        <p className={`text-sm ${selected ? "text-white/90" : "text-gray-500 dark:text-gray-400"}`}>{Meta.desc}</p>
      </div>
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 blur-2xl ${selected ? "bg-white" : "bg-gray-400 dark:bg-gray-700"}`} />
    </button>
  );
};

export default SelectableCard;
