import { useModalStore } from "@/store/modalStore";
import CancelAccountConfirm from "@/components/share/auth/CancelAccountConfirm";
import Modal from "../../components/share/auth/Modal";
import { UserCircle, MapPin, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBlogs } from "@/api/blog";
import type { Blog } from "@/types/blog";
import defaultThumbnail from "@/assets/default-thumbnail.png";
import MapPuzzle from "./MapPuzzle";

const MyPage = () => {
  const navigate = useNavigate();
  const { openModal, setOpenModal } = useModalStore();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ 사이드바 모드 상태
  const [viewMode, setViewMode] = useState<"default" | "map">("default");

  // ✅ 블로그 API 호출
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await getMyBlogs();
        setBlogs(data);
      } catch (err) {
        console.error("블로그 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* 왼쪽 사이드바 */}
      <aside className="md:col-span-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
        <UserCircle size={80} className="text-gray-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-1">마이페이지</h1>
        <p className="text-sm text-gray-600">내 계정 관리 및 기록</p>

        <div className="mt-6 flex flex-col gap-3 w-full">
          <button onClick={() => setViewMode("default")} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200">
            기본 보기
          </button>
          {/* ✅ 지도 보기 버튼 */}
          <button onClick={() => setViewMode("map")} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            지도 보기
          </button>
          <button onClick={() => setOpenModal("cancelAccount")} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            회원 탈퇴
          </button>
        </div>
      </aside>

      {/* 오른쪽 메인 */}
      <main className="md:col-span-3 space-y-10">
        {viewMode === "map" ? (
          // ✅ 지도 모드
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MapPin className="text-rose-500" /> 나의 여행 지도
            </h2>
            <MapPuzzle />
          </section>
        ) : (
          // ✅ 기본 모드 (기존 여행 기록 + 블로그)
          <>
            {/* 내가 작성한 블로그 */}
            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <BookOpen className="text-blue-500" /> 내가 작성한 블로그
              </h2>
              {loading ? (
                <p className="text-gray-500">블로그를 불러오는 중...</p>
              ) : blogs.length === 0 ? (
                <p className="text-gray-500">작성한 블로그가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <div key={blog.id} onClick={() => navigate(`/blog/${blog.id}`)} className="cursor-pointer bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
                      <img src={blog.thumbnail && blog.thumbnail.trim() !== "" ? blog.thumbnail : defaultThumbnail} alt={blog.title} className="w-full h-44 object-cover" />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{blog.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(blog.createdAt).toLocaleDateString()} · 조회 {blog.viewCount} · 좋아요 {blog.likeCount} · 댓글 {blog.commentCount}
                        </p>
                        {blog.likedByCurrentUser && <span className="text-xs text-rose-500 font-medium">♥ 내가 좋아요한 글</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* 회원탈퇴 모달 */}
      <Modal isOpen={openModal === "cancelAccount"} onClose={() => setOpenModal(null)}>
        <CancelAccountConfirm />
      </Modal>
    </div>
  );
};

export default MyPage;
