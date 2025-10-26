import { useModalStore } from "@/store/modalStore";
import { useAuthStore } from "@/store/authStore";
import { logout as logoutApi } from "@/api/auth"; // ✅ auth.ts에서 불러오기
import { toast } from "react-hot-toast";

const LogoutConfirm = () => {
  const setOpenModal = useModalStore((s) => s.setOpenModal);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logoutApi(); // ✅ API 호출
      logout(); // ✅ Zustand 상태 초기화
      // toast.success("로그아웃 되었습니다.");
      setOpenModal(null);
    } catch (err) {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-xl font-bold text-gray-800">로그아웃 하시겠습니까?</h2>
      <div className="flex justify-center gap-3">
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          로그아웃
        </button>
        <button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
          취소
        </button>
      </div>
    </div>
  );
};

export default LogoutConfirm;
