// src/api/pieces.ts
import apiClient from "./client";
import { TravelPiece, CreatePiecePayload } from "../types/pieces";

/** 생성: POST /mypage/pieces */
export const createMyPagePiece = (payload: CreatePiecePayload) => apiClient.post<TravelPiece>("/mypage/pieces", payload).then((r) => r.data);
