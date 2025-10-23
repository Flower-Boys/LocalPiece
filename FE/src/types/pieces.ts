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