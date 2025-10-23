import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogs, createAiBlog, getJobStatus } from "@/api/blog";
import { Blog } from "@/types/blog";
import { Eye, Heart, MessageCircle, User } from "lucide-react";
import defaultThumbnail from "@/assets/default-thumbnail.png";
import AuthButtons from "@/components/share/auth/AuthButtons";
import SearchBar from "@/components/home/SearchBar";
import toast from "react-hot-toast";
import AiJobModal from "@/components/blog/AiJobModal";

const BlogPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [files, setFiles] = useState<File[]>([]); // ✅ 선택된 이미지들
  const [city, setCity] = useState("경북"); // ✅ request.city
  const [useV2, setUseV2] = useState(false); // ✅ request.useV2

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = (params: { sigunguCode?: string; contentTypeId?: string; keyword?: string }) => {
    const nextParams = new URLSearchParams();
    if (params.sigunguCode) nextParams.set("sigunguCode", params.sigunguCode);
    if (params.contentTypeId) nextParams.set("contentTypeId", params.contentTypeId);
    if (params.keyword) nextParams.set("keyword", params.keyword);
    nextParams.set("page", "1");
    nextParams.set("arrange", "R");
    navigate({ pathname: "/", search: nextParams.toString() });
  };

  // ✅ 블로그 목록 불러오기
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

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ✅ 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    setFiles(list);
  };

  // ✅ AI 블로그 생성 API 연결 (FormData + request + images)
  const handleAcceptAI = async () => {
    if (files.length === 0) {
      toast.error("이미지를 1장 이상 선택해 주세요.");
      return;
    }

    setShowModal(false);
    setLoading(true);

    try {
      const payload = { request: { city, useV2 }, images: files };
      const res = await createAiBlog(payload); // { jobId: string }
      setCurrentJobId(res.jobId);
      setJobModalOpen(true);
      // 필요 시 files 초기화
      setFiles([]);
    } catch (err) {
      console.error("AI 블로그 생성 실패:", err);
      toast.error("AI 블로그 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 완료/실패 콜백
  const handleCompleted = async (blogId: number) => {
    setJobModalOpen(false);
    await fetchBlogs();
    navigate(`/blog/${blogId}`);
  };

  const handleFailed = (message?: string) => {
    setJobModalOpen(false);
    toast.error(message || "AI 블로그 생성에 실패했습니다.");
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
                <div className="flex flex-col justify-between flex-1">
                  {blog.title ? <h3 className="text-lg font-semibold mb-2 line-clamp-2">{blog.title}</h3> : <p className="text-lg font-semibold text-gray-400 mb-2">제목 없음</p>}
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <User size={14} className="text-gray-400" />
                    {blog.author} ·{" "}
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "Asia/Seoul",
                        })
                      : "날짜 없음"}
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-[420px]">
            <h2 className="text-lg font-semibold mb-4 text-center">AI로 블로그를 생성하시겠습니까?</h2>

            {/* 도시/옵션 */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">도시(시/도)</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-red-400" placeholder="예: 경북" />
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useV2} onChange={(e) => setUseV2(e.target.checked)} className="h-4 w-4" />
                <span>정확도 우선 (느리지만 정확)</span>
              </label>
            </div>

            {/* 파일 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">이미지 선택 (여러 장 가능)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
              />
              {files.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  선택된 파일: <span className="font-medium">{files.length}</span>개
                </p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" disabled={loading}>
                취소
              </button>
              <button onClick={handleAcceptAI} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60" disabled={loading}>
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 진행 모달 */}
      {currentJobId && (
        <AiJobModal
          jobId={currentJobId}
          open={jobModalOpen}
          onCompleted={handleCompleted}
          onFailed={handleFailed}
          onClose={() => setJobModalOpen(false)}
          pollIntervalMs={3000}
          maxWaitMs={2 * 60 * 1000}
        />
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
