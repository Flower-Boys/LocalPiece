import localClient from "./localClient";

// ✅ 회원가입
export const signup = (data: { email: string; password: string; nickname: string; gender: "M" | "F" }) => localClient.post("/users/signup", data);

// ✅ 로그인
export const login = async (data: { email: string; password: string }) => {
  const res = await localClient.post("/users/login", data);
  const { accessToken } = res.data;

  // JWT 저장
  localStorage.setItem("accessToken", accessToken);
  return accessToken;
};

// ✅ 로그아웃
export const logout = async () => {
  const token = localStorage.getItem("accessToken");
  await localClient.post(
    "/users/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } } // 🔑 토큰 필요
  );
  localStorage.removeItem("accessToken");
};

// ✅ 회원탈퇴
export const cancelUser = async () => {
  const token = localStorage.getItem("accessToken");
  await localClient.delete("/users/cancel", {
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.removeItem("accessToken");
};
