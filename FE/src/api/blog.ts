import apiClient from "./client";

import { Blog, BlogCreateRequest, BlogResponse, BlogDetailResponse, CommentCreateRequest, BlogCommentResponse, BlogAiCreateResponse, BlogAiCreatePayload, JobStatusResponse } from "@/types/blog";

// ✅ 블로그 목록 조회
export const getBlogs = async (): Promise<Blog[]> => {
  const res = await apiClient.get("/blogs"); // /api/blogs 프록시 적용됨
  return res.data;
};

export const getMyBlogs = async (): Promise<Blog[]> => {
  const res = await apiClient.get("/mypage/blogs");
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

export const deleteComment = async (blogId: string | number, commentId: string | number) => {
  const token = localStorage.getItem("accessToken");
  const res = await apiClient.delete(`/blogs/${blogId}/comments/${commentId}`);
  return res.data;
};

export const deleteBlog = async (blogId: string | number) => {
  const token = localStorage.getItem("accessToken");
  const res = await apiClient.delete(`/blogs/${blogId}`);
  return res.data;
};

// AI 블로그 생성
export const createAiBlog = async (payload: BlogAiCreatePayload): Promise<BlogAiCreateResponse> => {
  const form = new FormData();
  form.append("request", JSON.stringify(payload.request)); // ← JSON 문자열
  payload.images.forEach((f) => form.append("images", f)); // ← 'images' 반복 append (배열 키 아님)

  const { data } = await apiClient.post<BlogAiCreateResponse>(
    "/ai/generate-blog", // ← 포스트맨과 동일 경로로 통일
    form
  );
  return data;
};

// ✅ Job 상태 조회 API
export const getJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const { data } = await apiClient.get<JobStatusResponse>(`/ai/jobs/${jobId}`);
  return data;
};

// ✅ 수정 (멀티파트: request JSON + newImages[])
// request에는 { title, isPrivate, contents, hashtags, deletedImageIds } 포함
export async function updateBlog(id: number, payload: BlogCreateRequest & { deletedImageKeys?: string[] }, newImages: File[] = []) {
  const fd = new FormData();

  // ✅ 생성 API와 동일한 JSON 파트 이름을 사용! (예: "request")
  fd.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }));

  // ✅ 파일 파트 이름도 생성과 동일 (예: "images")
  newImages.forEach((file) => fd.append("images", file, file.name));

  // PUT/PATCH 중 서버와 맞춘 메서드 사용
  return apiClient.put(`/blogs/${id}`, fd);
  // 필요하면: return apiClient.patch(`/blogs/${id}`, fd);
}
