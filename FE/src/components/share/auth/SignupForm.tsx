import { useModalStore } from "@/store/modalStore";
import { signup } from "../../../api/auth";
import { useState } from "react";

const SignupForm = () => {
  const setOpenModal = useModalStore((s) => s.setOpenModal);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({ email, password, nickname, gender });
      setOpenModal("signupSuccess");
    } catch (err) {
      alert("회원가입 실패 😢");
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center text-gray-800">회원가입</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400" />
      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임" className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400" />

      <select value={gender} onChange={(e) => setGender(e.target.value as "M" | "F")} className="border px-4 py-3 rounded-lg focus:ring-2 focus:ring-rose-400">
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
