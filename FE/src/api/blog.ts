import apiClient from "./client";

import { Blog, BlogCreateRequest, BlogResponse, BlogDetailResponse } from "@/types/blog";

// ✅ 블로그 목록 조회
export const getBlogs = async (): Promise<Blog[]> => {
  const res = await apiClient.get("/blogs"); // /api/blogs 프록시 적용됨
  return res.data;
};

// ✅ 블로그 생성 (multipart/form-data)
export const createBlog = async (payload: BlogCreateRequest, images: File[]): Promise<BlogResponse> => {
  const formData = new FormData();

  // JSON 본문
  formData.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }));

  // 이미지 파일 추가 (순서 보장)
  images.forEach((file) => {
    formData.append("images", file);
  });

  const { data } = await apiClient.post<BlogResponse>("/blogs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// 블로그 상세 조회
export const getBlogDetail = async (id: string, token?: string): Promise<BlogDetailResponse> => {
  const { data } = await apiClient.get<BlogDetailResponse>(`/blogs/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}, // 공개 글이면 토큰 없어도 조회 가능
  });
  return data;
};
