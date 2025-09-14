// 백엔드의 SigunguCodeDto와 일치하는 타입
export interface SigunguCode {
  code: string;
  name: string;
}

// 백엔드의 TourItemDto와 일치하는 타입
export interface TourItem {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  mapx: string;
  mapy: string;
}
