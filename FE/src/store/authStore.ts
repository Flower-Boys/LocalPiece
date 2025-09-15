import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  cancelAccount: () => void;
}

// ✅ 초기 상태는 localStorage 값 기반으로
const initialToken = localStorage.getItem("accessToken");

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!initialToken,
  token: initialToken,

  // 로그인 → 토큰 저장
  login: (token: string) => {
    localStorage.setItem("accessToken", token);
    set({ isLoggedIn: true, token });
  },

  // 로그아웃 → 토큰 삭제
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ isLoggedIn: false, token: null });
  },

  // 회원탈퇴 → 로그아웃과 동일
  cancelAccount: () => {
    localStorage.removeItem("accessToken");
    set({ isLoggedIn: false, token: null });
  },
}));
