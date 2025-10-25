import React from "react";
import { Mountain, Tent, UtensilsCrossed, Building2, Landmark, ShoppingBag } from "lucide-react";
import type { CategoryKey } from "@/types/aiTravel";

// ✅ 이미지 import
import mountImg from "@/assets/mount.png";
import oceanImg from "@/assets/ocean.png"; // (미사용 시 삭제 가능)
import campingImg from "@/assets/camping.png";
import foodImg from "@/assets/food.png";
import cityImg from "@/assets/city.png";
import cultureImg from "@/assets/culture.png";

// "역사/문화" | "휴식/힐링" | "자연" | "맛집" | "액티비티/체험" | "쇼핑"
export const CATEGORY_META: Record<CategoryKey, { icon: React.ElementType; desc: string; img: string; overlay: string }> = {
  자연: { icon: Mountain, desc: "등산/전망/계곡", img: mountImg, overlay: "from-emerald-600/70 to-teal-600/70" },
  "휴식/힐링": { icon: Tent, desc: "오토/글램핑/차박", img: campingImg, overlay: "from-orange-600/70 to-amber-600/70" },
  맛집: { icon: UtensilsCrossed, desc: "시장/맛집/카페", img: foodImg, overlay: "from-yellow-600/70 to-amber-600/70" },
  "액티비티/체험": { icon: Building2, desc: "체험/전시/야경", img: cityImg, overlay: "from-indigo-600/70 to-purple-600/70" },
  "역사/문화": { icon: Landmark, desc: "역사/유적/전통", img: cultureImg, overlay: "from-red-600/70 to-orange-600/70" },
  쇼핑: { icon: ShoppingBag, desc: "쇼핑/아울렛/거리", img: cityImg, overlay: "from-fuchsia-600/70 to-pink-600/70" },
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
      className={`group relative flex h-36 w-full items-end overflow-hidden rounded-2xl text-left shadow transition 
        ${selected ? "ring-2 ring-amber-400 scale-[1.02]" : "hover:shadow-md"}`}
      aria-pressed={selected}
      type="button"
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
