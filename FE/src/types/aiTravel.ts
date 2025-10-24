export type CategoryKey = "역사/문화" | "휴식/힐링" | "자연" | "맛집" | "액티비티/체험" | "쇼핑";
export type AllTag = "전체" | CategoryKey;



export interface RouteCardItem {
  id: string;
  title: string;
  city: string;
  days: number;
  distanceKm: number;
  tags: CategoryKey[];
  cover: string;
  stops: string[];
  rating: number;
  liked?: boolean;
}

// 키워드에 "쇼핑" 추가

export interface VisitCreateRequest {
  cities: number[];              // 시군구 코드 리스트
  start_date: string;            // "YYYY-MM-DD"
  end_date: string;              // "YYYY-MM-DD"
  keywords: CategoryKey[];       // ["역사/문화", ...]
  companions: "커플/친구" | "가족" | "혼자";
  pacing: "여유롭게" | "보통" | "빠르게";
  must_visit_spots?: number[];   // optional
}


// ===== Primitive branded types =====
type DateString = `${number}-${number}-${number}`;       // "2025-10-26"
type TimeString = `${number}${number}:${number}${number}`; // "09:00"

// ===== Category candidates (선택) =====
const SPOT_CATEGORIES = [
  "사찰",
  "유적지/사적지",
  "수목원",
  "카페/전통찻집",
  "전시관",
  "도서관",
] as const;
type SpotCategory = (typeof SPOT_CATEGORIES)[number] | string; // 미정 값 대비 여유

const MEAL_CATEGORIES = ["한식"] as const;
type MealCategory = (typeof MEAL_CATEGORIES)[number] | string;

// ===== Base & unions =====
interface RouteBase {
  order: number;
  type: "spot" | "meal";
  name: string;
  category: string; // 분기 타입에서 좁혀짐
  address: string;
  content_id: number;
  arrival_time: TimeString;
  departure_time: TimeString;
  duration_minutes: number;
}

export interface SpotRoute extends RouteBase {
  type: "spot";
  category: SpotCategory;
}

export interface MealRoute extends RouteBase {
  type: "meal";
  category: MealCategory;
}

export type RouteItem = SpotRoute | MealRoute;

export interface DayPlan {
  day: number;              // 1, 2, ...
  date: DateString;         // "YYYY-MM-DD"
  route: RouteItem[];
}

export interface Course {
  days: DayPlan[];
  theme_title: string;
}

export interface TripResponse {
  courses: Course[];
  trip_title: string;
}


