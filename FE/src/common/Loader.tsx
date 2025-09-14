import Lottie from "lottie-react";
import loadingAnim from "../assets/TrailLoading.json"; // 저장한 경로에 맞게 수정

type LoaderProps = {
  size?: number | string;
  label?: string;
};

export default function Loader({ size = 160, label = "로딩 중" }: LoaderProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
      <Lottie animationData={loadingAnim} loop autoplay style={{ width: size, height: size }} />
      <span className="sr-only">{label}</span>
    </div>
  );
}