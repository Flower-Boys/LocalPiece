import apiClient from "./client";
import { User } from "@/types/users";
import toast from "react-hot-toast";

// ✅ 회원가입
export const signup = (data: { email: string; password: string; nickname: string; gender: "M" | "F" }) => apiClient.post("/users/signup", data);

// ✅ 로그인
export const login = async (data: { email: string; password: string }) => {
  const res = await apiClient.post("/users/login", data);
  const { accessToken } = res.data;

  // JWT 저장
  localStorage.setItem("accessToken", accessToken);
  return accessToken;
};

// ✅ 로그아웃
export const logout = async () => {
  const token = localStorage.getItem("accessToken");
  try {
    await apiClient.post("/users/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("accessToken");
    toast.success("로그아웃 되었습니다 👋");

    // ✅ 1.5초 후 홈으로 이동
    setTimeout(() => {
      window.location.replace("/");
    }, 1500);
  } catch (err) {
    toast.error("로그아웃 중 오류가 발생했습니다");
    console.error(err);
  }
};

// ✅ 회원탈퇴
export const cancelUser = async () => {
  const token = localStorage.getItem("accessToken");
  try {
    await apiClient.delete("/users/cancel", {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("accessToken");
    toast.success("회원탈퇴가 완료되었습니다 👋");

    // ✅ 1.5초 후 홈으로 이동
    setTimeout(() => {
      window.location.replace("/");
    }, 1500);
  } catch (err) {
    toast.error("회원탈퇴 중 오류가 발생했습니다");
    console.error(err);
  }
};

export const getUserInfo = async (): Promise<User> => {
  const res = await apiClient.get("/users/me", {
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  // 문자열 → 객체 파싱
  const raw = res.data as string;

  const emailMatch = raw.match(/이메일:\s*([^,]+)/);
  const nicknameMatch = raw.match(/닉네임:\s*([^,]+)/);
  const idMatch = raw.match(/유저 ID:\s*(\d+)/);

  return {
    email: emailMatch ? emailMatch[1].trim() : "",
    nickname: nicknameMatch ? nicknameMatch[1].trim() : "",
    id: idMatch ? Number(idMatch[1]) : -1,
  };
};
// 이메일: 2, 닉네임: 2, 유저 ID: 2
