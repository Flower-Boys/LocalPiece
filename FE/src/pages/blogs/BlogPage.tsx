import ListingCard from "../../components/home/ListingCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const blogs = [
  {
    id: 1,
    title: "제주도 한 달 살기",
    location: "제주 · 한국",
    price: "2025-09-01",
    image: "https://placekitten.com/600/400",
  },
  {
    id: 2,
    title: "파리 카페 투어",
    location: "파리 · 프랑스",
    price: "2025-08-21",
    image: "https://placekitten.com/601/400",
  },
  {
    id: 3,
    title: "방콕 야시장 탐방",
    location: "방콕 · 태국",
    price: "2025-08-05",
    image: "https://placekitten.com/602/400",
  },
];

const BlogPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAcceptAI = () => {
    setShowModal(false);
    setLoading(true);

    // TODO: API 호출 부분
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
          {/* AI 생성 버튼 */}
          <button onClick={() => setShowModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold">
            AI로 생성하기
          </button>

          {/* 추억 기록 버튼 */}
          <button onClick={() => navigate("/blog/write")} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold">
            추억 기록하기
          </button>
        </div>

        {/* 블로그 카드 리스트 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <ListingCard key={blog.id} {...blog} />
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
