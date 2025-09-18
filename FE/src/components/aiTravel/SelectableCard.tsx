import React from "react";
import { Mountain, Waves, Tent, Heart, UtensilsCrossed, Building2, Landmark } from "lucide-react";
import type { CategoryKey } from "@/types/aiTravel";

// ✅ 이미지 import
import mountImg from "@/assets/mount.png";
import oceanImg from "@/assets/ocean.png";
import campingImg from "@/assets/camping.png";
import healingImg from "@/assets/healing.png";
import foodImg from "@/assets/food.png";
import cityImg from "@/assets/city.png";
import cultureImg from "@/assets/culture.png";

export const CATEGORY_META: Record<CategoryKey, { icon: React.ElementType; desc: string; img: string; overlay: string }> = {
  산: { icon: Mountain, desc: "등산/전망/계곡", img: mountImg, overlay: "from-emerald-600/70 to-teal-600/70" },
  바다: { icon: Waves, desc: "해변/드라이브/일몰", img: oceanImg, overlay: "from-sky-600/70 to-blue-600/70" },
  캠핑: { icon: Tent, desc: "오토/글램핑/차박", img: campingImg, overlay: "from-orange-600/70 to-amber-600/70" },
  힐링: { icon: Heart, desc: "온천/스파/산책", img: healingImg, overlay: "from-pink-600/70 to-rose-600/70" },
  먹거리: { icon: UtensilsCrossed, desc: "시장/맛집/카페", img: foodImg, overlay: "from-yellow-600/70 to-amber-600/70" },
  도심: { icon: Building2, desc: "전시/쇼핑/야경", img: cityImg, overlay: "from-indigo-600/70 to-purple-600/70" },
  문화: { icon: Landmark, desc: "역사/유적/전통", img: cultureImg, overlay: "from-red-600/70 to-orange-600/70" },
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
      className={`relative flex h-36 w-full items-end overflow-hidden rounded-2xl text-left shadow transition 
        ${selected ? "ring-2 ring-amber-400 scale-[1.02]" : "hover:shadow-md"} 
      `}
      aria-pressed={selected}
    >
      {/* ✅ 배경 이미지 */}
      <img src={Meta.img} alt={k} className="absolute inset-0 h-full w-full object-cover" />

      {/* ✅ 오버레이 (선택 시 진하게, 아닐 시 살짝) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${Meta.overlay} transition 
          ${selected ? "opacity-90" : "opacity-50 group-hover:opacity-70"}`}
      />

      {/* ✅ 텍스트 컨텐츠 */}
      <div className="relative z-10 p-4">
        <div className="mb-1 flex items-center gap-2 text-base font-semibold text-white drop-shadow">
          <Icon className="h-5 w-5" />
          {k}
        </div>
        <p className="text-sm text-white/90">{Meta.desc}</p>
      </div>
    </button>
  );
};

export default SelectableCard;
