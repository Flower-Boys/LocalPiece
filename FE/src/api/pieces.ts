// src/api/pieces.ts
import apiClient from "./client";
import { CreatePieceResult , CreatePiecePayload, TravelPieceSummary } from "../types/pieces";

/** 생성: POST /mypage/pieces */
export const createMyPagePiece = (payload: CreatePiecePayload) => apiClient.post<CreatePieceResult >("/mypage/pieces", payload).then((r) => r.data);

/** 조회: GET /mypage/pieces */
export const getMyPagePieces = () => apiClient.get<TravelPieceSummary[]>("/mypage/pieces").then((r) => r.data);