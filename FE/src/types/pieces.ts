export type TravelPiece = {
  pieceId: number; // 조각 ID
};

/** 생성 요청 바디 */
export type CreatePiecePayload = {
  blogId: number; // 조각으로 만들 블로그 ID
  city: string; // 도시명 (예: "경주")
};
