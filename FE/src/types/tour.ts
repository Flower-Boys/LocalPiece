// 백엔드의 SigunguCodeDto와 일치하는 타입
export interface SigunguCode {
  code: string;
  name: string;
}

// 백엔드의 TourItemDto와 일치하는 타입
export interface TourItem {
  id: string;
  title: string;
  address: string;
  firstimage: string;
  mapX: string;
  mapY: string;
}
