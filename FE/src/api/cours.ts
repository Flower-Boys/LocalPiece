// src/api/courses.ts
import apiClient from "./client";
import type { VisitCreateRequest } from "@/types/aiTravel";
import type {
  GetPublicSavedCoursesParams,
  MyTripSummary,
  TripResponse,
  CourseDetailResponse,
  DayPlan,
  SaveCourseRequest,
  SaveCourseResponse,
  GeneratedTripResponse,
  Course,
  PageResponse,
  SavedCourseSummary,
} from "@/types/aiTravel";
export type CityMeta = { code: number; name: string };

// ------ 삭제 API ------
export const deleteSavedCourse = async (contentId: string | number) => {
  const res = await apiClient.delete<void>(`/saved-courses/${contentId}`);
  console.log(res);
  return res.data;
};

// ------ 기존: 마이페이지 조회 ------
export const getMyCourses = async () => {
  const res = await apiClient.get<MyTripSummary[]>(`/saved-courses`);
  console.log(res);
  return res.data;
};

// ------ 기존: 생성/조회 ------
export const coursesGenerate = async (payload: VisitCreateRequest) => {
  const { data } = await apiClient.post<TripResponse>("/courses/generate", payload);
  return data;
};

export const getCourseDetail = async (contentId: string) => {
  const res = await apiClient.get<CourseDetailResponse>(`/public/saved-courses/${contentId}`);
  console.log(res);
  return res.data;
};

export const getCourseGetAll = async () => {
  const res = await apiClient.get<CourseDetailResponse[]>(`/saved-courses`);
  console.log(res);
  return res.data;
};

// ------ (수정) 문자열 sanitize + 타입 내로잉 유틸 ------

// 최소 sanitize
const cleanStr = (v: unknown) => (typeof v === "string" ? v.replace(/,\s*A$/g, "").trim() : v);

// 타입 내로잉: YYYY-MM-DD
const asDateString = (v: unknown): `${number}-${number}-${number}` => {
  const s = String(v).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error(`Invalid DateString: ${s}`);
  }
  return s as `${number}-${number}-${number}`;
};

// 타입 내로잉: HH:mm
const asTimeString = (v: unknown): `${number}${number}:${number}${number}` => {
  const s = String(v).trim();
  if (!/^\d{2}:\d{2}$/.test(s)) {
    throw new Error(`Invalid TimeString: ${s}`);
  }
  return s as `${number}${number}:${number}${number}`;
};

// 숫자 보정(문자열 숫자도 number로)
const asNumber = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number: ${v}`);
  }
  return n;
};

// ------ (수정) 생성 응답 → 저장 요청 직렬화 ------

export const toSaveCourseRequest = (
  trip: GeneratedTripResponse,
  option: Course,
  payload: VisitCreateRequest,
  cityMeta: CityMeta[] // ⬅ 추가
): SaveCourseRequest => {
  const days = option.days.map((d) => ({
    day: asNumber(d.day),
    date: asDateString(cleanStr(d.date)),
    route: d.route.map((r) => ({
      order: asNumber(r.order),
      type: r.type,
      name: String(cleanStr(r.name)),
      category: String(cleanStr(r.category)),
      address: String(cleanStr(r.address)),
      content_id: asNumber(r.content_id),
      arrival_time: asTimeString(cleanStr(r.arrival_time)),
      departure_time: asTimeString(cleanStr(r.departure_time)),
      duration_minutes: asNumber(r.duration_minutes),
    })),
  }));

  // ✅ 동적 타이틀 생성
  const dynamicTitle = buildDynamicTitle(payload, cityMeta);

  return {
    tripTitle: dynamicTitle, // ✅ 여기!
    courseOption: {
      days,
      theme_title: option.theme_title, // 백엔드 규격 유지
    },
  };
};

// ------ (추가) 저장 API ------
// POST /courses/saved-courses
export const saveCourseOption = async (payload: SaveCourseRequest) => {
  const { data } = await apiClient.post<SaveCourseResponse>("/saved-courses", payload);
  return data;
};

export const generateAndSaveAll = async (payload: VisitCreateRequest, CityMeta: CityMeta[]) => {
  const generated = await coursesGenerate(payload);
  console.log(payload);
  console.log("Generated trip:", generated);
  console.log("CityMeta:", CityMeta);

  const results: {
    index: number;
    themeTitle: string;
    ok: boolean;
    data?: SaveCourseResponse;
    error?: unknown;
  }[] = [];

  for (let i = 0; i < generated.courses.length; i++) {
    const course = generated.courses[i];
    // ⬇ CityMeta 추가 전달
    const req = toSaveCourseRequest(generated, course, payload, CityMeta);

    try {
      const data = await saveCourseOption(req);
      results.push({ index: i, themeTitle: course.theme_title, ok: true, data });
    } catch (error) {
      results.push({ index: i, themeTitle: course.theme_title, ok: false, error });
    }
  }

  return { generated, results };
};

// ------ (추가) 공개된 저장된 코스 조회 API ------
export async function getPublicSavedCourses(params: GetPublicSavedCoursesParams = {}) {
  const { page = 0, size = 10, sort = "createdAt,desc" } = params;

  // axios는 같은 key를 배열로 넘기면 &sort=a&sort=b 형태로 직렬화됨
  const res = await apiClient.get<PageResponse<SavedCourseSummary>>("/public/saved-courses", { params: { page, size, sort } });

  return res.data;
}

// ------ (추가) 동적 타이틀 빌더 ------
const calcNightsDays = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.getTime() - s.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1; // 같은 날이면 1일
  const nights = Math.max(0, days - 1);
  return { nights, days };
};

const buildCityPart = (codes: number[], metas: CityMeta[]) => {
  const names = codes.map((code) => metas.find((m) => m.code === code)?.name).filter(Boolean) as string[];
  if (names.length === 0) return "미정";
  if (names.length === 1) return names[0];
  return `${names[0]} 외 ${names.length - 1}곳`;
};
// 마지막 글자 받침 유무로 '과/와' 결정
const josaGW = (word: string) => {
  if (!word) return "와";
  const ch = word.charAt(word.length - 1);
  const code = ch.charCodeAt(0);
  // 한글 범위 외면 기본 '와'
  if (code < 0xac00 || code > 0xd7a3) return "와";
  const jong = (code - 0xac00) % 28;
  return jong === 0 ? "와" : "과";
};

const buildCompanionPhrase = (companions: VisitCreateRequest["companions"]) => {
  if (companions === "혼자") {
    return "혼자 떠나는"; // ✅ '함께' 금지
  }
  // 예: "커플/친구와 함께 하는", "가족과 함께 하는"
  return `${companions}${josaGW(companions)} 함께 하는`;
};

const buildKeywordPart = (keywords: VisitCreateRequest["keywords"]) => {
  if (!keywords || keywords.length === 0) return "여행";
  // “맛집여행!” 처럼 자연스럽게 붙여 쓰고, 2개 이상이면 가운데 점으로 구분
  return keywords.length === 1 ? `${keywords[0]}여행` : `${keywords.join("·")} 여행`;
};

/** 예: "0박 1일! 구미시 커플/친구와 함께 하는 맛집여행!" */
export const buildDynamicTitle = (payload: VisitCreateRequest, cityMeta: CityMeta[]) => {
  const { nights, days } = calcNightsDays(payload.start_date, payload.end_date);
  const cityPart = buildCityPart(payload.cities, cityMeta);
  const companionPhrase = buildCompanionPhrase(payload.companions);
  const keywordPart = buildKeywordPart(payload.keywords);
  return `${nights}박 ${days}일! ${cityPart} ${companionPhrase} ${keywordPart}!`;
};
