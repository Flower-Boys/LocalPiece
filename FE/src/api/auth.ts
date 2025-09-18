import apiClient from "./client";

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
