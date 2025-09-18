import ListingCard from "../../components/home/ListingCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogs } from "@/api/blog";
import { Blog } from "@/types/blog";

const BlogPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const navigate = useNavigate();

  // ✅ 내 블로그 목록 불러오기
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

    // TODO: AI 생성 API 연결 예정
    setTimeout(() => {
      setLoading(false);
      alert("AI 생성 완료! (API 연결 예정)");
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <section className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">🌍 여행 블로그</h1>

        {/* 버튼 영역 */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold">
            AI로 생성하기
          </button>
          <button onClick={() => navigate("/blog/write")} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold">
            추억 기록하기
          </button>
        </div>

        {/* 블로그 카드 리스트 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <ListingCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              location={""} // location이 API 응답에 없으니 필요하면 수정
              price={new Date(blog.createdAt).toLocaleDateString()}
              image={"https://placekitten.com/600/400"} // 이미지 없으면 placeholder
            />
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
