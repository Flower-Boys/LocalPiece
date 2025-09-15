import { useState } from "react";
import { useModalStore } from "@/store/modalStore";
import { useAuthStore } from "@/store/authStore";
import { login } from "@/api/auth";
import toast from "react-hot-toast";

const LoginForm = () => {
  const setOpenModal = useModalStore((s) => s.setOpenModal);
  const { login: setLogin } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await login({ email, password }); // API 요청
      setLogin(token); // Zustand 상태 갱신
      setOpenModal(null); // 모달 닫기
      toast.success("로그인 성공 🎉"); // ✅ 토스트 띄우기
    } catch (err) {
      toast.error("로그인 실패 😢 다시 시도해주세요");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-gray-800">로그인</h2>

      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400" required />

      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400" required />

      <button type="submit" className="py-3 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white rounded-lg shadow hover:shadow-lg">
        로그인
      </button>
    </form>
  );
};

export default LoginForm;
