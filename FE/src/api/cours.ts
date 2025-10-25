// src/api/courses.ts
import apiClient from "./client";
import type { VisitCreateRequest } from "@/types/aiTravel";
import type { TripResponse, CourseDetailResponse, DayPlan, SaveCourseRequest, SaveCourseResponse, GeneratedTripResponse, Course } from "@/types/aiTravel";

// ------ 기존: 생성/조회 ------
export const coursesGenerate = async (payload: VisitCreateRequest) => {
  const { data } = await apiClient.post<TripResponse>("/courses/generate", payload);
  return data;
};

export const getCourseDetail = async (contentId: string) => {
  const res = await apiClient.get<CourseDetailResponse>(`/saved-courses/${contentId}`);
  console.log(res);
  return res.data;
};

export const getCourseGetAll = async () => {
  const res = await apiClient.get<CourseDetailResponse[]>(`/saved-courses`);
  console.log(res);
  return res.data;
}

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

export const toSaveCourseRequest = (trip: GeneratedTripResponse, option: Course): SaveCourseRequest => {
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

export const generateAndSaveAll = async (payload: VisitCreateRequest) => {
  const generated = await coursesGenerate(payload);

  const results: {
    index: number;
    themeTitle: string;
    ok: boolean;
    data?: SaveCourseResponse;
    error?: unknown;
  }[] = [];

  for (let i = 0; i < generated.courses.length; i++) {
    const course = generated.courses[i];
    const req = toSaveCourseRequest(generated, course);

    try {
      const data = await saveCourseOption(req);
      results.push({ index: i, themeTitle: course.theme_title, ok: true, data });
    } catch (error) {
      results.push({ index: i, themeTitle: course.theme_title, ok: false, error });
    }
  }

  return { generated, results };
};
