import axios from "axios";

// API 클라이언트 인스턴스 생성
const apiClient = axios.create({
  // 벡엔드 서버의 기본 URL을 설정합니다.
  // 이제 모든 요청은 이 주소를 기준으로 이루어집니다.
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 요청 타임아웃을 10초로 설정합니다.
  timeout: 10000,
  // 요청 헤더에 JSON 형식임을 명시합니다.
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
