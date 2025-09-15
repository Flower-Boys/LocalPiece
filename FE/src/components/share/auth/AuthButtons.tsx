import { useAuthStore } from "@/store/authStore";
import { useModalStore } from "@/store/modalStore";
import Modal from "@/components/share/auth/Modal";
import LoginForm from "@/components/share/auth/LoginForm";
import SignupForm from "@/components/share/auth/SignupForm";
import SignupSuccess from "@/components/share/auth/SignupSuccess";
import LogoutConfirm from "@/components/share/auth/LogoutConfirm";
import { User, LogOut, UserPlus, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthButtons = () => {
  const { isLoggedIn } = useAuthStore();
  const { openModal, setOpenModal } = useModalStore();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-6">
      {isLoggedIn ? (
        <>
          {/* ✅ 마이페이지 버튼 */}
          <button onClick={() => navigate("/mypage")} className="flex flex-col items-center justify-center text-gray-700 hover:text-rose-500 transition">
            <UserCircle size={28} strokeWidth={1.5} />
            <span className="text-sm mt-1 font-bold">마이페이지</span>
          </button>

          {/* ✅ 로그아웃 버튼 */}
          <button onClick={() => setOpenModal("logoutConfirm")} className="flex flex-col items-center justify-center text-gray-700 hover:text-rose-500 transition">
            <LogOut size={28} strokeWidth={1.5} />
            <span className="text-sm mt-1 font-bold">로그아웃</span>
          </button>
        </>
      ) : (
        <>
          {/* ✅ 로그인 버튼 */}
          <button onClick={() => setOpenModal("login")} className="flex flex-col items-center justify-center text-gray-700 hover:text-rose-500 transition">
            <User size={28} strokeWidth={1.5} />
            <span className="text-sm mt-1 font-bold">로그인</span>
          </button>

          {/* ✅ 회원가입 버튼 */}
          <button onClick={() => setOpenModal("signup")} className="flex flex-col items-center justify-center text-gray-700 hover:text-rose-500 transition">
            <UserPlus size={28} strokeWidth={1.5} />
            <span className="text-sm mt-1 font-bold">회원가입</span>
          </button>
        </>
      )}

      {/* ✅ 모달들 */}
      <Modal isOpen={openModal === "login"} onClose={() => setOpenModal(null)}>
        <LoginForm />
      </Modal>
      <Modal isOpen={openModal === "signup"} onClose={() => setOpenModal(null)}>
        <SignupForm />
      </Modal>
      <Modal isOpen={openModal === "signupSuccess"} onClose={() => setOpenModal(null)}>
        <SignupSuccess />
      </Modal>
      <Modal isOpen={openModal === "logoutConfirm"} onClose={() => setOpenModal(null)}>
        <LogoutConfirm />
      </Modal>
    </div>
  );
};

export default AuthButtons;
