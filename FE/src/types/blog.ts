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
  thumbnail: string | null;
  private?: boolean;
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
  private?: boolean;
  contents: BlogContentRequest[];
  hashtags: string[];
  isPrivate?: boolean; // 수정 시 사용
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

// 블로그 상세 조회 댓글 응답 DTO
export interface BlogCommentResponse {
  commentId: number;
  content: string;
  author: string;
  createdAt: string;
  modifiedAt: string;
  userId: number;
}

// 블로그 상세 조회 응답 DTO
export interface BlogDetailResponse {
  id: number;
  title: string;
  viewCount: number;
  createdAt: string;
  modifiedAt: string;
  author: string;
  contents: BlogContentResponse[];
  comments: BlogCommentResponse[];
  likeCount: number;
  savedAsPiece?: boolean;
  likedByCurrentUser: boolean;
  private: boolean;
  hashtags?: string[]; // 선택적 태그 필드
}

// 댓글 작성 요청
export interface CommentCreateRequest {
  content: string;
}

// 블로그 AI 생성 요청
export interface BlogAiCreateRequest {
  city: string;
  useV2: boolean; // v2 API 사용 여부
}

// 블로그 AI 생성 응답
export interface BlogAiCreateResponse {
  jobId: string; // AI 생성 작업 ID
}

// ✅ FormData 버전도 함께 정의해두면 좋음
export interface BlogAiCreatePayload {
  request: BlogAiCreateRequest;
  images: File[];
}

// AI 작업 상태 응답
export interface JobStatusResponse {
  createdAt: string;
  modifiedAt: string;
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  resultBlogId: number | null;
  errorMessage: string | null;
}

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// 수정 초기 데이터(상세)
export type BlogDetail = {
  id: number;
  title: string;
  private: boolean;
  hashtags: string[];
  contents: Array<{
    sequence: number;
    contentType: "TEXT" | "IMAGE";
    content: string; // TEXT html or IMAGE filename
    imageId?: string; // IMAGE일 때 서버 이미지 id
    imageUrl?: string; // IMAGE일 때 표시용 url
  }>;
};
