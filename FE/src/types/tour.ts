// 백엔드의 SigunguCodeDto와 일치하는 타입
export interface SigunguCode {
  code: string;
  name: string;
}

// 백엔드 응답 DTO랑 일치시킴
export interface TourItem {
  contentid: string;
  title: string;
  addr1: string;
  contenttypeid: string | number;
  firstimage: string;
  mapx: string;
  mapy: string;
}

// ✅ 관광지 공통정보 타입(1)
export interface TourCommonResponse {
  contentid: string;
  contenttypeid: string;
  title: string;
  createdtime: string;
  modifiedtime: string;
  tel: string;
  telname: string;
  homepage: string;
  firstimage: string;
  firstimage2: string;
  cpyrhtDivCd: string;
  areacode: string;
  sigungucode: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  overview: string;
}

// ✅ 소개정보 조회 응답 타입 (contentTypeId=12 예시 기준) (2)
export interface TourIntroResponse {
  contentid: string;
  contenttypeid: string;
  accomcount: string | null;
  chkbabycarriage: string | null;
  chkcreditcard: string | null;
  chkpet: string | null;
  expagerange: string | null;
  expguide: string | null;
  heritage1: string;
  heritage2: string;
  heritage3: string;
  infocenter: string | null;
  opendate: string | null;
  parking: string | null;
  restdate: string | null;
  useseason: string | null;
  usetime: string | null;
  // ⚠️ contentTypeId 값에 따라 더 많은 필드가 존재할 수 있음 → 확장 가능하게 any 포함
  [key: string]: any;
}


// ✅ 반복정보 조회 응답 타입  (3)
export interface TourInfoResponse {
  contentid: string;
  contenttypeid: string;
  fldgubun: string;   // 구분 코드 (ex. 3 = 이용안내)
  infoname: string;   // 정보명 (ex. 입장료, 화장실)
  infotext: string;   // 정보 내용 (ex. 무료, 있음)
  serialnum: string;  // 순번
  [key: string]: any; // 다른 contentTypeId에서 추가 필드가 있을 수 있음
}


// ✅ 이미지정보 조회 응답 타입  (4)
export interface TourImageResponse {
  contentid: string;
  imgname: string;        // 이미지 이름
  originimgurl: string;   // 원본 이미지 URL
  serialnum: string;      // 고유 시리얼 번호
  cpyrhtDivCd: string;    // 저작권 구분 코드
  smallimageurl: string;  // 썸네일 이미지 URL
}