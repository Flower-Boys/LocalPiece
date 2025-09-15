// src/components/share/auth/CancelAccountConfirm.tsx
import { cancelUser } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useModalStore } from "@/store/modalStore";
import { toast } from "react-hot-toast";

const CancelAccountConfirm = () => {
  const logout = useAuthStore((s) => s.logout);
  const setOpenModal = useModalStore((s) => s.setOpenModal);

  const handleCancel = async () => {
    try {
      await cancelUser();
      logout();
      toast.success("회원 탈퇴가 완료되었습니다.");
      setOpenModal(null);
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      toast.error("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-xl font-bold text-gray-800">정말 탈퇴하시겠습니까?</h2>
      <p className="text-gray-600">탈퇴 후 데이터는 복구할 수 없습니다.</p>
      <div className="flex justify-center gap-3">
        <button onClick={handleCancel} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          탈퇴하기
        </button>
        <button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          취소
        </button>
      </div>
    </div>
  );
};

export default CancelAccountConfirm;
