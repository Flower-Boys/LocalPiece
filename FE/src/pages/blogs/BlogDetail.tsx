import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getBlogDetail } from "../../api/blog";
import { BlogDetailResponse } from "../../types/blog";
import CommentSection from "../../components/blog/CommentSection";

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken") || undefined;
        if (id) {
          const data = await getBlogDetail(id, token);
          setBlog(data);
        }
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          setError("비공개 블로그입니다. 접근 권한이 없습니다.");
        } else if (err.response?.status === 404) {
          setError("블로그를 찾을 수 없습니다.");
        } else {
          setError("블로그를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return <div className="text-center py-10">로딩 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 대표 이미지 */}
      {blog.contents?.find((c) => c.contentType === "IMAGE") && (
        <div className="relative">
          <img src={blog.contents.find((c) => c.contentType === "IMAGE")?.content || ""} alt={blog.title || "블로그 이미지"} className="w-full h-72 object-cover rounded-t-lg" />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-white rounded-t-3xl"></div>
        </div>
      )}

      {/* 본문 */}
      <div className="bg-white rounded-t-3xl -mt-6 shadow-sm p-6">
        {/* 제목 + 뒤로가기 */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">{blog.title || "제목 없음"}</h1>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-400 hover:bg-gray-200 text-white hover:text-gray-700 transition">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">뒤로가기</span>
          </button>
        </div>

        {/* 작성자 + 날짜 */}
        <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
          <span className="font-medium text-gray-700">✍️ 작성자: {blog.author || "알 수 없음"}</span>
          <span>·</span>
          <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : "날짜 없음"}</span>
        </div>
        {/* 태그 (API에 없으니 기본값 사용) */}
        <div className="flex gap-2 mb-6">
          {(blog.tags && blog.tags.length > 0 ? blog.tags : ["여행", "기록"]).map((tag, idx) => (
            <span key={idx} className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
        <hr className="my-8 border-gray-300" />

        {/* 본문 (TEXT/IMAGE 순서대로 출력) */}
        <div className="prose max-w-none">
          {blog.contents && blog.contents.length > 0 ? (
            blog.contents.map((c) =>
              c.contentType === "TEXT" ? (
                <p key={c.sequence} dangerouslySetInnerHTML={{ __html: c.content || "" }} />
              ) : (
                <img key={c.sequence} src={c.content || ""} alt={`image-${c.sequence}`} className="rounded-lg my-4" />
              )
            )
          ) : (
            <p>내용이 없습니다.</p>
          )}
        </div>

        <hr className="mt-20 mb-20 border-gray-300" />
        {/* ✅ 댓글 섹션: 새 댓글 추가 시 상위 state 갱신 */}
        <CommentSection blogId={blog.id} comments={blog.comments || []} onAdd={(newComment) => setBlog((prev) => (prev ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : prev))} />
      </div>
    </div>
  );
};

export default BlogDetail;
