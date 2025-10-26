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

export const toSaveCourseRequest = (trip: GeneratedTripResponse, option: Course, payload: VisitCreateRequest): SaveCourseRequest => {
  const days = option.days.map((d) => ({
    day: asNumber(d.day),
    date: asDateString(cleanStr(d.date)), // ✅ DateString으로 내로잉
    route: d.route.map((r) => ({
      order: asNumber(r.order),
      type: r.type, // "spot" | "meal"
      name: String(cleanStr(r.name)),
      category: String(cleanStr(r.category)),
      address: String(cleanStr(r.address)),
      content_id: asNumber(r.content_id),
      arrival_time: asTimeString(cleanStr(r.arrival_time)), // ✅ TimeString 내로잉
      departure_time: asTimeString(cleanStr(r.departure_time)), // ✅ TimeString 내로잉
      duration_minutes: asNumber(r.duration_minutes),
    })),
  }));

  return {
    tripTitle: trip.trip_title, // snake -> camel
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
    const req = toSaveCourseRequest(generated, course, payload);

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
