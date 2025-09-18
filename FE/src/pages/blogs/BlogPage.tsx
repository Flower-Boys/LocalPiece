import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogs } from "@/api/blog";
import { Blog } from "@/types/blog";
import { Eye, Heart, MessageCircle, User } from "lucide-react";
import defaultThumbnail from "@/assets/default-thumbnail.png";
import AuthButtons from "@/components/share/auth/AuthButtons";
import SearchBar from "@/components/home/SearchBar";

const BlogPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const navigate = useNavigate();
  const handleSearch = (params: { sigunguCode?: string; contentTypeId?: string; keyword?: string }) => {
    const nextParams = new URLSearchParams();

    if (params.sigunguCode) nextParams.set("sigunguCode", params.sigunguCode);
    if (params.contentTypeId) nextParams.set("contentTypeId", params.contentTypeId);
    if (params.keyword) nextParams.set("keyword", params.keyword);

    nextParams.set("page", "1"); // 검색 시 항상 1페이지부터 시작
    nextParams.set("arrange", "R"); // ✅ 대표이미지 + 생성일순 정렬
    navigate({ pathname: "/", search: nextParams.toString() });
  };

  // ✅ 블로그 목록 불러오기
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await getBlogs();
        setBlogs(data);
      } catch (err) {
        console.error("블로그 목록 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleAcceptAI = () => {
    setShowModal(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("AI 생성 완료! (API 연결 예정)");
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 relative">
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
      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h1 className="text-3xl font-bold">🌍 여행 블로그</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold">
              AI로 생성하기
            </button>
            <button onClick={() => navigate("/blog/write")} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold">
              추억 기록하기
            </button>
          </div>
        </div>
        <hr className="py-5" />

        {/* 블로그 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => navigate(`/blog/${blog.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.01] transition cursor-pointer flex flex-col"
            >
              {/* 이미지 */}
              <img src={blog.thumbnail && blog.thumbnail.trim() !== "" ? blog.thumbnail : defaultThumbnail} alt={blog.title} className="w-full h-44 object-cover" />

              {/* 본문 */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <User size={14} className="text-gray-400" />
                    {blog.author} · {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* 메타 정보 (칩 스타일) */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-auto">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <Eye size={12} /> {blog.viewCount}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <Heart size={12} /> {blog.likeCount}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <MessageCircle size={12} /> {blog.commentCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">AI로 블로그를 생성하시겠습니까?</h2>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                취소
              </button>
              <button onClick={handleAcceptAI} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                수락
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 스피너 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
