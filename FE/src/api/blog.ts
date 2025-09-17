import apiClient from "./client";

import { Blog, BlogCreateRequest, BlogResponse, BlogDetailResponse, CommentCreateRequest, BlogCommentResponse } from "@/types/blog";

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

// ✅ 댓글 작성
export const createComment = async (blogId: string | number, payload: CommentCreateRequest, token?: string): Promise<BlogCommentResponse> => {
  // 인터셉터가 있다면 token은 생략 가능. 없다면 로컬에서 보강
  const accessToken = token ?? localStorage.getItem("accessToken") ?? undefined;

  const { data } = await apiClient.post<BlogCommentResponse>(`/blogs/${blogId}/comments`, payload, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  return data;
};
// 좋아요 토글
export const toggleBlogLike = async (blogId: string | number) => {
  const token = localStorage.getItem("accessToken");
  const res = await apiClient.post(
    `/blogs/${blogId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data; // { message: "좋아요를 눌렀습니다." }
};
