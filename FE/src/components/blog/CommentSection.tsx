import { BlogCommentResponse } from "../../types/blog";

type Props = {
  comments: BlogCommentResponse[];
};

const CommentSection = ({ comments }: Props) => {
  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold mb-4">💬 댓글</h2>

      {/* 댓글 입력창 */}
      <div className="mb-6">
        <textarea
          placeholder="댓글을 입력하세요..."
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
            등록
          </button>
        </div>
      </div>

      {/* 댓글 리스트 */}
      {comments && comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.commentId}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              {/* 댓글 상단 */}
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
                  <button className="hover:text-red-500">삭제</button>
                  <button className="hover:text-blue-500">답글</button>
                  <button className="hover:text-rose-500">좋아요</button>
                </div>
              </div>
              {/* 댓글 본문 */}
              <p className="text-sm text-gray-700">
                {comment.content || "댓글 없음"}
              </p>
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
