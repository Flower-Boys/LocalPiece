import { useModalStore } from "@/store/modalStore";
import { useAuthStore } from "@/store/authStore";
import { signup, login } from "../../../api/auth";
import { useState } from "react";
import toast from "react-hot-toast";

const SignupForm = () => {
  const setOpenModal = useModalStore((s) => s.setOpenModal);
  const { login: setLogin } = useAuthStore(); // ✅ 로그인 상태 저장

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다 😢");
      return;
    }

    try {
      // ✅ 회원가입
      await signup({ email, password, nickname, gender });
      toast.success("회원가입 성공 🎉");

      // ✅ 회원가입 성공 시 자동 로그인
      const token = await login({ email, password });
      setLogin(token);

      setOpenModal(null); // 모달 닫기
      toast.success("자동 로그인 완료 ✅");
    } catch (err) {
      toast.error("회원가입 또는 로그인 실패 😢 다시 시도해주세요");
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-gray-800">회원가입</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400 text-gray-800 placeholder-gray-400"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400 text-gray-800 placeholder-gray-400"
        required
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="비밀번호 확인"
        className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400 text-gray-800 placeholder-gray-400"
        required
      />

      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임"
        className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400 text-gray-800 placeholder-gray-400"
        required
      />

      <select value={gender} onChange={(e) => setGender(e.target.value as "M" | "F")} className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400 text-gray-800">
        <option value="M">남성</option>
        <option value="F">여성</option>
      </select>

      <button type="submit" className="py-3 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white rounded-lg shadow hover:shadow-lg">
        가입하기
      </button>
    </form>
  );
};

export default SignupForm;
