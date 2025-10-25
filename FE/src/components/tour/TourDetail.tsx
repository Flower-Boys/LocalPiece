import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../../components/home/SearchBar";
import TourMap from "../../components/tour/TourMap";
import { getTourCommon, getTourIntro, getTourInfo, getTourImages } from "../../api/tour";
import { TourCommonResponse, TourIntroResponse, TourInfoResponse, TourImageResponse } from "../../types/tour";
import { MapPin, ExternalLink, Phone, Share2, ArrowLeft, Clock4, Landmark, BadgeInfo, Images, ChevronDown, ChevronUp, MapPinned, Link as LinkIcon } from "lucide-react";
import TourImageModal from "./TourImageModal";
import { fetchAreaBasedTours } from "../../api/tour";
import { AreaBasedTourItem } from "../../types/tour";
import AuthButtons from "../../components/share/auth/AuthButtons";

const kv = (label: string, value?: string | null) => (
  <div className="flex items-start gap-2">
    <span className="min-w-20 shrink-0 text-gray-500">{label}</span>
    <span className="text-gray-800">{value || "정보 없음"}</span>
  </div>
);

// 간단한 contentType 라벨 매핑
const contentTypeLabel: Record<string, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제/공연",
  "25": "여행코스",
  "28": "레저",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
};

const formatTel = (tel?: string | null) => (tel ? tel.replace(/\s+/g, " ") : null);
const cleanText = (html?: string | null) => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n") // <br> → 줄바꿈
    .replace(/<\/?[^>]+(>|$)/g, ""); // 나머지 태그 제거
};

const stripHtml = (html?: string) => {
  if (!html) return "";
  // 한국관광공사 overview에 종종 a/p 태그가 섞여있어서 정리
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "");
};

// helper 함수 (TourDetail.tsx 위쪽에 추가하거나 utils로 분리 가능)
const extractHref = (html?: string | null): string | undefined => {
  if (!html) return undefined;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const link = doc.querySelector("a");
    return link?.getAttribute("href") || undefined;
  } catch {
    return undefined;
  }
};

const TourDetail = () => {
  const { state } = useLocation() as {
    state: {
      id: string;
      title: string;
      location: string;
      type?: string | number;
      image: string;
      mapx: string;
      mapy: string;
      typeId?: number | null;
    };
  };
  console.log(state);

  const navigate = useNavigate();

  const [common, setCommon] = useState<TourCommonResponse | null>(null);
  const [intro, setIntro] = useState<TourIntroResponse | null>(null);
  const [info, setInfo] = useState<TourInfoResponse[]>([]);
  const [images, setImages] = useState<TourImageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false); // overview 더보기
  const [searchResults, setSearchResults] = useState<AreaBasedTourItem[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = (params: { sigunguCode: string; contentTypeId: string }) => {
    // 👉 Home으로 이동하면서 검색 파라미터 전달
    navigate("/", { state: params });
  };
  // console.log(state.type);
  // console.log(state.typeId);
  useEffect(() => {
    if (!state) return;

    const fetchData = async () => {
      try {
        // 1) 먼저 raw 값을 고른다 (null/undefined면 typeId로)
        const rawContentType = state?.type ?? state?.typeId; // undefined/null 이면 뒤로 넘어감

        // 2) 최종 문자열 변환 (둘 다 없으면 undefined 유지)
        const contentTypeId = rawContentType == null ? undefined : String(rawContentType);
        console.log(contentTypeId);
        // 사용
        const [commonRes, introRes, infoRes, imageRes] = await Promise.all([
          getTourCommon(state.id),
          getTourIntro(state.id, String(contentTypeId)),
          getTourInfo(state.id, String(contentTypeId)),
          getTourImages(state.id),
        ]);

        setCommon(commonRes[0] || null);
        setIntro(introRes[0] || null);
        setInfo(infoRes || []);
        setImages(imageRes || []);
      } catch (err) {
        console.error("관광지 상세조회 에러:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state]);

  if (!state) return <div className="p-10 text-center">잘못된 접근입니다.</div>;

  const { id, title, location, image, mapx, mapy, type } = state;
  console.log(location);
  console.log(mapx, mapy);

  // const heroImage = common?.firstimage || image || "https://placehold.co/1200x600/png";
  // const prettyType = contentTypeLabel[String(type)] || "정보";
  const phoneText = formatTel(common?.tel);
  const homepage = extractHref(common?.homepage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalImages, setModalImages] = useState<{ url: string; alt?: string }[]>([]);

  // 길찾기/공유/복사 등
  // 안전 숫자 변환
  const toNum = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // ---- 파생값 (렌더에서만 사용) ----
  const rawContentType = state?.type ?? state?.typeId;
  const contentTypeId = rawContentType == null ? undefined : String(rawContentType);
  const prettyType = contentTypeLabel[contentTypeId ?? ""] || "정보";

  // 제목 / 주소 / 히어로 이미지
  const effTitle = common?.title ?? state.title ?? "";
  const effAddr1 = common?.addr1 ?? "";
  const effAddr2 = common?.addr2 ?? "";
  const effAddr = [effAddr1, effAddr2].filter(Boolean).join(" ") || state.location || "";
  const heroImage = common?.firstimage || state.image;

  // 좌표 (API common 우선 → state 보조)
  const effLng = toNum(common?.mapx ?? state.mapx); // x = 경도
  const effLat = toNum(common?.mapy ?? state.mapy); // y = 위도

  // 길찾기 URL
  const mapsSearchUrl = effLat != null && effLng != null ? `https://www.google.com/maps/search/?api=1&query=${effLat},${effLng}` : undefined;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("링크가 클립보드에 복사되었습니다.");
    } catch {
      // noop
    }
  };
  const cleanText = (html?: string | null) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, "\n") // <br> → 줄바꿈
      .replace(/<\/?[^>]+(>|$)/g, ""); // 나머지 태그 제거
  };
  return (
    <div className="w-full min-h-screen bg-neutral-50">
      {/* 상단 검색바 영역 */}
      <section className="from-pink-500 to-rose-500 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          {/* 왼쪽 여백 */}
          <div></div>

          {/* 중앙 검색바 */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* 오른쪽 버튼 */}
          <div className="flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </section>

      {/* 히어로 */}
      <header className="relative w-full h-[360px] md:h-[420px]">
        {heroImage ? (
          <img src={heroImage} alt={effTitle} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex flex-col items-center justify-center text-gray-700 rounded-lg">
            <span className="text-2xl font-semibold mb-1">🗺️ 이미지가 없습니다</span>
            <span className="text-sm opacity-70">조각을 채워 여행을 완성하세요 🧩</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 pb-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs rounded-full bg-white/20 backdrop-blur">{prettyType}</span>
            {common?.areacode && <span className="px-2 py-1 text-xs rounded-full bg-white/20 backdrop-blur">지역코드 {common.areacode}</span>}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow">{common?.title ?? effTitle}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm md:text-base text-gray-200">
            <MapPin className="w-4 h-4" />
            {effAddr}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {/* {common?.cpyrhtDivCd && <span className="text-xs px-2 py-1 rounded bg-white/15">저작권: {common.cpyrhtDivCd}</span>} */}
            {(common?.createdtime || common?.modifiedtime) && (
              <span className="text-xs px-2 py-1 rounded bg-white/15 flex items-center gap-1">
                <Clock4 className="w-3 h-3" />
                {common?.modifiedtime
                  ? (() => {
                      const date = common.modifiedtime.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3");
                      const time = common.modifiedtime.slice(8, 14).replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3");
                      return `업데이트 ${date} ${time}`;
                    })()
                  : (() => {
                      const date = common.createdtime.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3");
                      const time = common.createdtime.slice(8, 14).replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3");
                      return `생성 ${date} ${time}`;
                    })()}
              </span>
            )}

            {intro?.heritage1 === "1" && (
              <span className="text-xs px-2 py-1 rounded bg-amber-500/80 text-black flex items-center gap-1">
                <Landmark className="w-3 h-3" />
                문화재
              </span>
            )}
          </div>
        </div>

        {/* 좌상단 뒤로가기 */}
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur" aria-label="뒤로가기">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      {/* 본문 그리드 */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
        {/* 좌측 콘텐츠 */}
        <section className="space-y-8">
          {/* 핵심 정보 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BadgeInfo className="w-5 h-5 text-rose-500" />
              기본 정보
            </h2>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[15px]">
              {kv("전화", phoneText)}
              <div className="flex items-start gap-2">
                <span className="min-w-20 shrink-0 text-gray-500">홈페이지</span>
                {homepage ? (
                  <div className="flex items-center gap-3">
                    <a href={homepage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      바로가기 <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => copyToClipboard(homepage)} className="text-gray-500 hover:text-gray-700" title="링크 복사">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-800">정보 없음</span>
                )}
              </div>
              {kv("우편번호", common?.zipcode)}
              <div className="sm:col-span-2">{kv("주소", `${common?.addr1 || ""} ${common?.addr2 || ""}`.trim())}</div>
              {intro?.opendate && kv("개장일", intro.opendate)}
              {/* 휴무일 */}
              {intro?.restdate && (
                <div>
                  <span className="font-medium">휴무일</span>
                  <p className="text-sm text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: intro.restdate }} />
                </div>
              )}

              {/* 관람문의 */}
              {intro?.infocenter && (
                <div>
                  <span className="font-medium">문의</span>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{cleanText(intro.infocenter)}</p>
                </div>
              )}
              {intro?.parking && kv("주차", cleanText(intro.parking))}
              {intro?.expagerange && kv("체험연령", intro.expagerange)}
              {intro?.chkpet && kv("반려동물", intro.chkpet)}
              {intro?.chkcreditcard && kv("카드결제", intro.chkcreditcard)}
            </div>
          </div>

          {/* 소개 (더보기) */}
          {common?.overview && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BadgeInfo className="w-5 h-5 text-rose-500" />
                소개
              </h2>
              <p className={`text-gray-700 whitespace-pre-line leading-relaxed transition-all ${expanded ? "line-clamp-none" : "line-clamp-5"}`}>{stripHtml(common.overview)}</p>
              <button onClick={() => setExpanded((v) => !v)} className="mt-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                {expanded ? (
                  <>
                    접기 <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    더보기 <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* 이용안내 (반복정보) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BadgeInfo className="w-5 h-5 text-rose-500" />
              이용 안내
            </h2>

            {info.length > 0 ? (
              <div className="space-y-4">
                {info.map((item) => (
                  <div key={item.serialnum || item.infoname} className="text-sm">
                    {/* 공통 필드 */}
                    {item.infoname && <h4 className="font-medium">{item.infoname}</h4>}
                    {item.infotext && <p className="text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: item.infotext }} />}

                    {/* 숙박(32) 타입 전용 */}
                    {item.contenttypeid === "32" && item.roomtitle && (
                      <div className="mt-2 border-t pt-2">
                        <p>객실명: {item.roomtitle}</p>
                        <p>
                          기준 {item.roombasecount}명 / 최대 {item.roommaxcount}명
                        </p>
                        <p>
                          비수기 {item.roomoffseasonminfee1}원 / 성수기 {item.roompeakseasonminfee1}원
                        </p>

                        {/* 객실 이미지 */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {[item.roomimg1, item.roomimg2, item.roomimg3, item.roomimg4, item.roomimg5].filter(Boolean).map((src, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setModalImages(
                                  [item.roomimg1, item.roomimg2, item.roomimg3, item.roomimg4, item.roomimg5].filter(Boolean).map((url, i) => ({ url: url!, alt: item[`roomimg${i + 1}alt`] }))
                                );
                                setCurrentIndex(idx);
                                setIsModalOpen(true);
                              }}
                              className="block"
                            >
                              <img src={src!} alt={item[`roomimg${idx + 1}alt`] || "객실 이미지"} className="rounded-md h-28 w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <BadgeInfo className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">등록된 이용 안내 정보가 없습니다</p>
              </div>
            )}
          </div>

          {/* 이미지 갤러리 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Images className="w-5 h-5 text-rose-500" />
              사진
            </h2>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={img.serialnum}
                    onClick={() => {
                      setModalImages(
                        images.map((im) => ({
                          url: im.originimgurl,
                          alt: im.imgname,
                        }))
                      );
                      setCurrentIndex(idx);
                      setIsModalOpen(true);
                    }}
                    className="block group"
                  >
                    <img
                      src={img.smallimageurl || img.originimgurl}
                      alt={img.imgname}
                      className="w-full h-40 object-cover rounded-xl ring-1 ring-gray-100 shadow-sm group-hover:opacity-90 transition"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Images className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">등록된 이미지가 없습니다</p>
              </div>
            )}
          </div>
        </section>

        {/* 우측 스티키 사이드: 지도 + CTA */}
        {/* ✅ 지도 + 길찾기 카드 */}
        <aside className="lg:sticky lg:top-6 h-max space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <MapPinned className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold">위치 & 길찾기</h3>
            </div>

            {/* 본문 */}
            <div className="p-4">
              {(() => {
                // 안전 숫자 변환 유틸
                const toNum = (v: unknown) => {
                  const n = Number(v);
                  return Number.isFinite(n) ? n : null;
                };

                // ✅ common 값이 우선, 없으면 state 보조
                const effLng = toNum(common?.mapx ?? state.mapx); // x = 경도
                const effLat = toNum(common?.mapy ?? state.mapy); // y = 위도

                // 길찾기 URL
                const mapsSearchUrl = effLat != null && effLng != null ? `https://www.google.com/maps/search/?api=1&query=${effLat},${effLng}` : undefined;

                // 실제 표시 위치 (주소)
                const effAddr = [common?.addr1, common?.addr2].filter(Boolean).join(" ") || state.location || "주소 정보 없음";

                const effTitle = common?.title ?? state.title ?? "";

                // 렌더링 조건
                if (effLat == null || effLng == null) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <MapPinned className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">좌표 정보가 없어 지도를 표시할 수 없습니다</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* 지도 */}
                    <div className="rounded-xl overflow-hidden ring-1 ring-gray-100">
                      <TourMap lat={effLat} lng={effLng} title={effTitle} location={effAddr} />
                    </div>

                    {/* 버튼 4개 */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {/* 길찾기 */}
                      <a
                        href={mapsSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <MapPin className="w-4 h-4" />
                        길찾기
                      </a>

                      {/* 공유 */}
                      <button onClick={() => copyToClipboard(window.location.href)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                        <Share2 className="w-4 h-4" />
                        공유
                      </button>

                      {/* 전화 */}
                      <a
                        href={phoneText ? `tel:${phoneText}` : undefined}
                        onClick={(e) => !phoneText && e.preventDefault()}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${phoneText ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-100 text-gray-400"}`}
                        title={phoneText ? "전화 걸기" : "전화 정보 없음"}
                      >
                        <Phone className="w-4 h-4" />
                        전화
                      </a>

                      {/* 웹사이트 */}
                      <a
                        href={homepage || undefined}
                        target="_blank"
                        onClick={(e) => !homepage && e.preventDefault()}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${homepage ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400"}`}
                        title={homepage ? "웹사이트" : "웹사이트 정보 없음"}
                      >
                        <ExternalLink className="w-4 h-4" />
                        웹사이트
                      </a>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* ✅ ID/좌표 요약 카드 (기존 유지) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="text-gray-500">콘텐츠 ID</div>
              <div className="text-gray-800">{state.id}</div>
              <div className="text-gray-500">분류</div>
              <div className="text-gray-800">{contentTypeLabel[String(state.type ?? state.typeId)] || "정보"}</div>
              <div className="text-gray-500">홈페이지</div>
              <div className="text-gray-800">
                {homepage ? (
                  <a href={homepage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    바로가기 <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  "정보 없음"
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* 하단 뒤로가기 */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </button>
      </div>
      {isModalOpen && (
        <TourImageModal
          images={modalImages}
          currentIndex={currentIndex}
          onClose={() => setIsModalOpen(false)}
          onPrev={() => setCurrentIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length)}
          onNext={() => setCurrentIndex((prev) => (prev + 1) % modalImages.length)}
        />
      )}

      {/* 로딩 상태 간단 처리 */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin h-10 w-10 rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default TourDetail;
