import { useModalStore } from "@/store/modalStore";
import CancelAccountConfirm from "@/components/share/auth/CancelAccountConfirm";
import Modal from "../../components/share/auth/Modal";
import { UserCircle, MapPin, BookOpen, Trophy, Puzzle, Crown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBlogs } from "@/api/blog";
import type { Blog } from "@/types/blog";
import defaultThumbnail from "@/assets/default-thumbnail.png";
import MapPuzzle from "./MapPuzzle";
import { Eye, Heart, MessageCircle, User } from "lucide-react";
import MyAiTravelRoutes from "@/components/mypage/MyAiTravelRoutes";

// ✅ 조각 API/타입
import { getMyPagePieces } from "@/api/pieces";
import { sigunguCodeLabel } from "@/components/home/constants";
import { TravelPieceSummary } from "../../types/pieces";

import ProgressGauge from "@/components/mypage/ProgressGauge";
import Scrapbook from "@/components/mypage/Scrapbook";

const canonical = (name: string) => name.replace(/(시|군|구)$/, "");

const cityToCode = (city: string): string | undefined => {
  const target = canonical(city);
  for (const [code, name] of Object.entries(sigunguCodeLabel)) {
    if (canonical(name) === target) return code;
  }
  return undefined;
};

const codeToCity = (code: string): string => {
  const name = sigunguCodeLabel[code];
  return name ? canonical(name) : code;
};

// 뱃지 규칙
const getBadge = (totalPieces: number) => {
  if (totalPieces >= 10) return { label: "Master Traveler", icon: Crown, tone: "text-yellow-600", bg: "bg-yellow-50", ring: "ring-yellow-200" };
  if (totalPieces >= 5) return { label: "Explorer", icon: Trophy, tone: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" };
  if (totalPieces >= 1) return { label: "Beginner Traveler", icon: Puzzle, tone: "text-sky-600", bg: "bg-sky-50", ring: "ring-sky-200" };
  return { label: "Start your first piece!", icon: Puzzle, tone: "text-gray-600", bg: "bg-gray-50", ring: "ring-gray-200" };
};

const MyPage = () => {
  const navigate = useNavigate();
  const { openModal, setOpenModal } = useModalStore();

  // 내 블로그
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // 보기 모드
  const [viewMode, setViewMode] = useState<"default" | "map" | "scrapbook" | "aitravel">("default");
  useEffect(() => {
    console.log("viewMode changed:", viewMode);
  }, [viewMode]);

  // 조각
  const [pieces, setPieces] = useState<TravelPieceSummary[]>([]);
  const [piecesLoading, setPiecesLoading] = useState(false);

  // 지도 선택
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null); // 예: "경주시"

  // 전체 도시 수
  const totalCities = Object.keys(sigunguCodeLabel).length;

  // ───────── 데이터 로드 ─────────
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

  // 지도 보기 최초 진입 시 조각 로드
  useEffect(() => {
    if ((viewMode !== "map" && viewMode !== "scrapbook" && viewMode !== "aitravel") || pieces.length > 0) return;
    (async () => {
      try {
        setPiecesLoading(true);
        const data = await getMyPagePieces(); // GET /mypage/pieces
        setPieces(data);
      } catch (e) {
        console.error("조각 불러오기 실패:", e);
      } finally {
        setPiecesLoading(false);
      }
    })();
  }, [viewMode, pieces.length]);

  // visits: 코드별 카운트
  const visits = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const p of pieces) {
      const code = cityToCode(p.city);
      if (!code) continue;
      acc[code] = (acc[code] || 0) + 1;
    }
    return acc;
  }, [pieces]);

  // 총 조각 수 & 상위 지역
  const totalPieces = pieces.length;
  const uniqueCities = useMemo(() => new Set(pieces.map((p) => canonical(p.city))).size, [pieces]);
  const topCities = useMemo(() => {
    const map = new Map<string, number>();
    pieces.forEach((p) => {
      const k = canonical(p.city);
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3); // [["경주",3],["포항",2],...]
  }, [pieces]);

  const badge = getBadge(totalPieces);

  // 지도 클릭 핸들러 (메모)
  const handleSelectRegion = useCallback((regionName: string) => {
    setSelectedRegion(regionName);
  }, []);

  // 선택 지역 조각 리스트
  const filteredPieces = useMemo(() => {
    if (!selectedRegion) return [];
    const target = canonical(selectedRegion);
    return pieces.filter((p) => canonical(p.city) === target);
  }, [pieces, selectedRegion]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* 왼쪽 사이드바 */}
      <aside className="md:col-span-1 bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
        <UserCircle size={80} className="text-gray-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-1">마이페이지</h1>
        <p className="text-sm text-gray-600">내 계정 관리 및 기록</p>

        <div className="mt-6 flex flex-col gap-3 w-full">
          {/* 기본 보기 */}
          <button
            onClick={() => {
              setViewMode("default");
              setSelectedRegion(null);
            }}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
              viewMode === "default" ? "bg-gray-600 text-white shadow-md scale-[1.02]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🏠 기본 보기
          </button>

          {/* 지도 보기 */}
          <button
            onClick={() => setViewMode("map")}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
              viewMode === "map" ? "bg-green-400 text-white shadow-md scale-[1.02]" : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            🗺️ 지도 보기
          </button>

          {/* 조각 북 */}
          <button
            onClick={() => setViewMode("scrapbook")}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
              viewMode === "scrapbook" ? "bg-purple-400 text-white shadow-md scale-[1.02]" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            📖 조각 북
          </button>

          {/* 여행 루트 */}
          <button
            onClick={() => setViewMode("aitravel")}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
              viewMode === "aitravel" ? "bg-blue-400 text-white shadow-md scale-[1.02]" : "bg-blue-200 text-blue-700 hover:bg-blue-200"
            }`}
          >
            ✈️ 여행 루트
          </button>

          {/* 회원 탈퇴 */}
          <button onClick={() => setOpenModal("cancelAccount")} className="w-full py-3 rounded-xl font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200">
            ❌ 회원 탈퇴
          </button>
        </div>
      </aside>

      {/* 오른쪽 메인 */}
      <main className="md:col-span-3 space-y-10">
        {viewMode === "scrapbook" ? (
          <Scrapbook pieces={pieces} />
        ) : viewMode === "map" ? (
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MapPin className="text-rose-500" /> 나의 여행 지도
            </h2>

            {piecesLoading ? (
              <p className="text-gray-500">여행지 조각을 불러오는 중...</p>
            ) : (
              <>
                {/* 지도 */}
                <MapPuzzle visits={visits} onSelectCity={handleSelectRegion} />

                {/* 요약 박스: 총 조각, 유니크 도시, 뱃지, Top3 */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs text-gray-500">총 수집한 조각</p>
                    <p className="mt-1 text-2xl font-bold">{totalPieces}개</p>
                    <p className="text-xs text-gray-400 mt-1">도시별 블로그 글 1개 = 조각 1개</p>
                  </div>

                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs text-gray-500">조각을 모은 도시</p>
                    <p className="mt-1 text-2xl font-bold">{uniqueCities}곳</p>
                    <p className="text-xs text-gray-400 mt-1">경북 시·군 기준</p>
                  </div>

                  <div className={`rounded-xl border ${badge.bg} p-4 ring-1 ${badge.ring}`}>
                    <p className="text-xs text-gray-500">나의 등급</p>
                    <div className={`mt-1 flex items-center gap-2 ${badge.tone}`}>
                      {badge.icon ? <badge.icon size={22} /> : null}
                      <p className="text-lg font-semibold">{badge.label}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">더 많은 조각을 모아 등급을 올려보세요!</p>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressGauge collectedCities={uniqueCities} totalCities={totalCities} />
                </div>

                {/* Top 3 도시 */}
                {topCities.length > 0 && (
                  <div className="mt-4 rounded-xl border bg-white p-4">
                    <p className="text-sm font-semibold mb-2">가장 많이 모은 조각 TOP 3</p>
                    <ol className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {topCities.map(([city, cnt], i) => (
                        <li key={city} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <span className="font-medium">
                            {i + 1}. {city}
                          </span>
                          <span className="text-gray-500">{cnt}개</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* 선택된 지역의 조각(=블로그) 카드 */}
                <div className="mt-8">
                  {selectedRegion ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{selectedRegion} 조각</h3>
                        <button onClick={() => setSelectedRegion(null)} className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50">
                          선택 해제
                        </button>
                      </div>

                      {filteredPieces.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {filteredPieces.map((p) => (
                            <div key={p.pieceId} onClick={() => navigate(`/blog/${p.blogId}`)} className="cursor-pointer bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
                              <img src={p.thumbnail && p.thumbnail.trim() !== "" ? p.thumbnail : defaultThumbnail} alt={p.title ?? "조각"} className="w-full h-44 object-cover" />
                              <div className="p-4">
                                <h4 className="font-semibold text-base truncate">{p.title ?? "(제목 없음)"}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {codeToCity(cityToCode(p.city) ?? p.city)} · {new Date(p.createdAt ?? Date.now()).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">해당 지역의 조각이 아직 없어요.</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">지도를 클릭하면 해당 지역의 조각(블로그)이 아래에 표시됩니다.</p>
                  )}
                </div>
              </>
            )}
          </section>
        ) : viewMode === "aitravel" ? (
          /* ✅ 여기 추가 */
          <MyAiTravelRoutes />
        ) : (
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
