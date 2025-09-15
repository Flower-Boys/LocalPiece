import apiClient from "./client";

import { Blog } from "@/types/blog";

// ✅ 블로그 목록 조회
export const getBlogs = async (): Promise<Blog[]> => {
  const res = await apiClient.get("/blogs"); // /api/blogs 프록시 적용됨
  return res.data;
};