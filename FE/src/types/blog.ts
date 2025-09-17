// src/types/blog.ts
export interface Blog {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}

// 블로그 콘텐츠 타입
export type BlogContentType = "TEXT" | "IMAGE";

export interface BlogContentRequest {
  sequence: number;
  contentType: BlogContentType;
  content: string; // TEXT면 텍스트, IMAGE면 파일명 or presigned key
}

// 블로그 생성 요청 DTO
export interface BlogCreateRequest {
  title: string;
  isPrivate: boolean;
  contents: BlogContentRequest[];
}

// 블로그 콘텐츠 응답
export interface BlogContentResponse {
  sequence: number;
  contentType: BlogContentType;
  content: string;
}

// 블로그 응답 DTO
export interface BlogResponse {
  id: number;
  title: string;
  viewCount: number;
  createdAt: string;
  modifiedAt: string;
  author: string;
  contents: BlogContentResponse[];
  comments: any[];
  likeCount: number;
  likedByCurrentUser: boolean;
  private: boolean;
}
