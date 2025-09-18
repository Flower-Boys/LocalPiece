import apiClient from "./client";
import { User } from "@/types/users";

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
  await apiClient.post(
    "/users/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } } // 🔑 토큰 필요
  );
  localStorage.removeItem("accessToken");
};

// ✅ 회원탈퇴
export const cancelUser = async () => {
  const token = localStorage.getItem("accessToken");
  await apiClient.delete("/users/cancel", {
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.removeItem("accessToken");
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
