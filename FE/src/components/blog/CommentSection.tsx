import { useState } from "react";
import { BlogCommentResponse, CommentCreateRequest } from "../../types/blog";
import { createComment } from "../../api/blog";

type Props = {
  blogId: number | string;
  comments: BlogCommentResponse[];
  onAdd?: (comment: BlogCommentResponse) => void; // 부모에게 새 댓글 전달
};

const CommentSection = ({ blogId, comments, onAdd }: Props) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleSubmit = async () => {
    const text = content.trim();
    if (!text) return;

    try {
      setSubmitting(true);
      const payload: CommentCreateRequest = { content: text };
      const newComment = await createComment(blogId, payload);
      onAdd?.(newComment);        // 부모에 알림
      setContent("");             // 입력창 초기화
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 400) {
        alert("잘못된 요청입니다. 내용을 확인해주세요.");
      } else if (err?.response?.status === 401) {
        alert("로그인이 필요합니다.");
      } else if (err?.response?.status === 403) {
        alert("댓글 작성 권한이 없습니다.");
      } else {
        alert("댓글 작성 중 오류가 발생했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold mb-4">💬 댓글</h2>

      {/* 입력창 */}
      <div className="mb-6">
        <textarea
          placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isLoggedIn || submitting}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!isLoggedIn || submitting || !content.trim()}
            className={`px-4 py-2 rounded-lg text-sm ${
              !isLoggedIn || submitting || !content.trim()
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </div>

      {/* 리스트 */}
      {comments && comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.commentId}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              {/* 헤더 */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    {comment.author || "익명"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleString()
                      : "시간 없음"}
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  {/* 나중에 API 붙일 자리 */}
                  <button className="hover:text-red-500">삭제</button>
                  <button className="hover:text-blue-500">답글</button>
                  <button className="hover:text-rose-500">좋아요</button>
                </div>
              </div>
              {/* 본문 */}
              <p className="text-sm text-gray-700">{comment.content || "댓글 없음"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">아직 댓글이 없습니다.</p>
      )}
    </div>
  );
};

export default CommentSection;
