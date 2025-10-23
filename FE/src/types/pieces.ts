export type CreatePieceResult  = {
  pieceId: number; // 조각 ID
};

/** 생성 요청 바디 */
export type CreatePiecePayload = {
  blogId: number; // 조각으로 만들 블로그 ID
  city: string; // 도시명 (예: "경주")
};

/** 조회/목록 응답(요약) */
export type TravelPieceSummary = {
  pieceId: number;
  blogId: number;
  title: string;
  city: string;            // any ❌ → string 으로 고정
  createdAt: string;       // ISO 문자열
  thumbnail?: string | null;
};

export type ProgressGaugeProps = {
  collectedCities: number; // 수집한 도시 수
  totalCities: number;     // 전체 도시 수 (경북 시군구 개수)
};

export type JigsawPieceProps = {
  imageUrl: string;
  label?: string;           // 조각 제목(옵션)
  subtitle?: string;        // 도시/날짜(옵션)
  size?: number;            // 정사각 한 변 px (기본 160)
  onClick?: () => void;
  variant?: number; // 0~3
};