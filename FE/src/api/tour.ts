import apiClient from "./client";
import {
  TourCommonResponse,
  TourIntroResponse,
  TourInfoResponse,
  TourImageResponse,
  KeywordSearchParams,
  KeywordTourItem,
  AreaBasedParams,
  AreaBasedTourItem,
} from "../types/tour";

/**
 * ✅ 관광지 공통정보 조회
 * GET /api/tour/detail/common/{contentId}
 */
export const getTourCommon = async (contentId: string) => {
  const res = await apiClient.get<TourCommonResponse[]>(`/tour/detail/common/${contentId}`);
  return res.data;
};

/**
 * ✅ 관광지 소개정보 조회
 * GET /api/tour/detail/intro/{contentId}?contentTypeId=12
 */
export const getTourIntro = async (contentId: string, contentTypeId: string) => {
  const res = await apiClient.get<TourIntroResponse[]>(`/tour/detail/intro/${contentId}`, {
    params: { contentTypeId },
  });
  return res.data;
};

/**
 * ✅ 관광지 반복정보 조회
 * GET /api/tour/detail/info/{contentId}?contentTypeId=12
 */
export const getTourInfo = async (contentId: string, contentTypeId: string) => {
  const res = await apiClient.get<TourInfoResponse[]>(`/tour/detail/info/${contentId}`, {
    params: { contentTypeId },
  });
  return res.data;
};

/**
 * ✅ 관광지 이미지정보 조회
 * GET /api/tour/detail/images/{contentId}
 */
export const getTourImages = async (contentId: string) => {
  const res = await apiClient.get<TourImageResponse[]>(`/tour/detail/images/${contentId}`);
  return res.data;
};

/**
 * ✅ 관광지 키워드검색 조회
 * GET /api/tour/keyword-search
 */
export const fetchKeywordSearch = async (params: KeywordSearchParams) => {
  const { data } = await apiClient.get<KeywordTourItem[]>("/tour/keyword-search", {
    params,
  });
  return data;
};

/**
 * ✅ 관광지 지역기반 검색 조회
 * GET /api/tour/area-based
 */
export const fetchAreaBasedTours = async (params: AreaBasedParams) => {
  const { data } = await apiClient.get<AreaBasedTourItem[]>("/tour/area-based", {
    params,
  });
  return data;
};
