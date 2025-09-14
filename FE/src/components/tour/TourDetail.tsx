import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../components/home/SearchBar";
import TourMap from "../../components/tour/TourMap";
import { getTourCommon, getTourIntro, getTourInfo, getTourImages } from "../../api/tour";
import { TourCommonResponse, TourIntroResponse, TourInfoResponse, TourImageResponse } from "../../types/tour";
import { MapPin, ExternalLink, Phone, Share2, ArrowLeft, Clock4, Landmark, BadgeInfo, Images, ChevronDown, ChevronUp, MapPinned, Link as LinkIcon } from "lucide-react";

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

// 🔑 타입별 렌더러 매핑
const renderers: Record<string, (item: TourInfoResponse) => React.ReactNode | null> = {
  // 숙박 (32)
  "32": (item) => (
    <div key={item.serialnum || item.roomtitle} className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-1">{item.roomtitle}</h3>
      {item.roomintro && <p className="text-sm text-gray-600 mb-2">{item.roomintro}</p>}
      <p className="text-sm">
        기준 {item.roombasecount}명 / 최대 {item.roommaxcount}명
      </p>
      <p className="text-sm">
        비수기 {item.roomoffseasonminfee1}원 / 성수기 {item.roompeakseasonminfee1}원
      </p>

      {/* 이미지 갤러리 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[item.roomimg1, item.roomimg2, item.roomimg3, item.roomimg4, item.roomimg5].filter(Boolean).map((src, idx) => (
          <img key={idx} src={src!} alt={item[`roomimg${idx + 1}alt`] || "객실 이미지"} className="rounded-md h-28 w-full object-cover" />
        ))}
      </div>
    </div>
  ),

  // 음식점 (39)
  "39": (item) => (
    <li key={item.serialnum} className="flex gap-2 text-sm py-1">
      <span className="font-medium">{item.infoname}:</span>
      <span>{item.infotext}</span>
    </li>
  ),

  // 관광지 (12)
  "12": (item) => (
    <div key={item.serialnum} className="mb-4">
      <h4 className="font-medium">{item.infoname}</h4>
      <p className="text-sm text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: item.infotext || "" }} />
    </div>
  ),
};

// 🔑 InfoSection 컴포넌트
const InfoSection = ({ info }: { info: TourInfoResponse[] }) => {
  if (!info || info.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BadgeInfo className="w-5 h-5 text-rose-500" />
        이용 안내
      </h2>
      <div className="space-y-4">
        {info.map((item) => {
          const renderer = renderers[item.contenttypeid];
          return renderer ? (
            renderer(item)
          ) : (
            // fallback: 공통 처리
            <div key={item.serialnum} className="text-sm">
              {item.infoname && <strong>{item.infoname}: </strong>}
              {item.infotext}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TourDetail = () => {
  const { state } = useLocation() as {
    state: {
      id: string;
      title: string;
      location: string;
      type: string | number;
      image: string;
      mapx: string;
      mapy: string;
    };
  };

  const navigate = useNavigate();

  const [common, setCommon] = useState<TourCommonResponse | null>(null);
  const [intro, setIntro] = useState<TourIntroResponse | null>(null);
  const [info, setInfo] = useState<TourInfoResponse[]>([]);
  const [images, setImages] = useState<TourImageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false); // overview 더보기

  useEffect(() => {
    if (!state) return;

    const fetchData = async () => {
      try {
        const [commonRes, introRes, infoRes, imageRes] = await Promise.all([
          getTourCommon(state.id),
          getTourIntro(state.id, String(state.type)),
          getTourInfo(state.id, String(state.type)),
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

  const heroImage = common?.firstimage || image || "https://placehold.co/1200x600/png";
  const prettyType = contentTypeLabel[String(type)] || "정보";
  const phoneText = formatTel(common?.tel);
  const homepage = common?.homepage?.includes("http") ? common?.homepage : common?.homepage ? `https://${common?.homepage}` : "";

  // 이용안내(반복정보) 섹션을 그룹화 (fldgubun 기준)
  const infoGrouped = useMemo(() => {
    const map = new Map<string, TourInfoResponse[]>();
    info.forEach((row) => {
      const key = row.fldgubun || "기타";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [info]);

  // 길찾기/공유/복사 등
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapy},${mapx}`;
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("링크가 클립보드에 복사되었습니다.");
    } catch {
      // noop
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50">
      {/* 상단 검색바 영역 */}
      <section className="bg-gradient-to-r  to-rose-500 py-5 px-6">
        <div className="max-w-6xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* 히어로 */}
      <header className="relative w-full h-[360px] md:h-[420px]">
        <img src={heroImage} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 pb-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs rounded-full bg-white/20 backdrop-blur">{prettyType}</span>
            {common?.areacode && <span className="px-2 py-1 text-xs rounded-full bg-white/20 backdrop-blur">지역코드 {common.areacode}</span>}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow">{common?.title || title}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm md:text-base text-gray-200">
            <MapPin className="w-4 h-4" />
            {common?.addr1 || location}
            {common?.addr2 ? ` ${common.addr2}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {common?.cpyrhtDivCd && <span className="text-xs px-2 py-1 rounded bg-white/15">저작권: {common.cpyrhtDivCd}</span>}
            {(common?.createdtime || common?.modifiedtime) && (
              <span className="text-xs px-2 py-1 rounded bg-white/15 flex items-center gap-1">
                <Clock4 className="w-3 h-3" />
                {common?.modifiedtime ? `업데이트 ${common.modifiedtime}` : `생성 ${common?.createdtime}`}
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
                    <a href={homepage} target="_blank" className="text-blue-600 hover:underline inline-flex items-center gap-1">
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
              {intro?.parking && kv("주차", intro.parking)}
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
                            <img key={idx} src={src!} alt={item[`roomimg${idx + 1}alt`] || "객실 이미지"} className="rounded-md h-28 w-full object-cover" />
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
                {images.map((img) => (
                  <a key={img.serialnum} href={img.originimgurl} target="_blank" className="block group" title={img.imgname}>
                    <img
                      src={img.smallimageurl || img.originimgurl}
                      alt={img.imgname}
                      className="w-full h-40 object-cover rounded-xl ring-1 ring-gray-100 shadow-sm group-hover:opacity-90 transition"
                    />
                  </a>
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
        <aside className="lg:sticky lg:top-6 h-max space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <MapPinned className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold">위치 & 길찾기</h3>
            </div>
            <div className="p-4">
              <div className="rounded-xl overflow-hidden ring-1 ring-gray-100">
                <TourMap lat={parseFloat(mapy)} lng={parseFloat(mapx)} title={title} location={location} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={mapsSearchUrl} target="_blank" className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  <MapPin className="w-4 h-4" />
                  길찾기
                </a>
                <button onClick={() => copyToClipboard(window.location.href)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                  <Share2 className="w-4 h-4" />
                  공유
                </button>
                <a
                  href={phoneText ? `tel:${phoneText}` : undefined}
                  onClick={(e) => !phoneText && e.preventDefault()}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${phoneText ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-100 text-gray-400"}`}
                  title={phoneText ? "전화 걸기" : "전화 정보 없음"}
                >
                  <Phone className="w-4 h-4" />
                  전화
                </a>
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
            </div>
          </div>

          {/* ID/좌표 요약 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="text-gray-500">콘텐츠 ID</div>
              <div className="text-gray-800">{id}</div>
              <div className="text-gray-500">분류</div>
              <div className="text-gray-800">{prettyType}</div>
              <div className="text-gray-500">위도</div>
              <div className="text-gray-800">{mapy}</div>
              <div className="text-gray-500">경도</div>
              <div className="text-gray-800">{mapx}</div>
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
