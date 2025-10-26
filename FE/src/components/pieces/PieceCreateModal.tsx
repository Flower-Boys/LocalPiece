// src/components/pieces/PieceCreateModal.tsx
import { useEffect, useMemo, useState } from "react";
import { X, Puzzle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createMyPagePiece } from "@/api/pieces";
import { sigunguCodeLabel } from "@/components/home/constants";

type Props = {
  open: boolean;
  onClose: () => void;
  blogId: number;
  onCreated?: (pieceId: number) => void;
};

export default function PieceCreateModal({ open, onClose, blogId, onCreated }: Props) {
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cityList = useMemo(() => {
    // sigunguCodeLabel의 값(이름)만 추출해서 중복 제거
    const names = Object.values(sigunguCodeLabel) as string[];
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, "ko"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setCity("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const canSubmit = !!city;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast("도시를 선택해주세요.");
      return;
    }
    try {
      setSubmitting(true);
      const created = await createMyPagePiece({ blogId, city });
      toast.success("여행지 조각이 생성되었습니다.");
      onCreated?.(created.pieceId);
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "조각 생성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Puzzle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">여행지 조각 생성</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">도시 선택</label>
            <select className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">선택하세요</option>
              {cityList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">예: 경주, 포항, 안동 등</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            취소
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Puzzle className="w-4 h-4" />}
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
