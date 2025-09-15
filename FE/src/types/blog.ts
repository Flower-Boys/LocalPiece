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
