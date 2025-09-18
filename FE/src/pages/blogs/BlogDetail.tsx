import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getBlogDetail, toggleBlogLike, deleteBlog } from "../../api/blog";
import { getUserInfo } from "@/api/auth";
import { BlogDetailResponse } from "../../types/blog";
import { User } from "@/types/users";
import CommentSection from "../../components/blog/CommentSection";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import SearchBar from "../../components/home/SearchBar";
import AuthButtons from "../../components/share/auth/AuthButtons";

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<BlogDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 좋아요 상태
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [userInfo, setUserInfo] = useState<User | null>(null);

  // 전역 상태에서 로그인 여부 확인
  const { isLoggedIn } = useAuthStore();

  const handleDeleteBlog = async () => {
    if (!blog) return;
    if (!window.confirm("정말 블로그를 삭제하시겠습니까?")) return;

    try {
      await deleteBlog(blog.id);
      toast.success("블로그가 삭제되었습니다.");
      navigate("/blog"); // ✅ 삭제 후 블로그 목록으로 이동
    } catch (err) {
      console.error(err);
      toast.error("블로그 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast("🚫 로그인이 필요합니다.");
      return;
    }
    if (!blog) return;

    try {
      setLikeLoading(true);
      const res = await toggleBlogLike(blog.id);
      console.log(res.message);

      // ✅ 상태 토글 & 개수 업데이트
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err: any) {
      console.error(err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken") || undefined;

        if (!id) return;

        // ✅ 블로그 상세 + 내 정보 병렬 호출
        const [blogData, userData] = await Promise.all([
          getBlogDetail(id, token),
          getUserInfo(), // 우리가 만든 /api/users/me
        ]);

        setBlog(blogData);
        setUserInfo(userData); // ✅ 유저 정보 저장

        // 초기 상태 세팅
        setLiked(blogData.likedByCurrentUser);
        setLikeCount(blogData.likeCount);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 403) {
          setError("비공개 블로그입니다. 접근 권한이 없습니다.");
        } else if (err.response?.status === 404) {
          setError("블로그를 찾을 수 없습니다.");
        } else {
          setError("데이터 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-10">로딩 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!blog) return null;

  const handleSearch = (params: { sigunguCode?: string; contentTypeId?: string; keyword?: string }) => {
    const nextParams = new URLSearchParams();

    if (params.sigunguCode) nextParams.set("sigunguCode", params.sigunguCode);
    if (params.contentTypeId) nextParams.set("contentTypeId", params.contentTypeId);
    if (params.keyword) nextParams.set("keyword", params.keyword);

    nextParams.set("page", "1"); // 검색 시 항상 1페이지부터 시작
    nextParams.set("arrange", "R"); // ✅ 대표이미지 + 생성일순 정렬
    navigate({ pathname: "/", search: nextParams.toString() });
  };

  return (
    <div className="w-full">
      {/* ✅ 상단 헤더: 전체폭 */}
      <section className="from-pink-500 to-red-500 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          <div></div>
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
          <div className="flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </section>
      <div className="border-b py-2 border-gray-300"></div>

      {/* ✅ 본문 전체: 중앙정렬 */}
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

          {/* 작성자 + 날짜 + 좋아요 */}
          <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
            <span className="font-medium text-gray-700">✍️ 작성자: {blog.author || "알 수 없음"}</span>
            <span>·</span>
            <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : "날짜 없음"}</span>
            <span>·</span>
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${liked ? "bg-rose-100 text-rose-500" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              <div className="flex flex-row items-center justify-center">
                {liked} {likeCount}
              </div>
            </button>
          </div>

          {/* 태그 */}
          <div className="flex gap-2 mb-6">
            {(blog.tags && blog.tags.length > 0 ? blog.tags : ["여행", "기록"]).map((tag, idx) => (
              <span key={idx} className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                #{tag}
              </span>
            ))}
          </div>

          <hr className="my-8 border-gray-300" />

          {/* 본문 출력 */}
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
          <div className="flex justify-end">
            {/* ✅ 내가 쓴 글일 때만 삭제 버튼 */}
            {userInfo?.nickname === blog.author && (
              <button onClick={handleDeleteBlog} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm">
                글 삭제
              </button>
            )}
          </div>

          {/* ✅ 댓글 섹션 */}
          <CommentSection
            blogId={blog.id}
            userId={userInfo?.id ?? null}
            comments={blog.comments || []}
            onAdd={(newComment) => setBlog((prev) => (prev ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : prev))}
            onDelete={(commentId) => setBlog((prev) => (prev ? { ...prev, comments: prev.comments?.filter((c) => c.commentId !== commentId) } : prev))}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
