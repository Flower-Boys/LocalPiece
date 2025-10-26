import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { GalleryImage } from "@/types/tour";

type ImageModalProps = {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const ImageModal = ({ images, currentIndex, onClose, onPrev, onNext }: ImageModalProps) => {
  // ESC 키 닫기 & 방향키 이동
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <button className="absolute top-6 right-6 text-white hover:text-gray-300" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>
      <button className="absolute left-6 text-white hover:text-gray-300" onClick={onPrev}>
        <ChevronLeft className="w-10 h-10" />
      </button>
      {/* // TourImageModal.tsx */}
      <img src={images[currentIndex].url} alt={images[currentIndex].alt || ""} className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-lg" />
      <button className="absolute right-6 text-white hover:text-gray-300" onClick={onNext}>
        <ChevronRight className="w-10 h-10" />
      </button>
    </div>
  );
};

export default ImageModal;
