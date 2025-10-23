// src/api/client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  // ❌ 이 줄 제거해야 함
  // headers: { "Content-Type": "application/json" },
});

// ✅ 요청 인터셉터에서 토큰만 추가 (Content-Type은 자동으로)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FormData면 Content-Type 자동 설정되도록 보장
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
