import { cancelUser } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useModalStore } from "@/store/modalStore";
import { toast } from "react-hot-toast";
import { HeartCrack } from "lucide-react"; // 💔 아이콘 추가

const CancelAccountConfirm = () => {
  const logout = useAuthStore((s) => s.logout);
  const setOpenModal = useModalStore((s) => s.setOpenModal);

  const handleCancel = async () => {
    try {
      await cancelUser();
      logout();
      toast.success("그동안 함께해 주셔서 감사했습니다 🥲");
      setOpenModal(null);
    } catch (err) {
      toast.error("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-5 p-4">
      {/* 💔 감성 아이콘 */}
      <div className="bg-red-100 text-red-500 p-4 rounded-full">
        <HeartCrack size={48} strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">정말 떠나시겠어요? 🥺</h2>
        <p className="text-gray-600 text-sm">
          탈퇴 후에는 여행 기록과 조각들이 모두 사라집니다.
          <br />
          그래도 괜찮으신가요?
        </p>
      </div>

      <div className="flex justify-center gap-3 mt-4">
        <button onClick={handleCancel} className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-semibold shadow-sm hover:bg-red-600 hover:shadow transition-all">
          네, 탈퇴할게요 💔
        </button>
        <button onClick={() => setOpenModal(null)} className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all">
          다시 생각할게요 😢
        </button>
      </div>
    </div>
  );
};

export default CancelAccountConfirm;
