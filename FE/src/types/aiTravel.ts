export type CategoryKey = "산" | "바다" | "캠핑" | "힐링" | "먹거리" | "도심" | "문화";
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
